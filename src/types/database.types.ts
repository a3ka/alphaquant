export type Database = {
    public: {
      Tables: {
        user_portfolio: {
          Row: {
            id: number
            created_time: string
            user_id: string
            name: string
            description: string | null
            type: "SPOT" | "MARGIN"
            is_active: boolean
          }
        }
        portfolio_balance: {
          Row: {
            id: number
            last_updated: string
            portfolio_id: number
            coin_ticker: string
            amount: number
            borrowed: number
            in_collateral: number
          }
        }
        crypto_transaction: {
          Row: {
            id: number
            created_time: string
            transaction_time: string
            portfolio_id: number
            user_id: string
            type: "BUY" | "SELL" | "TRANSFER"
            coin_name: string
            coin_ticker: string
            amount: number
            notes: string | null
            payment_method: string | null
            payment_price: number | null
            payment_total: number | null
            price_usd: number | null
            total_usd: number | null
            borrowed_amount: number | null
            target_portfolio_id: number | null
          }
        }
      }
    }
  }
  
  export type Tables = Database['public']['Tables']