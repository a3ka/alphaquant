import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '../../../../../src/services/portfolio'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id
    
    const balances = await portfolioService.getPortfolioBalances(id)
    return NextResponse.json({
      balances: balances.balances || [],
      isEmpty: balances.isEmpty
    })
  } catch (error: any) {
    console.error('Error in balance route:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { coinTicker, amount, isMargin } = await request.json()
    
    if (!coinTicker || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await portfolioService.updatePortfolioBalance(
      parseInt(params.id),
      coinTicker,
      amount,
      isMargin || false
    )
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}