import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'

export async function GET(
  request: NextRequest,
  context: { params: { ticker: string } }
) {
  try {
    const metadata = await marketService.getCoinMetadata(context.params.ticker)
    return NextResponse.json(metadata)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}