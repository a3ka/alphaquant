"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Portfolio } from '@/utils/supabase'

const getSupabaseClient = async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration is missing')
  }

  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("portfolios")
      .select(`
        id,
        user_id,
        name,
        type,
        description,
        is_active,
        created_at,
        updated_at,
        margin_data
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data as Portfolio[]
  } catch (error: any) {
    console.error('Failed to get portfolios:', error)
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