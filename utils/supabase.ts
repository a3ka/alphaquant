import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Database Types
export type Tables = {
  portfolios: {
    Row: {
      id: string
      user_id: string
      name: string
      type: 'spot' | 'margin'
      description?: string
      is_active: boolean
      created_at: string
      updated_at: string
      margin_data?: {
        sourcePortfolioId?: string
        assets?: Array<{symbol: string, amount: number}>
        debt?: number
      }
      data: {
        assets: Array<{
          name: string
          symbol: string
          logo: string
          amount: number
          price: number
          change24h: number
          change7d: number
          value: number
          profit: number
          percentage: number
          color: string
        }>
        pieChartData: Array<any>
        chartData: Array<{
          date: string
          value: number
        }>
        totalValue: number
        totalProfit: number
        profitPercentage: number
      }
    }
    Insert: Omit<Tables['portfolios']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Tables['portfolios']['Insert']>
  }
  assets: {
    Row: {
      id: string
      portfolio_id: string
      symbol: string
      amount: number
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['assets']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Tables['assets']['Insert']>
  }
}

export type Portfolio = Tables['portfolios']['Row']
export type Asset = Tables['assets']['Row']
export type PortfolioType = "SPOT" | "MARGIN";