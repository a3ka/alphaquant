import { createServerSupabaseClient } from '@/src/services/supabase/server'
import type { Portfolio, UserPortfolio, PortfolioHistory, PortfolioBalancesResponse, PortfolioId, PortfolioBalance, EnrichedPortfolioBalance, CoinMetadata, PortfolioUpdateResult, BatchResult } from '@/src/types/portfolio.types'
import { Period } from '@/src/types/portfolio.types'
import { marketService } from './market'
import { getPeriodByRange, getStartDate } from '@/src/utils/date'

// Добавляем в начало файла константы
const MIN_BATCH_SIZE = 2
const MAX_BATCH_SIZE = 50
const TARGET_EXECUTION_TIME = 5000

// Все существующие методы из portfolio-actions.ts
export const portfolioService = {
  // Получение портфелей
  async getUserPortfolios(userId: string): Promise<UserPortfolio[]> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("user_portfolio")
        .select(`
          id,
          user_id,
          name,
          type,
          description,
          is_active,
          created_time,
          balances:portfolio_balance (
            coin_ticker,
            amount,
            borrowed,
            in_collateral,
            last_updated
          )
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
  
      if (error) throw error
      return data as UserPortfolio[]
    } catch (error: any) {
      console.error('getUserPortfolios error:', error)
      return []
    }
  }, 

  // Обновление имени
  async updatePortfolioName(portfolioId: string, newName: string) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("user_portfolio")
        .update({ name: newName })
        .eq("id", portfolioId)
  
      if (error) throw error
    } catch (error: any) {
      console.error('Failed to update portfolio name:', error)
      throw new Error(error.message)
    }
  },

  // Создание портфеля
  async createPortfolio(
    userId: string,
    name: string,
    type: 'SPOT' | 'MARGIN',
    description?: string
  ): Promise<UserPortfolio> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("user_portfolio")
        .insert([{ 
          user_id: userId,
          name,
          description,
          type: type.toUpperCase(),
          is_active: true,
          created_time: new Date().toISOString()
        }])
        .select()
        .single()
  
      if (error) throw error
      return data as UserPortfolio
    } catch (error: any) {
      console.error('Failed to create portfolio:', error)
      throw new Error(error.message)
    }
  },

  // Удаление портфеля
  async deletePortfolio(portfolioId: PortfolioId) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("user_portfolio")
        .delete()
        .eq("id", portfolioId)
  
      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  }, 

  // Обновление баланса
  async updatePortfolioBalance(
    portfolioId: PortfolioId,
    coinTicker: string,
    amount: number,
    isMargin: boolean
  ) {
    try {
      const supabase = await createServerSupabaseClient();
  
      const { data: portfolio } = await supabase
        .from("user_portfolio")
        .select("type")
        .eq("id", portfolioId)
        .single();
  
      if (!portfolio) {
        throw new Error("Portfolio not found");
      }
  
      const { error } = await supabase
        .from("portfolio_balance")
        .upsert({
          portfolio_id: portfolioId,
          coin_ticker: coinTicker,
          amount: amount,
          in_collateral: isMargin ? amount : 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'portfolio_id,coin_ticker'
        });
  
      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to update portfolio balance:', error);
      throw new Error(error.message);
    }
  },

  // Деактивация портфеля
  async disablePortfolio(portfolioId: string) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("user_portfolio")
        .update({ is_active: false })
        .eq("id", portfolioId)
  
      if (error) throw error
    } catch (error: any) {
      console.error('Failed to disable portfolio:', error)
      throw new Error(error.message)
    }
  },


  async savePortfolioHistory(data: {
    portfolioId: number
    totalValue: number
    period: Period
  }) {
    try {
      console.log('Starting savePortfolioHistory:', {
        portfolioId: data.portfolioId,
        totalValue: data.totalValue,
        period: data.period,
        timestamp: new Date().toISOString()
      })
      
      const supabase = await createServerSupabaseClient()

      // Если сохраняем CURRENT запись, сначала удаляем предыдущую
      if (data.period === Period.CURRENT) {
        console.log('Deleting previous CURRENT record')
        const { error: deleteError } = await supabase
          .from("portfolio_history")
          .delete()
          .eq("portfolio_id", data.portfolioId)
          .eq("period", Period.CURRENT)

        if (deleteError) {
          console.error('Failed to delete previous CURRENT record:', deleteError)
          throw deleteError
        }
      }
      
      console.log('Inserting new portfolio history record')
      const { data: insertedData, error } = await supabase
        .from("portfolio_history")
        .insert({
          portfolio_id: data.portfolioId,
          total_value: data.totalValue,
          period: data.period,
          timestamp: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('Failed to save portfolio history:', error)
        throw error
      }
      
      console.log('Portfolio history saved successfully:', insertedData)
      return insertedData
    } catch (error) {
      console.error('Error in savePortfolioHistory:', error)
      throw error
    }
  },

  async getPortfolioBalances(portfolioId: string): Promise<PortfolioBalancesResponse> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data: balances, error } = await supabase
        .from("portfolio_balance")
        .select(`
          id,
          portfolio_id,
          coin_ticker,
          amount,
          borrowed,
          in_collateral,
          last_updated
        `)
        .eq("portfolio_id", portfolioId)

      if (error) throw error

      // Получаем метаданные для всех монет
      const enrichedBalances = await Promise.all(
        balances.map(async (balance) => {
          try {
            const metadata = await marketService.getCoinMetadata(balance.coin_ticker) as CoinMetadata | null
            return {
              ...balance,
              metadata: {
                name: metadata?.name || balance.coin_ticker,
                logo: metadata?.logo || '/images/default-coin.png',
                current_price: metadata?.current_price || 1,
                price_change_24h: metadata?.price_change_24h || 0
              }
            }
          } catch (error) {
            console.error(`Failed to fetch metadata for ${balance.coin_ticker}:`, error)
            return {
              ...balance,
              metadata: {
                name: balance.coin_ticker,
                logo: '/images/default-coin.png',
                current_price: 1,
                price_change_24h: 0
              }
            }
          }
        })
      )

      const hasNonZeroBalance = enrichedBalances.some(balance => 
        balance.amount > 0 || balance.borrowed > 0 || balance.in_collateral > 0
      )

      return {
        balances: enrichedBalances,
        isEmpty: !hasNonZeroBalance
      }

    } catch (error: any) {
      console.error('Failed to get portfolio balances:', error)
      throw new Error(error.message)
    }
  },

  async getPortfolioHistory(
    portfolioId: number, 
    period: Period, 
    startDate: Date
  ): Promise<PortfolioHistory[]> {
    if (!Object.values(Period).includes(period)) {
      throw new Error('Invalid period provided')
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("portfolio_history")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .eq("period", period)
      .gte("timestamp", startDate.toISOString())
      .order("timestamp", { ascending: true })
    
    if (error) throw error
    return data as PortfolioHistory[]
  },

  async cleanupOldHistory() {
    const supabase = await createServerSupabaseClient()
    const now = new Date()

    // Удаление старых записей по периодам
    const cleanupRules = [
      { period: Period.MINUTE_15, days: 2 },    // Храним 15-минутные данные за 2 дня
      { period: Period.HOUR_1, days: 7 },       // Часовые за неделю
      { period: Period.HOUR_4, days: 30 },      // 4-часовые за месяц
      { period: Period.HOUR_24, days: 365 }     // 24-часовые за год
    ]

    for (const rule of cleanupRules) {
      const cutoffDate = new Date(now.getTime() - rule.days * 24 * 60 * 60 * 1000)
      
      const { error } = await supabase
        .from("portfolio_history")
        .delete()
        .eq("period", rule.period)
        .lt("timestamp", cutoffDate.toISOString())

      if (error) throw error
    }
  },

  async getAllActivePortfolios() {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("user_portfolio")
        .select("*")
        .eq("is_active", true)

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Failed to get active portfolios:', error)
      throw new Error(error.message)
    }
  },

  getPeriodsToUpdate(minutes: number, hours: number): Period[] {
    const periods: Period[] = []
    
    // Каждые 15 минут (0, 15, 30, 45)
    if (minutes % 15 === 0) {
      periods.push(Period.MINUTE_15)
    }
    
    // Каждый час (когда minutes = 0)
    if (minutes === 0) {
      periods.push(Period.HOUR_1)
    }
    
    // Каждые 4 часа (0, 4, 8, 12, 16, 20)
    if (minutes === 0 && hours % 4 === 0) {
      periods.push(Period.HOUR_4)
    }
    
    // Каждые 24 часа (в полночь)
    if (minutes === 0 && hours === 0) {
      periods.push(Period.HOUR_24)
    }

    console.log('Periods to update:', periods)
    return periods
  },

  async updatePortfolioData(portfolioId: PortfolioId) {
    try {
      console.log(`Starting update for portfolio ${portfolioId}`)
      const { balances, isEmpty } = await this.getPortfolioBalances(portfolioId.toString())
      
      console.log(`Portfolio ${portfolioId} balances:`, balances)
      console.log(`Portfolio ${portfolioId} isEmpty:`, isEmpty)
      
      if (isEmpty) {
        console.log(`Portfolio ${portfolioId} is empty, skipping update`)
        return 0
      }

      let totalValue = 0
      for (const balance of balances) {
        const isStablecoin = ['USDT', 'USDC', 'BUSD', 'DAI'].includes(balance.coin_ticker)
        const currentPrice = isStablecoin ? 1 : await marketService.getCurrentPrice(balance.coin_ticker)
        
        console.log(`Portfolio ${portfolioId} - ${balance.coin_ticker}:`, {
          amount: balance.amount,
          currentPrice,
          value: balance.amount * (currentPrice || 0)
        })
        
        if (currentPrice === null) {
          console.warn(`No price found for ${balance.coin_ticker} in portfolio ${portfolioId}`)
          continue
        }
        
        totalValue += balance.amount * currentPrice
      }

      console.log(`Portfolio ${portfolioId} final total value: ${totalValue}`)
      return totalValue
    } catch (error) {
      console.error(`Error updating portfolio ${portfolioId}:`, error)
      throw error
    }
  },

  async updateCurrentValue(portfolioId: PortfolioId, totalValue: number) {
    try {
      const supabase = await createServerSupabaseClient()
      
      // Удаляем предыдущую CURRENT запись
      await supabase
        .from("portfolio_history")
        .delete()
        .eq("portfolio_id", portfolioId)
        .eq("period", "CURRENT")
      
      // Добавляем новую
      await this.savePortfolioHistory({
        portfolioId,
        totalValue,
        period: Period.CURRENT
      })
      
    } catch (error) {
      console.error('Failed to update current value:', error)
      throw error
    }
  },

  async deleteCurrentValue(portfolioId: PortfolioId) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("portfolio_history")
        .delete()
        .eq("portfolio_id", portfolioId)
        .eq("period", Period.CURRENT)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to delete current value:', error)
      throw new Error(error.message)
    }
  },

  calculateBatchSize(totalPortfolios: number, previousExecutionTime?: number): number {
    if (!previousExecutionTime) {
      return Math.min(
        Math.max(Math.ceil(totalPortfolios * 0.05), MIN_BATCH_SIZE),
        MAX_BATCH_SIZE
      )
    }

    return Math.min(
      Math.max(
        Math.ceil((TARGET_EXECUTION_TIME / previousExecutionTime) * MIN_BATCH_SIZE),
        MIN_BATCH_SIZE
      ),
      MAX_BATCH_SIZE
    )
  },

  async processBatch(
    portfolioIds: number[], 
    periods: Period[],
    startTime: number
  ): Promise<BatchResult> {
    const results: PortfolioUpdateResult[] = []
    const errors: string[] = []

    for (const portfolioId of portfolioIds) {
      try {
        const totalValue = await this.updatePortfolioData(portfolioId)
        
        await Promise.all([
          this.deleteCurrentValue(portfolioId),
          ...periods.map(period => 
            this.savePortfolioHistory({
              portfolioId,
              totalValue,
              period
            })
          )
        ])
        
        results.push({ 
          success: true, 
          historyCount: periods.length 
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error processing portfolio ${portfolioId}:`, errorMessage)
        errors.push(`Portfolio ${portfolioId}: ${errorMessage}`)
        results.push({ 
          success: false, 
          historyCount: 0,
          error: errorMessage
        })
      }
    }

    const stats = results.reduce((acc, result) => ({
      updatedPortfolios: acc.updatedPortfolios + (result.success ? 1 : 0),
      savedHistoryRecords: acc.savedHistoryRecords + result.historyCount
    }), { 
      updatedPortfolios: 0, 
      savedHistoryRecords: 0 
    })

    return {
      success: errors.length === 0,
      ...stats,
      errors: errors.length > 0 ? errors : undefined,
      executionTime: Date.now() - startTime
    }
  },

  async triggerNextBatch(
    baseUrl: string, 
    batchNumber: number, 
    executionTime: number,
    authToken: string
  ): Promise<boolean> {
    const nextBatchUrl = new URL('/api/cron/update-prices', baseUrl)
    nextBatchUrl.searchParams.set('batch', (batchNumber + 1).toString())
    nextBatchUrl.searchParams.set('prevTime', executionTime.toString())
    nextBatchUrl.searchParams.set('token', authToken)
    
    try {
      console.log('Triggering next batch:', {
        url: nextBatchUrl.toString(),
        batchNumber: batchNumber + 1,
        executionTime
      })

      const response = await fetch(nextBatchUrl.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to trigger next batch: ${response.status} ${response.statusText}`)
        console.error('Error details:', errorText)
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`)
      }
      
      return true
    } catch (error) {
      console.error('Failed to trigger next batch:', error)
      return false
    }
  }
}









  
  
  
  
  
  
  
  
  
  