import { NextResponse } from 'next/server'
import { transactionService } from '@/src/services/transaction'

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params
    const transactions = await transactionService.getPortfolioTransactions(Number(params.id))
    return NextResponse.json(transactions)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}