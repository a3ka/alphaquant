import { NextRequest, NextResponse } from 'next/server'
import { transactionService } from '@/src/services/transaction'

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const transactions = await transactionService.getPortfolioTransactions(Number(context.params.id))
    return NextResponse.json(transactions)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}3