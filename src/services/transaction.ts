import { createServerSupabaseClient } from './supabase/server'
import type { 
  Transaction, 
  TransactionType, 
  TransactionCreateProps, 
  TransactionUpdateProps,
  TransactionWithPortfolio 
} from '@/src/types/transaction.types'

export const transactionService = {
  async createTransaction(data: TransactionCreateProps) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data: transaction, error } = await supabase
        .from("crypto_transaction")
        .insert([{
          portfolio_id: data.portfolioId,
          user_id: data.userId,
          type: data.type,
          coin_name: data.coinName,
          coin_ticker: data.coinTicker,
          amount: data.amount,
          payment_method: data.paymentMethod,
          payment_price: data.paymentPrice,
          payment_total: data.paymentTotal,
          price_usd: data.priceUsd,
          total_usd: data.totalUsd,
          borrowed_amount: data.borrowedAmount,
          target_portfolio_id: data.targetPortfolioId,
          notes: data.notes,
          transaction_time: data.transactionTime?.toISOString() || new Date().toISOString(),
          created_time: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return transaction
    } catch (error: any) {
      console.error('Failed to create transaction:', error)
      throw new Error(error.message)
    }
  },

  async getPortfolioTransactions(portfolioId: number) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("crypto_transaction")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("transaction_time", { ascending: false })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Failed to get portfolio transactions:', error)
      throw new Error(error.message)
    }
  },

  async deleteTransaction(transactionId: number) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("crypto_transaction")
        .delete()
        .eq("id", transactionId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to delete transaction:', error)
      throw new Error(error.message)
    }
  },

  async updateTransaction(
    transactionId: number,
    updates: {
      amount?: number
      priceUsd?: number
      totalUsd?: number
      notes?: string
    }
  ) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("crypto_transaction")
        .update(updates)
        .eq("id", transactionId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to update transaction:', error)
      throw new Error(error.message)
    }
  },

  async getTransaction(transactionId: number): Promise<TransactionWithPortfolio | null> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("crypto_transaction")
        .select(`
          *,
          portfolio:user_portfolio (
            id,
            name,
            type
          )
        `)
        .eq("id", transactionId)
        .single()

      if (error) throw error
      return data as TransactionWithPortfolio
    } catch (error: any) {
      console.error('Failed to get transaction:', error)
      throw new Error(error.message)
    }
  }
}
