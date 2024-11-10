export interface Asset {
  name: string
  symbol: string
  logo: string
  amount: number
  price: number
  change24h: number
  change7d: number
  value: number
  profit: number
  percentage: number
  color: string
}

export interface PortfolioData {
  assets: Asset[]
  pieChartData: Asset[]
  chartData: {
    date: string
    value: number
  }[]
  totalValue: number
  totalProfit: number
  profitPercentage: number
}

export interface Portfolio {
  id: string
  name: string
  user_id: string
  type: 'spot' | 'margin'
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  data: PortfolioData
}

// Перенести сюда все initialAssets и portfolioData
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
    { date: '2024-01-07', value: 350000 },
    { date: '2023-08-01', value: 0 },
    { date: '2023-09-01', value: 50000 },
    { date: '2023-10-01', value: 120000 },
    { date: '2023-11-01', value: 150000 },
    { date: '2023-12-01', value: 179145 }, // Low point
    { date: '2024-01-01', value: 250000 },
    { date: '2024-02-01', value: 320000 },
    { date: '2024-03-01', value: 411937 }, // High point
    { date: '2024-04-01', value: 299441 }
]

export const FakePortfolio: Portfolio = {
  id: 'fake-portfolio',
  name: 'Demo Portfolio',
  user_id: 'demo',
  type: 'spot',
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