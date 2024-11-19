import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'

type Params = { params: { ticker: string } }

export async function GET(
  req: NextRequest,
  { params }: Params
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