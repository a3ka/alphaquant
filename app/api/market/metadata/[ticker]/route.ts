import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'

type Props = {
  params: {
    ticker: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: Props
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
