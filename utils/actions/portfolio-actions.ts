"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Portfolio } from '@/utils/supabase'

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

export async function getUserPortfolios(userId: string): Promise<Portfolio[]> {
  console.log('getUserPortfolios called with userId:', userId)
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
        created_time
      `)
      .eq("user_id", userId)
      .eq("is_active", true)

    console.log('Raw query result:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    const portfolios: Portfolio[] = data.map(portfolio => ({
      id: portfolio.id.toString(),
      user_id: portfolio.user_id,
      name: portfolio.name,
      type: portfolio.type.toLowerCase(),
      description: portfolio.description || '',
      is_active: portfolio.is_active,
      created_at: portfolio.created_time,
      updated_at: portfolio.created_time,
      data: {
        assets: [],
        pieChartData: [],
        chartData: [],
        totalValue: 0,
        totalProfit: 0,
        profitPercentage: 0
      }
    }))

    return portfolios
  } catch (error: any) {
    console.error('getUserPortfolios error:', error)
    return []
  }
}

export async function updatePortfolioName(portfolioId: string, newName: string) {
  try {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("portfolios")
      .update({ name: newName })
      .eq("id", portfolioId)

    if (error) throw error
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function createPortfolio(
  userId: string, 
  name: string, 
  type: 'spot' | 'margin', 
  marginData?: {
    sourcePortfolioId?: string
    assets?: Array<{symbol: string, amount: number}>
  }
): Promise<Portfolio> {
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("portfolios")
      .insert([{ 
        user_id: userId,
        name,
        type,
        is_active: true,
        margin_data: marginData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data as Portfolio
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