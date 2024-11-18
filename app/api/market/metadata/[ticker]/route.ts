import { NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'

export async function GET(
  req: Request,
  context: { params: { ticker: string } }
) {
  try {
    const params = await context.params
    const metadata = await marketService.getCoinMetadata(params.ticker)
    return NextResponse.json(metadata)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
