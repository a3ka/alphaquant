import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '../../../../../src/services/portfolio'

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    console.log('Context object:', context)
    console.log('Raw params object:', context.params)

    const params = await context.params
    console.log('Resolved params:', params)

    const id = params?.id
    console.log('Resolved id:', id)

    if (!id) {
      console.error('Portfolio ID is missing')
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
  context: { params: any }
) {
  try {
    const params = await context.params
    const id = params?.id

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}