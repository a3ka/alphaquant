import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function POST(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const { totalValue } = await request.json()
    
    if (typeof totalValue !== 'number') {
      return NextResponse.json(
        { error: 'Total value is required and must be a number' },
        { status: 400 }
      )
    }

    await portfolioService.savePortfolioHistory({
      portfolioId: parseInt(context.params.id),
      totalValue,
      period: Period.CURRENT
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating current value:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}