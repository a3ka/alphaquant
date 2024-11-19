import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const portfolios = await portfolioService.getUserPortfolios(context.params.id)
    return NextResponse.json(portfolios)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}