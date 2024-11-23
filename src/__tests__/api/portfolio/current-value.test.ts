import { NextRequest, NextResponse } from 'next/server'
import { POST } from '@/app/api/portfolio/[id]/current-value/route'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

jest.mock('@/src/services/portfolio')

describe('POST /api/portfolio/[id]/current-value', () => {
  const mockRequest = (body: any): NextRequest => {
    const url = new URL('http://localhost/api/portfolio/1/current-value')
    return new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(portfolioService, 'savePortfolioHistory').mockResolvedValue()
  })

  it('should update current value successfully', async () => {
    const response = await POST(mockRequest({ totalValue: 1000 }), {
      params: { id: '1' }
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(portfolioService.savePortfolioHistory).toHaveBeenCalledWith({
      portfolioId: 1,
      totalValue: 1000,
      period: Period.CURRENT
    })
  })

  it('should validate totalValue', async () => {
    const response = await POST(mockRequest({ totalValue: 'invalid' }), {
      params: { id: '1' }
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Total value is required and must be a number')
  })

  it('should handle errors', async () => {
    jest.spyOn(portfolioService, 'savePortfolioHistory')
      .mockRejectedValue(new Error('Database error'))

    const response = await POST(mockRequest({ totalValue: 1000 }), {
      params: { id: '1' }
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })
})