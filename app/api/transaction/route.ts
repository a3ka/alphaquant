import { NextResponse } from 'next/server'
import { transactionService } from '@/src/services/transaction'
import type { TransactionCreateProps } from '@/src/types/transaction.types'

export async function POST(req: Request) {
  try {
    const data: TransactionCreateProps = await req.json()
    const transaction = await transactionService.createTransaction(data)
    return NextResponse.json(transaction)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}