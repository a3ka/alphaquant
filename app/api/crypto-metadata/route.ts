import { NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'
import type { CoinMetadata } from '@/src/types/portfolio.types'

export async function GET() {
  try {
    const metadata = await marketService.getCoinMetadata()
    
    if (!metadata) {
      return NextResponse.json({ error: 'No metadata found' }, { status: 404 })
    }

    const serializedMetadata = (metadata as CoinMetadata[]).map((coin: CoinMetadata) => ({
      name: coin.name,
      symbol: coin.symbol,
      logo: coin.logo || '/images/default-coin.png',
      current_price: coin.current_price || 0,
      price_change_24h: coin.price_change_24h || 0,
      market_cap_rank: coin.market_cap_rank || 999
    }))

    return NextResponse.json(serializedMetadata)
  } catch (error: any) {
    console.error('Failed to fetch crypto metadata:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}