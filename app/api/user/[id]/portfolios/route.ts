import { NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'

export async function GET(
  request: Request,
  { params }: { params: { id: Promise<string> } }
) {
  const id = await params.id
  try {
    const portfolios = await portfolioService.getUserPortfolios(id)
    return NextResponse.json(portfolios)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}