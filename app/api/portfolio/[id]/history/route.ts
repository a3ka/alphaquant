import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as Period
    const days = parseInt(searchParams.get('days') || '1')
    
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const history = await portfolioService.getPortfolioHistory(
      Number(params.id),
      period,
      startDate
    )

    return NextResponse.json(history)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const { totalValue, period } = await request.json()
    
    if (!totalValue || !period) {
      return NextResponse.json(
        { error: 'Total value and period are required' },
        { status: 400 }
      )
    }

    await portfolioService.savePortfolioHistory({
      portfolioId: parseInt(context.params.id),
      totalValue,
      period
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in history POST:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}