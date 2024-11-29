// Перенести сюда все initialAssets и portfolioData
import { Asset, ChartDataPoint,Period,  DemoPortfolio, TimeRangeType } from '@/src/types/portfolio.types'

export const initialAssets: Asset[] = [
  { 
    name: 'Stark Network',
    symbol: 'STRK',
    logo: 'https://assets.coingecko.com/coins/images/26433/standard/starknet.png?1696525507',
    amount: 1000,
    price: 45.43,
    change24h: 2.30,
    change7d: 5.10,
    value: 45432.33,
    profit: 15000,
    percentage: 15.17,
    color: '#FF69B4'
  },
  { 
    name: 'MAGIC',
    symbol: 'MAGIC',
    logo: 'https://assets.coingecko.com/coins/images/18623/standard/magic.png?1696518095',
    amount: 5000,
    price: 6.12,
    change24h: -1.20,
    change7d: 3.70,
    value: 30600,
    profit: 7500,
    percentage: 10.21,
    color: '#8A2BE2'
  },
  { 
    name: 'Casper Network',
    symbol: 'CSPR',
    logo: 'https://assets.coingecko.com/coins/images/15279/standard/CSPR_Token_Logo_CoinGecko.png?1709518377',
    amount: 100000,
    price: 0.45,
    change24h: 0.5,
    change7d: -2.10,
    value: 45432.33,
    profit: -500,
    percentage: 15.17,
    color: '#4169E1'
  },
  { 
    name: 'Hedera',
    symbol: 'HBAR',
    logo: 'https://assets.coingecko.com/coins/images/3688/standard/hbar.png?1696504364',
    amount: 200000,
    price: 0.15,
    change24h: 1.8,
    change7d: 4.2,
    value: 30000,
    profit: 2000,
    percentage: 10.02,
    color: '#20B2AA'
  },
  { 
    name: 'Wormhole',
    symbol: 'W',
    logo: 'https://assets.coingecko.com/coins/images/35087/standard/womrhole_logo_full_color_rgb_2000px_72ppi_fb766ac85a.png?1708688954',
    amount: 1500,
    price: 28.33,
    change24h: -0.7,
    change7d: 6.5,
    value: 42495,
    profit: 1200,
    percentage: 14.19,
    color: '#FFD700'
  },
  { 
    name: 'Convex Finance',
    symbol: 'CVX',
    logo: 'https://assets.coingecko.com/coins/images/15585/standard/convex.png?1696515221',
    amount: 800,
    price: 20.31,
    change24h: 1.2,
    change7d: -1.5,
    value: 16248,
    profit: -300,
    percentage: 5.42,
    color: '#FF6347'
  },
  { 
    name: 'Decentraland',
    symbol: 'MANA',
    logo: 'https://assets.coingecko.com/coins/images/878/standard/decentraland-mana.png?1696502010',
    amount: 12000,
    price: 2.61,
    change24h: 3.1,
    change7d: 8.20,
    value: 31320,
    profit: 4500,
    percentage: 10.46,
    color: '#DA70D6'
  },
  { 
    name: 'Ethena',
    symbol: 'ENA',
    logo: 'https://assets.coingecko.com/coins/images/36530/standard/ethena.png?1711701436',
    amount: 5000,
    price: 1.5,
    change24h: 2.5,
    change7d: 7.8,
    value: 7500,
    profit: 500,
    percentage: 2.50,
    color: '#4B0082'
  },
  { 
    name: 'Ethereum Classic',
    symbol: 'ETC',
    logo: 'https://assets.coingecko.com/coins/images/453/standard/ethereum-classic-logo.png?1696501717',
    amount: 300,
    price: 30.5,
    change24h: -0.8,
    change7d: 3.2,
    value: 9150,
    profit: 300,
    percentage: 3.05,
    color: '#3CB371'
  },
  { 
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400',
    amount: 0.5,
    price: 70000,
    change24h: 1.5,
    change7d: 5.7,
    value: 35000,
    profit: 5000,
    percentage: 11.69,
    color: '#F7931A'
  }
]

export const portfolioChartData = [
  { timestamp: '2024-01-07', total_value: 350000, period: Period.HOUR_24 },
  { timestamp: '2023-08-01', total_value: 0, period: Period.HOUR_24 },
  { timestamp: '2023-09-01', total_value: 50000, period: Period.HOUR_24 },
  { timestamp: '2023-10-01', total_value: 120000, period: Period.HOUR_24 },
  { timestamp: '2023-11-01', total_value: 150000, period: Period.HOUR_24 },
  { timestamp: '2023-12-01', total_value: 179145, period: Period.HOUR_24 }, // Low point
  { timestamp: '2024-01-01', total_value: 250000, period: Period.HOUR_24 },
  { timestamp: '2024-02-01', total_value: 320000, period: Period.HOUR_24 },
  { timestamp: '2024-03-01', total_value: 411937, period: Period.HOUR_24 }, // High point
  { timestamp: '2024-04-01', total_value: 299441, period: Period.HOUR_24 }
].map(point => ({
  timestamp: point.timestamp,
  total_value: point.total_value,
  period: Period.HOUR_24
}))

export const FakePortfolio: DemoPortfolio = {
  id: 'fake-portfolio',
  name: 'Demo Portfolio',
  user_id: 'demo',
  type: 'SPOT',
  description: 'Demo portfolio with sample data',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  data: {
    assets: initialAssets,
    pieChartData: initialAssets,
    chartData: portfolioChartData,
    totalValue: 299441.37,
    totalProfit: 5143.97,
    profitPercentage: 1.75
  }
} 

// Функция для генерации данных в зависимости от временного диапазона
export const generateDataForTimeRange = (range: TimeRangeType) => {
  const now = new Date()
  const data: ChartDataPoint[] = []
  let startDate: Date
  let interval: number
  let period: Period
  
  switch (range) {
    case '24H':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      interval = 15 * 60 * 1000 // каждые 15 минут
      period = Period.MINUTE_15
      break
    case '1W':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      interval = 15 * 60 * 1000 // каждые 15 минут
      period = Period.MINUTE_15
      break
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      interval = 4 * 60 * 60 * 1000 // каждые 4 часа
      period = Period.HOUR_4
      break
    case '3M':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      interval = 4 * 60 * 60 * 1000 // каждые 4 часа
      period = Period.HOUR_4
      break
    case '6M':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      interval = 4 * 60 * 60 * 1000 // каждые 4 часа
      period = Period.HOUR_4
      break
    case '1Y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      interval = 24 * 60 * 60 * 1000 // каждый день
      period = Period.HOUR_24
      break
    case 'ALL':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      interval = 24 * 60 * 60 * 1000 // каждый день
      period = Period.HOUR_24
      break
  }

  for (let date = startDate; date <= now; date = new Date(date.getTime() + interval)) {
    const baseValue = 300000
    const randomFactor = Math.random() * 50000 - 25000
    const trendFactor = ((date.getTime() - startDate.getTime()) / (now.getTime() - startDate.getTime())) * 50000
    
    data.push({
      timestamp: date.toISOString(),
      total_value: baseValue + randomFactor + trendFactor,
      period
    })
  }
  
  return data
} 