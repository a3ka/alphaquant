"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Portfolio, UserPortfolio } from '@/src/types/portfolio.types'

const getSupabaseClient = async () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey 
    })
    throw new Error('Supabase configuration is missing')
  }

  const cookieStore = await cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function getUserPortfolios(userId: string): Promise<UserPortfolio[]> {
  try {
    const supabase = await getSupabaseClient()
    
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
}

export async function updatePortfolioName(portfolioId: string, newName: string) {
  try {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("user_portfolio")
      .update({ name: newName })
      .eq("id", portfolioId)

    if (error) throw error
  } catch (error: any) {
    console.error('Failed to update portfolio name:', error)
    throw new Error(error.message)
  }
}

export async function createPortfolio(
  userId: string,
  name: string,
  type: 'SPOT' | 'MARGIN',
  description?: string
): Promise<UserPortfolio> {
  try {
    const supabase = await getSupabaseClient()
    
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
}

export async function deletePortfolio(portfolioId: string) {
  try {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("user_portfolio")
      .delete()
      .eq("id", portfolioId)

    if (error) throw error
  } catch (error: any) {
    throw new Error(error.message)
  }
} 

export async function updatePortfolioBalance(
  portfolioId: number,
  coinTicker: string,
  amount: number,
  isMargin: boolean
) {
  try {
    const supabase = await getSupabaseClient();

    const { data: portfolio } = await supabase
      .from("user_portfolio")
      .select("type")
      .eq("id", portfolioId)
      .single();

    if (!portfolio) {
      throw new Error("Портфель не найден");
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
}

export async function disablePortfolio(portfolioId: string) {
  try {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("user_portfolio")
      .update({ is_active: false })
      .eq("id", portfolioId)

    if (error) throw error
  } catch (error: any) {
    console.error('Failed to disable portfolio:', error)
    throw new Error(error.message)
  }
}

export async function getPortfolioBalances(portfolioId: string) {
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("portfolio_balance")
      .select(`
        id,
        coin_ticker,
        amount,
        borrowed,
        in_collateral,
        last_updated
      `)
      .eq("portfolio_id", portfolioId)

    if (error) throw error

    // Проверяем есть ли балансы с ненулевым количеством
    const hasNonZeroBalance = data?.some(balance => 
      balance.amount > 0 || balance.borrowed > 0 || balance.in_collateral > 0
    )

    return {
      balances: data || [],
      isEmpty: !hasNonZeroBalance
    }

  } catch (error: any) {
    console.error('Failed to get portfolio balances:', error)
    throw new Error(error.message)
  }
}