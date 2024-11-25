import { NextRequest, NextResponse } from 'next/server'
import { GET } from '@/app/api/cron/update-prices/route'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period, PortfolioBalance } from '@/src/types/portfolio.types'
import { MockResponse } from '../../../../jest.setup'

jest.mock('@/src/services/portfolio')
jest.mock('@/src/services/market')

describe('GET /api/cron/update-prices', () => {
  const mockRequest = (auth?: string, batch?: number): NextRequest => {
    const headers = new Headers()
    if (auth) {
      headers.set('Authorization', auth)
    }
    const url = new URL('http://localhost/api/cron/update-prices')
    if (typeof batch === 'number') {
      url.searchParams.set('batch', batch.toString())
    }
    return new NextRequest(url, { headers })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Базовые моки для всех тестов
    jest.spyOn(marketService, 'updateCryptoMetadata').mockResolvedValue()
    jest.spyOn(portfolioService, 'updatePortfolioData').mockResolvedValue(1000)
    jest.spyOn(portfolioService, 'getPeriodsToUpdate').mockReturnValue([Period.MINUTE_15])
    jest.spyOn(portfolioService, 'savePortfolioHistory').mockResolvedValue()
    jest.spyOn(portfolioService, 'deleteCurrentValue').mockResolvedValue()
    
    // Мок для fetch
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(new MockResponse()))
  })

  it('should return 401 for missing auth', async () => {
    const response = await GET(mockRequest())
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 401 for invalid auth', async () => {
    const response = await GET(mockRequest('Bearer invalid-secret'))
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should update portfolio values successfully', async () => {
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([
      { id: 1 },
      { id: 2 }
    ])

    const response = await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats.totalPortfolios).toBe(2)
    expect(data.stats.currentBatchSize).toBe(2)
    expect(data.stats.updatedPortfolios).toBe(2)
  })

  it('should handle missing metadata for stablecoins', async () => {
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([{ id: 1 }])

    const response = await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats.totalPortfolios).toBe(1)
    expect(data.stats.updatedPortfolios).toBe(1)
  })

  it('should process batches sequentially', async () => {
    // Мокаем 4 портфеля для двух батчей
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
    ])

    // Первый запрос (batch=0)
    const response1 = await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`))
    const data1 = await response1.json()

    expect(response1.status).toBe(200)
    expect(data1.success).toBe(true)
    expect(data1.stats.currentBatchSize).toBe(2)
    expect(data1.stats.remainingBatches).toBe(1)

    // Проверяем, что был вызван fetch для следующего батча
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/cron/update-prices?batch=1'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        })
      })
    )

    // Второй запрос (batch=1)
    const response2 = await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`, 1))
    const data2 = await response2.json()

    expect(response2.status).toBe(200)
    expect(data2.success).toBe(true)
    expect(data2.stats.currentBatchSize).toBe(2)
    expect(data2.stats.remainingBatches).toBe(0)
  })

  it('should handle errors gracefully', async () => {
    jest.spyOn(portfolioService, 'getAllActivePortfolios')
      .mockRejectedValue(new Error('Database error'))

    const request = mockRequest(`Bearer ${process.env.CRON_SECRET}`)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })

  it('should delete CURRENT value before saving regular periods', async () => {
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([{ id: 1 }])

    await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`))

    expect(portfolioService.deleteCurrentValue).toHaveBeenCalledWith(1)
    expect(portfolioService.savePortfolioHistory).toHaveBeenCalledWith({
      portfolioId: 1,
      totalValue: 1000,
      period: Period.MINUTE_15
    })
  })

  it('should handle force parameter correctly', async () => {
    const url = new URL('http://localhost/api/cron/update-prices')
    url.searchParams.set('force', 'hour4')
    const request = new NextRequest(url, {
      headers: new Headers({
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      })
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(portfolioService.savePortfolioHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        period: Period.HOUR_4
      })
    )
  })
})