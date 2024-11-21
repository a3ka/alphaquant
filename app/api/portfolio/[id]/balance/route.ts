import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '../../../../../src/services/portfolio'

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  const params = await context.params
  const id = params.id
  
  if (!id) {
    return NextResponse.json(
      { error: 'Portfolio ID is required' },
      { status: 400 }
    )
  }

  const balances = await portfolioService.getPortfolioBalances(id)
  return NextResponse.json({
    balances: balances.balances || [],
    isEmpty: balances.isEmpty
  })
}

export async function PUT(
  request: NextRequest,
  context: { params: any }
) {
  const id = context.params.id
  
  if (!id) {
    return NextResponse.json(
      { error: 'Portfolio ID is required' },
      { status: 400 }
    )
  }

  const { coinTicker, amount, isMargin } = await request.json()
  
  if (!coinTicker || amount === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  await portfolioService.updatePortfolioBalance(
    parseInt(id),
    coinTicker,
    amount,
    isMargin || false
  )
  
  return NextResponse.json({ success: true })
}