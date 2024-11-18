import { NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period')
    const days = parseInt(searchParams.get('days') || '7')
    
    if (!period || !Object.values(Period).includes(period as Period)) {
      return NextResponse.json(
        { error: 'Invalid period provided' },
        { status: 400 }
      )
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const history = await portfolioService.getPortfolioHistory(
      parseInt(params.id),
      period as Period,
      startDate
    )
    
    return NextResponse.json(history)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { totalValue, period } = await req.json()
    
    if (!totalValue || !period) {
      return NextResponse.json(
        { error: 'Total value and period are required' },
        { status: 400 }
      )
    }

    await portfolioService.savePortfolioHistory({
      portfolioId: parseInt(params.id),
      totalValue,
      period
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}