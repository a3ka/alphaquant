"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { TransactionType } from '@prisma/client'

const getSupabaseClient = async () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
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

export async function createTransaction({
  portfolioId,
  userId,
  type,
  coinName,
  coinTicker,
  amount,
  paymentMethod,
  paymentPrice,
  paymentTotal,
  priceUsd,
  totalUsd,
  borrowedAmount,
  targetPortfolioId,
  notes
}: {
  portfolioId: number
  userId: string
  type: TransactionType
  coinName: string
  coinTicker: string
  amount: number
  paymentMethod?: string
  paymentPrice?: number
  paymentTotal?: number
  priceUsd?: number
  totalUsd?: number
  borrowedAmount?: number
  targetPortfolioId?: number
  notes?: string
}) {
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("crypto_transaction")
      .insert([{
        portfolio_id: portfolioId,
        user_id: userId,
        type,
        coin_name: coinName,
        coin_ticker: coinTicker,
        amount,
        payment_method: paymentMethod,
        payment_price: paymentPrice,
        payment_total: paymentTotal,
        price_usd: priceUsd,
        total_usd: totalUsd,
        borrowed_amount: borrowedAmount,
        target_portfolio_id: targetPortfolioId,
        notes,
        transaction_time: new Date().toISOString(),
        created_time: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    const { data: existingBalance, error: balanceError } = await supabase
      .from('portfolio_balance')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('coin_ticker', coinTicker)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') { // PGRST116 = не найдено
      throw balanceError;
    }

    if (existingBalance) {
      const newAmount = type === 'BUY' 
        ? existingBalance.amount + amount
        : existingBalance.amount - amount;

      const { error: updateError } = await supabase
        .from('portfolio_balance')
        .update({ 
          amount: newAmount,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingBalance.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('portfolio_balance')
        .insert({
          portfolio_id: portfolioId,
          coin_ticker: coinTicker,
          amount: type === 'BUY' ? amount : -amount,
          last_updated: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }

    return data
  } catch (error: any) {
    console.error('Failed to create transaction:', error)
    throw new Error(error.message)
  }
}

export async function getPortfolioTransactions(portfolioId: number) {
  try {
    const supabase = await getSupabaseClient()
    
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
}

export async function deleteTransaction(transactionId: number) {
  try {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("crypto_transaction")
      .delete()
      .eq("id", transactionId)

    if (error) throw error
  } catch (error: any) {
    console.error('Failed to delete transaction:', error)
    throw new Error(error.message)
  }
}

export async function updateTransaction(
  transactionId: number,
  updates: {
    amount?: number
    priceUsd?: number
    totalUsd?: number
    notes?: string
  }
) {
  try {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("crypto_transaction")
      .update(updates)
      .eq("id", transactionId)

    if (error) throw error
  } catch (error: any) {
    console.error('Failed to update transaction:', error)
    throw new Error(error.message)
  }
}