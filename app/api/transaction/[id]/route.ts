import { NextRequest, NextResponse } from 'next/server'
import { transactionService } from '@/src/services/transaction'
import type { TransactionUpdateProps } from '@/src/types/transaction.types'

export async function PUT(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const updates: TransactionUpdateProps = await request.json()
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    await transactionService.updateTransaction(Number(context.params.id), updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: any }
) {
  try {
    await transactionService.deleteTransaction(Number(context.params.id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const transaction = await transactionService.getTransaction(Number(context.params.id))
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(transaction)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}