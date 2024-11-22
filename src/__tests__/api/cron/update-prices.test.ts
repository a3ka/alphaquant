import { NextRequest, NextResponse } from 'next/server'
import { GET } from '@/app/api/cron/update-prices/route'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period, PortfolioBalance } from '@/src/types/portfolio.types'

jest.mock('@/src/services/portfolio')
jest.mock('@/src/services/market')

describe('GET /api/cron/update-prices', () => {
  const mockRequest = (auth?: string): NextRequest => {
    const headers = new Headers()
    if (auth) {
      headers.set('Authorization', auth)
    }
    return new NextRequest('http://localhost/api/cron/update-prices', {
      headers
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
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
    jest.spyOn(marketService, 'updateCryptoMetadata').mockResolvedValue()
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([
      { id: 1 },
      { id: 2 }
    ])
    jest.spyOn(portfolioService, 'updatePortfolioData').mockResolvedValue(1000)
    jest.spyOn(portfolioService, 'getPeriodsToUpdate').mockReturnValue([Period.MINUTE_15])
    jest.spyOn(portfolioService, 'savePortfolioHistory').mockResolvedValue()

    const response = await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats.totalPortfolios).toBe(2)
    expect(data.stats.updatedPortfolios).toBe(2)
  })

  it('should handle missing metadata for stablecoins', async () => {
    const mockBalances: PortfolioBalance[] = [
      {
        id: 1,
        portfolio_id: 1,
        coin_ticker: 'USDT',
        amount: 1000,
        borrowed: 0,
        in_collateral: 0,
        last_updated: new Date().toISOString(),
        metadata: {
          name: 'USDT',
          logo: '/images/default-coin.png',
          current_price: 1,
          price_change_24h: 0
        }
      },
      {
        id: 2,
        portfolio_id: 1,
        coin_ticker: 'USDC',
        amount: 2000,
        borrowed: 0,
        in_collateral: 0,
        last_updated: new Date().toISOString(),
        metadata: {
          name: 'USDC',
          logo: '/images/default-coin.png',
          current_price: 1,
          price_change_24h: 0
        }
      }
    ]

    jest.spyOn(marketService, 'updateCryptoMetadata').mockResolvedValue()
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([{ id: 1 }])
    jest.spyOn(portfolioService, 'getPortfolioBalances').mockResolvedValue({
      balances: mockBalances,
      isEmpty: false
    })
    
    jest.spyOn(portfolioService, 'updatePortfolioData').mockResolvedValue(1000)
    jest.spyOn(portfolioService, 'getPeriodsToUpdate').mockReturnValue([Period.MINUTE_15])
    jest.spyOn(portfolioService, 'savePortfolioHistory').mockResolvedValue()

    const response = await GET(mockRequest(`Bearer ${process.env.CRON_SECRET}`))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats.totalPortfolios).toBe(1)
    expect(data.stats.updatedPortfolios).toBe(1)
  })
})