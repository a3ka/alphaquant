import { createServerSupabaseClient } from '@/src/services/supabase/server'
import type { Portfolio, UserPortfolio, PortfolioHistory, PortfolioBalancesResponse } from '@/src/types/portfolio.types'
import { Period } from '@/src/types/portfolio.types'
import { marketService } from './market'
import { getPeriodByRange, getStartDate } from '@/src/utils/date'

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
  async deletePortfolio(portfolioId: string) {
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
    portfolioId: number,
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
    console.log('Saving portfolio history:', {
      portfolioId: data.portfolioId,
      totalValue: data.totalValue,
      period: data.period,
      timestamp: new Date().toISOString()
    })
    
    const supabase = await createServerSupabaseClient()

    // Если сохраняем CURRENT запись, сначала удаляем предыдущую
    if (data.period === Period.CURRENT) {
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
    
    // Сохраняем новую запись
    const { error } = await supabase
      .from("portfolio_history")
      .insert({
        portfolio_id: data.portfolioId,
        total_value: data.totalValue,
        period: data.period,
        timestamp: new Date().toISOString()
      })
    
    if (error) {
      console.error('Failed to save portfolio history:', error)
      throw error
    }
    
    console.log('Portfolio history saved successfully')
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
            const metadata = await marketService.getCoinMetadata(balance.coin_ticker)
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
      { period: Period.MINUTE_15, days: 1 },    // Храним 15-минутные данные за 1 день
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

  async updatePortfolioData(portfolioId: number) {
    try {
      const { balances, isEmpty } = await this.getPortfolioBalances(portfolioId.toString())
      
      if (isEmpty) {
        return 0
      }

      let totalValue = 0
      for (const balance of balances) {
        const currentPrice = await marketService.getCurrentPrice(balance.coin_ticker)
        totalValue += balance.amount * currentPrice
      }

      return totalValue
    } catch (error) {
      console.error('Failed to update portfolio data:', error)
      throw error
    }
  },

  async updateCurrentValue(portfolioId: number, totalValue: number) {
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

  async deleteCurrentValue(portfolioId: number) {
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
  }
}









  
  
  
  
  
  
  
  
  
  