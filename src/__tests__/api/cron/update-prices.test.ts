import { NextRequest } from 'next/server'
import { GET } from '@/app/api/cron/update-prices/route'
import { portfolioService } from '@/src/services/portfolio'
import { marketService } from '@/src/services/market'
import { Period } from '@/src/types/portfolio.types'
import { MockNextRequest } from '@/jest.setup'

jest.mock('@/src/services/portfolio')
jest.mock('@/src/services/market')

describe('GET /api/cron/update-prices', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.setSystemTime(new Date(2024, 0, 1, 0, 0))
    
    // Default mocks
    jest.spyOn(marketService, 'updateCryptoMetadata').mockResolvedValue()
    jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([])
    jest.spyOn(portfolioService, 'processBatch').mockResolvedValue({
      success: true,
      updatedPortfolios: 0,
      savedHistoryRecords: 0,
      executionTime: 1000
    })
    jest.spyOn(portfolioService, 'calculateBatchSize').mockReturnValue(2)
    jest.spyOn(portfolioService, 'triggerNextBatch').mockResolvedValue(true)
  })

  const createRequest = (options: { 
    auth?: string, 
    batch?: number, 
    force?: string,
    prevTime?: number 
  } = {}) => {
    const urlParams = new URLSearchParams()
    if (typeof options.batch === 'number') {
      urlParams.set('batch', options.batch.toString())
    }
    if (options.force) {
      urlParams.set('force', options.force)
    }
    if (typeof options.prevTime === 'number') {
      urlParams.set('prevTime', options.prevTime.toString())
    }

    const url = `http://localhost/api/cron/update-prices?${urlParams.toString()}`
    const headers: HeadersInit = {}
    if (options.auth) {
      headers['Authorization'] = `Bearer ${options.auth}`
    }

    return new MockNextRequest(url, { headers })
  }

  describe('Authentication', () => {
    const auth = 'test-secret'

    beforeEach(() => {
      process.env.CRON_SECRET = auth
    })

    it('should return 401 without auth header', async () => {
      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 401 with invalid auth token', async () => {
      const response = await GET(createRequest({ auth: 'wrong-token' }))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should process request with valid auth token', async () => {
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(marketService.updateCryptoMetadata).toHaveBeenCalled()
      expect(portfolioService.getAllActivePortfolios).toHaveBeenCalled()
    })
  })

  describe('Batch processing', () => {
    const auth = 'test-secret'
    const mockPortfolios = [
      { id: 1, is_active: true },
      { id: 2, is_active: true },
      { id: 3, is_active: true },
      { id: 4, is_active: true }
    ]

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue(mockPortfolios)
    })

    it('should process first batch correctly', async () => {
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stats).toEqual(expect.objectContaining({
        batchNumber: 0,
        batchSize: 2,
        totalBatches: 2,
        remainingBatches: 1
      }))
      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        [1, 2],
        expect.any(Array),
        expect.any(Number)
      )
    })

    it('should return completion message for last batch', async () => {
      const response = await GET(createRequest({ auth, batch: 2 }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('All batches processed')
      expect(data.stats.totalPortfolios).toBe(mockPortfolios.length)
    })
  })

  describe('Update periods', () => {
    const auth = 'test-secret'

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      jest.spyOn(portfolioService, 'getPeriodsToUpdate').mockReturnValue([Period.MINUTE_15])
    })

    it('should use default periods based on current time', async () => {
      const response = await GET(createRequest({ auth }))
      await response.json()

      expect(portfolioService.getPeriodsToUpdate).toHaveBeenCalledWith(0, 0)
      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15],
        expect.any(Number)
      )
    })

    it('should use forced periods when force parameter is provided', async () => {
      const response = await GET(createRequest({ auth, force: 'hour' }))
      await response.json()

      expect(portfolioService.getPeriodsToUpdate).not.toHaveBeenCalled()
      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_1],
        expect.any(Number)
      )
    })
  })

  describe('Error handling', () => {
    const auth = 'test-secret'

    beforeEach(() => {
      process.env.CRON_SECRET = auth
    })

    it('should handle metadata update errors gracefully', async () => {
      jest.spyOn(marketService, 'updateCryptoMetadata')
        .mockRejectedValue(new Error('API error'))

      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle batch processing errors', async () => {
      jest.spyOn(portfolioService, 'processBatch')
        .mockRejectedValue(new Error('Processing error'))

      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Processing error')
      expect(data.stats.executionTime).toBeGreaterThan(0)
    })
  })

  describe('Time-based update periods', () => {
    const auth = 'test-secret'

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      jest.spyOn(portfolioService, 'getPeriodsToUpdate').mockImplementation((minutes, hours) => {
        const periods = []
        if (minutes % 15 === 0) periods.push(Period.MINUTE_15)
        if (minutes === 0) periods.push(Period.HOUR_1)
        if (minutes === 0 && hours % 4 === 0) periods.push(Period.HOUR_4)
        if (minutes === 0 && hours === 0) periods.push(Period.HOUR_24)
        return periods
      })
    })

    it('should update all periods at midnight', async () => {
      jest.setSystemTime(new Date(2024, 0, 1, 0, 0))
      const response = await GET(createRequest({ auth }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_1, Period.HOUR_4, Period.HOUR_24],
        expect.any(Number)
      )
    })

    it('should update 15min and 1hour periods at start of hour', async () => {
      jest.setSystemTime(new Date(2024, 0, 1, 1, 0))
      const response = await GET(createRequest({ auth }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_1],
        expect.any(Number)
      )
    })

    it('should update only 15min period at quarter hour', async () => {
      jest.setSystemTime(new Date(2024, 0, 1, 1, 15))
      const response = await GET(createRequest({ auth }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15],
        expect.any(Number)
      )
    })

    it('should update 15min and 4hour periods at 4-hour mark', async () => {
      jest.setSystemTime(new Date(2024, 0, 1, 4, 0))
      const response = await GET(createRequest({ auth }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_1, Period.HOUR_4],
        expect.any(Number)
      )
    })
  })

  describe('Time-based periods and batches', () => {
    const auth = 'test-secret'
    const mockPortfolios = [
      { id: 1, is_active: true },
      { id: 2, is_active: true },
      { id: 3, is_active: true },
      { id: 4, is_active: true }
    ]

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue(mockPortfolios)
    })

    it('should process first batch with all periods at midnight', async () => {
      jest.setSystemTime(new Date(2024, 0, 1, 0, 0))
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        [1, 2],
        [Period.MINUTE_15, Period.HOUR_1, Period.HOUR_4, Period.HOUR_24],
        expect.any(Number)
      )
      expect(data.stats.batchNumber).toBe(0)
      expect(data.stats.totalBatches).toBe(2)
    })

    it('should process second batch with forced period', async () => {
      const response = await GET(createRequest({ 
        auth,
        batch: 1,
        force: 'hour'
      }))
      const data = await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        [3, 4],
        [Period.MINUTE_15, Period.HOUR_1],
        expect.any(Number)
      )
      expect(data.stats.batchNumber).toBe(1)
      expect(data.stats.remainingBatches).toBe(0)
    })

    it('should adjust batch size based on previous execution time', async () => {
      const response = await GET(createRequest({ 
        auth,
        prevTime: 5000 // 5 seconds
      }))
      const data = await response.json()

      expect(portfolioService.calculateBatchSize)
        .toHaveBeenCalledWith(mockPortfolios.length, 5000)
      expect(data.stats.batchSize).toBe(2)
    })
  })

  describe('Forced update periods', () => {
    const auth = 'test-secret'
    const mockPortfolios = [
      { id: 1, is_active: true },
      { id: 2, is_active: true }
    ]

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue(mockPortfolios)
    })

    it('should force hour update', async () => {
      const response = await GET(createRequest({ auth, force: 'hour' }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_1],
        expect.any(Number)
      )
    })

    it('should force hour4 update', async () => {
      const response = await GET(createRequest({ auth, force: 'hour4' }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_4],
        expect.any(Number)
      )
    })

    it('should force hour24 update', async () => {
      const response = await GET(createRequest({ auth, force: 'hour24' }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15, Period.HOUR_24],
        expect.any(Number)
      )
    })

    it('should only update MINUTE_15 with invalid force parameter', async () => {
      const response = await GET(createRequest({ auth, force: 'invalid' }))
      await response.json()

      expect(portfolioService.processBatch).toHaveBeenCalledWith(
        expect.any(Array),
        [Period.MINUTE_15],
        expect.any(Number)
      )
    })
  })

  describe('Edge cases and error handling', () => {
    const auth = 'test-secret'
    const mockPortfolios = [
      { id: 1, is_active: true },
      { id: 2, is_active: true }
    ]

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue(mockPortfolios)
    })

    it('should handle processBatch partial success', async () => {
      jest.spyOn(portfolioService, 'processBatch').mockResolvedValue({
        success: false,
        updatedPortfolios: 1,
        savedHistoryRecords: 1,
        executionTime: 1000,
        errors: ['Failed to update portfolio 2']
      })

      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.stats.errors).toEqual(['Failed to update portfolio 2'])
      expect(data.stats.updatedPortfolios).toBe(1)
    })

    it('should handle getAllActivePortfolios returning empty array', async () => {
      jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue([])
      
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('All batches processed')
      expect(data.stats.totalPortfolios).toBe(0)
    })
  })

  describe('Next batch triggering', () => {
    const auth = 'test-secret'
    const mockPortfolios = [
      { id: 1, is_active: true },
      { id: 2, is_active: true },
      { id: 3, is_active: true },
      { id: 4, is_active: true }
    ]

    beforeEach(() => {
      process.env.CRON_SECRET = auth
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost'
      jest.spyOn(portfolioService, 'getAllActivePortfolios').mockResolvedValue(mockPortfolios)
      jest.spyOn(portfolioService, 'processBatch').mockResolvedValue({
        success: true,
        updatedPortfolios: 2,
        savedHistoryRecords: 2,
        executionTime: 1000
      })
      jest.spyOn(portfolioService, 'triggerNextBatch').mockResolvedValue(true)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should trigger next batch with correct parameters', async () => {
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(portfolioService.triggerNextBatch).toHaveBeenCalledWith(
        'http://localhost',
        0,
        1000,
        auth
      )
    })

    it('should handle triggerNextBatch failure gracefully', async () => {
      const mockTrigger = jest.spyOn(portfolioService, 'triggerNextBatch')
      mockTrigger.mockRejectedValue(new Error('Network error'))
      
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stats.batchNumber).toBe(0)
      expect(data.stats.remainingBatches).toBe(1)
    })

    it('should not trigger next batch for last batch', async () => {
      const response = await GET(createRequest({ 
        auth,
        batch: 1 // Последний батч для 4 портфелей с размером батча 2
      }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(portfolioService.triggerNextBatch).not.toHaveBeenCalled()
    })

    it('should use request origin when NEXT_PUBLIC_APP_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      
      const response = await GET(createRequest({ auth }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(portfolioService.triggerNextBatch).toHaveBeenCalledWith(
        'http://localhost',
        0,
        1000,
        auth
      )
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})