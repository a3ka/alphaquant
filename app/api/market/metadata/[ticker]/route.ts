import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'

export async function GET(
  request: NextRequest,
  { params }: { params: Record<'ticker', string> }
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