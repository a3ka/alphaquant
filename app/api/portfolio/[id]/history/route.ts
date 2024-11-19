import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const params = await context.params
    const id = params.id
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') as Period
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
      parseInt(id),
      period as Period,
      startDate
    )
    
    return NextResponse.json(history)
  } catch (error: any) {
    console.error('Error in history route:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
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