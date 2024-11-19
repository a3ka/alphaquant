import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'

interface RouteSegment {
  ticker: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteSegment }
) {
  try {
    const metadata = await marketService.getCoinMetadata(params.ticker)
    return NextResponse.json(metadata)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}