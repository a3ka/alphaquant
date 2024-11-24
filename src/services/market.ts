import { createServerSupabaseClient } from './supabase/server'

interface CoinMarketData {
  id: string
  image: string
  name: string
  symbol: string
  market_cap_rank: number
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  ath: number
  ath_change_percentage: number
  ath_date: string
}

export const marketService = {
  async updateCryptoMetadata() {
    try {
      const response = await fetch(
        'https://warm-escarpment-05235-2d75a97669ab.herokuapp.com/api/data/updateMarketData/method?endpoint=coins/markets?vs_currency=usd%26per_page=100%26page='
      )
      const { result } = await response.json()
      
      const supabase = await createServerSupabaseClient()
      
      const updates = result.map((coin: CoinMarketData) => ({
        coin_id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        logo: coin.image,
        market_cap_rank: coin.market_cap_rank,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_percentage_24h,
        ath: coin.ath,
        ath_date: coin.ath_date,
        last_updated: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('crypto_metadata')
        .upsert(updates, { onConflict: 'coin_id' })

      if (error) throw error
    } catch (error) {
      console.error('Failed to update crypto metadata:', error)
      throw error
    }
  },

  async getCurrentPrice(ticker: string): Promise<number> {
    if (ticker === 'USDT' || ticker === 'USDC') {
      return 1
    }

    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('crypto_metadata')
        .select('current_price')
        .eq('symbol', ticker.toUpperCase())

      if (error) {
        console.warn(`Failed to get price for ${ticker}:`, error)
        return 0
      }

      if (!data || data.length === 0) {
        console.warn(`No price data found for ${ticker}`)
        return 0
      }

      return data[0].current_price || 0
      
    } catch (error) {
      console.error('Failed to get current price:', error)
      return 0
    }
  },

  async getCoinMetadata(ticker: string) {
    if (ticker === 'USDT' || ticker === 'USDC') {
      return {
        name: ticker,
        symbol: ticker,
        logo: '/images/default-coin.png',
        current_price: 1,
        price_change_24h: 0
      }
    }

    try {
      const supabase = await createServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('crypto_metadata')
        .select('*')
        .eq('symbol', ticker.toUpperCase())
        .single(); // Возвращает только одну строку или вызывает ошибку
  
      // Если ошибка или данных нет
      if (error) {
        if (error.code === 'PGRST116') {
          // Логируем отсутствие данных
          console.warn(`No metadata found for ticker: ${ticker}`);
          return null;
        }
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error('Failed to get coin metadata:', error);
      return null;
    }
  },

  async createBasicCoinMetadata(data: {
    ticker: string,
    name: string,
    current_price: number,
    price_change_24h: number,
    logo: string
  }) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from('crypto_metadata')
        .insert({
          symbol: data.ticker.toUpperCase(),
          name: data.name,
          current_price: data.current_price,
          price_change_24h: data.price_change_24h,
          logo: data.logo,
          last_updated: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to create basic coin metadata:', error)
      throw error
    }
  }
}