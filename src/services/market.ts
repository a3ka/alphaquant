import { createServerSupabaseClient } from './supabase/server'
import type { CoinMetadata } from '@/src/types/portfolio.types'

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

const DEFAULT_COIN_LOGO = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'

export const marketService = {
  async updateCryptoMetadata() {
    try {
      const response = await fetch(
        'https://warm-escarpment-05235-2d75a97669ab.herokuapp.com/api/data/updateMarketData/method?endpoint=coins/markets?vs_currency=usd%26per_page=100%26page='
      )
      const { result } = await response.json()
      
      const supabase = await createServerSupabaseClient()
      
      // Получаем существующие монеты
      const { data: existingCoins } = await supabase
        .from('crypto_metadata')
        .select('coin_id, symbol')

      const existingCoinIds = new Set(existingCoins?.map(coin => coin.coin_id) || [])
      const existingSymbols = new Set(existingCoins?.map(coin => coin.symbol) || [])

      // Разделяем на новые и существующие монеты
      const { newCoins, existingUpdates } = result.reduce((acc: any, coin: CoinMarketData) => {
        const baseSymbol = coin.symbol.toUpperCase().split('.')[0]
        if (['USDT', 'USDC'].includes(baseSymbol)) return acc

        if (existingCoinIds.has(coin.id) || existingSymbols.has(coin.symbol.toUpperCase())) {
          // Обновление существующей монеты
          acc.existingUpdates.push({
            coin_id: coin.id,
            current_price: coin.current_price,
            price_change_24h: coin.price_change_percentage_24h,
            market_cap_rank: coin.market_cap_rank,
            last_updated: new Date().toISOString()
          })
        } else {
          // Новая монета
          acc.newCoins.push({
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
          })
        }
        return acc
      }, { newCoins: [], existingUpdates: [] })

      // Обновляем существующие монеты
      for (const update of existingUpdates) {
        await supabase
          .from('crypto_metadata')
          .update(update)
          .eq('coin_id', update.coin_id)
      }

      // Добавляем новые монеты
      if (newCoins.length > 0) {
        await supabase
          .from('crypto_metadata')
          .insert(newCoins)
      }

      console.log(`Updated ${existingUpdates.length} coins, added ${newCoins.length} new coins`)
      return { updated: existingUpdates.length, added: newCoins.length }
      
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

  async getCoinMetadata(ticker?: string): Promise<CoinMetadata | CoinMetadata[] | null> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('crypto_metadata')
        .select('*')
        .order('market_cap_rank', { ascending: true });

      if (error) throw error;

      // Если передан конкретный тикер, ищем только его
      if (ticker) {
        const coin = data?.find(c => c.symbol.toUpperCase() === ticker.toUpperCase());
        if (coin) {
          return {
            name: coin.name,
            symbol: coin.symbol,
            logo: coin.logo || DEFAULT_COIN_LOGO,
            current_price: coin.current_price,
            price_change_24h: coin.price_change_24h,
            market_cap_rank: coin.market_cap_rank
          };
        }
        
        // Проверяем, является ли монета стейблкоином
        const stablecoin = STABLECOINS.find(s => s.symbol === ticker.toUpperCase());
        if (stablecoin) {
          return stablecoin;
        }
        
        return null;
      }

      // Для списка всех монет
      const uniqueCoins = new Map();
      
      // Добавляем стейблкоины
      STABLECOINS.forEach(coin => {
        uniqueCoins.set(coin.symbol, coin);
      });
      
      // Добавляем остальные монеты
      (data || []).forEach(coin => {
        if (!uniqueCoins.has(coin.symbol)) {
          uniqueCoins.set(coin.symbol, {
            name: coin.name,
            symbol: coin.symbol,
            logo: coin.logo || DEFAULT_COIN_LOGO,
            current_price: coin.current_price,
            price_change_24h: coin.price_change_24h,
            market_cap_rank: coin.market_cap_rank
          });
        }
      });

      return Array.from(uniqueCoins.values());
    } catch (error) {
      console.error('Failed to get crypto metadata:', error);
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

const STABLECOINS: CoinMetadata[] = [
  {
    name: 'Tether',
    symbol: 'USDT',
    logo: DEFAULT_COIN_LOGO,
    current_price: 1,
    price_change_24h: 0,
    market_cap_rank: 0
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    logo: DEFAULT_COIN_LOGO,
    current_price: 1,
    price_change_24h: 0,
    market_cap_rank: 1
  }
];