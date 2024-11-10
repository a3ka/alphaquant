'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { PortfolioCharts } from './PortfolioCharts'
import { PortfolioTable } from './PortfolioTable'
import { AddTransactionDialog } from "./Add-Transaction"

// Portfolio data with a clear trend
const portfolioData = [
  { date: '2024-01-01', value: 250000 },
  { date: '2024-01-02', value: 280000 },
  { date: '2024-01-03', value: 472576 },
  { date: '2024-01-04', value: 450000 },
  { date: '2024-01-05', value: 420000 },
  { date: '2024-01-06', value: 380000 },
  { date: '2024-01-07', value: 350000 },
  { date: '2024-01-08', value: 299441 }
]

const initialAssets = [
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

function useAssetsData() {
  const [data, setData] = useState<{
    assets: typeof initialAssets,
    selectedAsset: typeof initialAssets[0],
    pieChartData: any[]
  } | null>(null)

  useEffect(() => {
    let mounted = true
    console.log('🔄 Starting data load...')

    const loadData = async () => {
      try {
        console.log('📊 Initial assets length:', initialAssets.length)
        const assets = initialAssets
        const selectedAsset = assets[2]
        
        console.log('🎯 Selected asset:', selectedAsset.symbol)
        
        const topAssets = assets.slice(0, 7)
        const otherAssets = assets.slice(7)
        console.log('📈 Top assets length:', topAssets.length)
        console.log('📉 Other assets length:', otherAssets.length)
        
        const pieChartData = [
          ...topAssets,
          {
            name: 'Other',
            symbol: 'OTHER',
            value: otherAssets.reduce((sum, asset) => sum + asset.value, 0),
            percentage: otherAssets.reduce((sum, asset) => sum + asset.percentage, 0),
            color: '#808080'
          }
        ]
        
        console.log('🥧 Pie chart data length:', pieChartData.length)

        if (mounted) {
          console.log('💾 Setting data...')
          setData({
            assets,
            selectedAsset,
            pieChartData
          })
          console.log('✅ Data set successfully')
        }
      } catch (error) {
        console.error('❌ Error loading data:', error)
      }
    }

    loadData()
    return () => {
      mounted = false
      console.log('🔴 Component unmounted')
    }
  }, [])

  return data
}

export function MainContent() {
  const [timeRange, setTimeRange] = useState('24H')
  const [selectedAsset, setSelectedAsset] = useState<typeof initialAssets[0] | null>(null)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  
  const data = useAssetsData()

  // Calculate total portfolio risk based on asset volatility and distribution
  const calculatePortfolioRisk = () => {
    if (!data?.assets) return 0;
    
    // This is a simplified risk calculation
    const volatilityFactor = data.assets.reduce((acc, asset) => {
      return acc + (Math.abs(asset.change24h) + Math.abs(asset.change7d)) * (asset.percentage / 100)
    }, 0)
    
    // Normalize to 0-100 range
    return Math.min(Math.max(volatilityFactor * 2.5, 0), 100)
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-green-500'
    if (risk < 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      year: '2-digit'
    })
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const { assets, pieChartData } = data
  const currentSelectedAsset = selectedAsset || data.selectedAsset
  const portfolioRisk = calculatePortfolioRisk()

  return (
    <main className="col-span-12 lg:col-span-6 p-6 overflow-visible">
      <div className="container mx-auto max-w-full">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 rounded-lg border border-gray-800/30 bg-[#010714] shadow-lg">
            <PortfolioCharts 
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              portfolioData={portfolioData}
              pieChartData={pieChartData}
              currentSelectedAsset={currentSelectedAsset}
              setSelectedAsset={setSelectedAsset}
              portfolioRisk={portfolioRisk}
              getRiskColor={getRiskColor}
              formatYAxis={formatYAxis}
              formatDate={formatDate}
            />
            <PortfolioTable 
              assets={assets}
              isAddTransactionOpen={isAddTransactionOpen}
              setIsAddTransactionOpen={setIsAddTransactionOpen}
            />
          </div>
        </div>
      </div>
      <AddTransactionDialog 
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
      />
    </main>
  )
}