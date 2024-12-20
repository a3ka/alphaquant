import { NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'

export async function POST(req: Request) {
  try {
    const { userId, name, type, description } = await req.json()
    
    if (!userId || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const portfolio = await portfolioService.createPortfolio(
      userId,
      name,
      type,
      description
    )
    
    if (!portfolio) {
      throw new Error('Failed to create portfolio')
    }
    
    return NextResponse.json(portfolio)
  } catch (error: any) {
    console.error('Portfolio creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
