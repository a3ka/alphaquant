import { portfolioService } from '@/src/services/portfolio'
import { createServerSupabaseClient } from '@/src/services/supabase/server'
import { Period } from '@/src/types/portfolio.types'

jest.mock('@/src/services/supabase/server')

describe('portfolioService', () => {
  const mockEqChain = {
    eq: jest.fn().mockReturnThis()
  }

  const mockFromResult = {
    delete: jest.fn(() => mockEqChain),
    insert: jest.fn().mockResolvedValue({ error: null })
  }

  const mockSupabase = {
    from: jest.fn(() => mockFromResult)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
    
    // Настраиваем последний вызов eq для возврата результата
    mockEqChain.eq.mockImplementationOnce(() => mockEqChain)
    mockEqChain.eq.mockImplementationOnce(() => ({ error: null }))
  })

  describe('savePortfolioHistory', () => {
    it('should delete previous CURRENT record before saving new one', async () => {
      await portfolioService.savePortfolioHistory({
        portfolioId: 1,
        totalValue: 1000,
        period: Period.CURRENT
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_history')
      expect(mockFromResult.delete).toHaveBeenCalled()
      expect(mockEqChain.eq).toHaveBeenCalledWith('portfolio_id', 1)
      expect(mockEqChain.eq).toHaveBeenCalledWith('period', Period.CURRENT)
      expect(mockFromResult.insert).toHaveBeenCalled()
    })
  })

  describe('deleteCurrentValue', () => {
    it('should delete CURRENT record', async () => {
      await portfolioService.deleteCurrentValue(1)

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_history')
      expect(mockFromResult.delete).toHaveBeenCalled()
      expect(mockEqChain.eq).toHaveBeenCalledWith('portfolio_id', 1)
      expect(mockEqChain.eq).toHaveBeenCalledWith('period', Period.CURRENT)
    })
  })
})