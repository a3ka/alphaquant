'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Plus, Loader2, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Sector, ReferenceLine } from "recharts"
import { AddTransactionDialog } from "./Add-Transaction"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUser } from "@clerk/nextjs"
import { Portfolio, Asset, isDemoPortfolio } from '@/src/types/portfolio.types'
import { PortfolioSelector } from './PortfolioSelector'
import { getUserPortfolios, getPortfolioBalances } from '@/utils/actions/portfolio-actions'
import { FakePortfolio } from '@/app/data/fakePortfolio'

// Portfolio data with a clear trend
const portfolioData = [
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

// Find the highest value in portfolio data
const highestValue = Math.max(...portfolioData.map(item => item.value))
const highestValueDate = portfolioData.find(item => item.value === highestValue)?.date

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

// Выноси логику загруз данных в отдельный хук
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
          console.log(' Setting data...')
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

// Определяем типы для временных диапазонов
type TimeRangeType = '24H' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

interface TimeRange {
  value: TimeRangeType
  label: string
}

const timeRanges: TimeRange[] = [
  { value: '24H', label: '24H' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: 'ALL', label: 'ALL' }
]

// Функция для генерации данных в зависимости от временного диапазона
const generateDataForTimeRange = (range: TimeRangeType) => {
  const now = new Date()
  const data = []
  let startDate: Date
  let interval: number
  
  switch (range) {
    case '24H':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      interval = 60 * 60 * 1000 // кд час
      break
    case '1W':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      interval = 24 * 60 * 60 * 1000 // каждый день
      break
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      interval = 24 * 60 * 60 * 1000 // каждый день
      break
    case '3M':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      interval = 7 * 24 * 60 * 60 * 1000 // кажня неделя
      break
    case '6M':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      interval = 14 * 24 * 60 * 60 * 1000 // каждые две недели
      break
    case '1Y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      interval = 30 * 24 * 60 * 60 * 1000 // каждый месяц
      break
    case 'ALL':
      return portfolioData // используем существующие данные
  }

  for (let date = startDate; date <= now; date = new Date(date.getTime() + interval)) {
    // Генерируем значение с некоторой случайностью, но с общим трендом
    const baseValue = 300000
    const randomFactor = Math.random() * 50000 - 25000
    const trendFactor = ((date.getTime() - startDate.getTime()) / (now.getTime() - startDate.getTime())) * 50000
    
    data.push({
      date: date.toISOString(),
      value: baseValue + randomFactor + trendFactor
    })
  }
  
  return data
}

// Функция форматирования даты в зависимости от временного диапазона
const getDateFormatter = (range: TimeRangeType) => {
  switch (range) {
    case '24H':
      return (date: string) => new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    case '1W':
      return (date: string) => new Date(date).toLocaleDateString('en-US', {
        weekday: 'short'
      })
    case '1M':
    case '3M':
      return (date: string) => new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    default:
      return (date: string) => new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      })
  }
}

// Основной компонент
export function MainContent() {
  const { user } = useUser()
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  
  useEffect(() => {
    const loadPortfolios = async () => {
      if (!user?.id) return
      try {
        const data = await getUserPortfolios(user.id)
        if (Array.isArray(data)) {
          const existingFakePortfolio = data.find(p => p.id.toString() === 'fake-portfolio')
          if (!existingFakePortfolio) {
            setPortfolios([FakePortfolio, ...data])
          } else {
            setPortfolios(data)
          }
        }
      } catch (error) {
        console.error('Failed to load portfolios:', error)
      }
    }
    loadPortfolios()
  }, [user?.id])

  const handlePortfolioChange = (portfolio: Portfolio) => {
    const foundPortfolio = portfolios.find((p: Portfolio) => 
      p.id.toString() === portfolio.id.toString()
    )
    
    if (!foundPortfolio) {
      console.error('Portfolio not found:', portfolio.id)
      return
    }
    
    setSelectedPortfolio(foundPortfolio)
    setSelectedPortfolioId(foundPortfolio.id.toString())
    
    if (isDemoPortfolio(foundPortfolio)) {
      setChartData(portfolioData)
      setSelectedAsset(null)
    } else {
      setChartData([])
      setSelectedAsset(null)
    }
  }

  // Добавляем к существующим useState
  const [timeRange, setTimeRange] = useState<TimeRangeType>('24H')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [chartData, setChartData] = useState(portfolioData)
  const [error, setError] = useState<string | null>(null)
  const [portfolioBalances, setPortfolioBalances] = useState<{
    balances: any[],
    isEmpty: boolean
  }>({ balances: [], isEmpty: true })

  useEffect(() => {
    const loadBalances = async () => {
      if (selectedPortfolio && selectedPortfolio.id !== 'fake-portfolio') {
        try {
          const data = await getPortfolioBalances(selectedPortfolio.id.toString())
          setPortfolioBalances(data)
        } catch (error) {
          console.error('Failed to load portfolio balances:', error)
        }
      }
    }

    loadBalances()
  }, [selectedPortfolio])

  // 2. Все useMemo хуки
  const highestValue = useMemo(() => 
    Math.max(...portfolioData.map(item => item.value))
  , [])
  
  const lowestValue = useMemo(() => 
    Math.min(...portfolioData.map(item => item.value))
  , [])

  const highestValueDate = useMemo(() => 
    portfolioData.find(item => item.value === highestValue)?.date
  , [highestValue])

  const dateFormatter = useMemo(() => 
    getDateFormatter(timeRange)
  , [timeRange])

  // 3. Все useEffect хуки
  useEffect(() => {
    setChartData(generateDataForTimeRange(timeRange))
  }, [timeRange])

  // 4. Получение данных
  const data = useAssetsData()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    )
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

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const RADIAN = Math.PI / 180

  // Calculate total portfolio risk based on asset volatility and distribution
  const calculatePortfolioRisk = () => {
    // This is a simplified risk calculation
    const volatilityFactor = assets.reduce((acc, asset) => {
      return acc + (Math.abs(asset.change24h) + Math.abs(asset.change7d)) * (asset.percentage / 100)
    }, 0)
    
    // Normalize to 0-100 range
    return Math.min(Math.max(volatilityFactor * 2.5, 0), 100)
  }

  const portfolioRisk = calculatePortfolioRisk()

  // Function to determine risk color
  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-green-500'
    if (risk < 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      year: '2-digit'
    });
  };

  // Обновляем проверку пустого портфеля
  const isEmptyPortfolio = selectedPortfolio && 
    selectedPortfolio.id !== 'fake-portfolio' && 
    portfolioBalances.isEmpty

  return (
    <main className="w-full bg-[#010714] rounded-lg border border-gray-800/30">
      <Card className="bg-transparent">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-white text-xl font-semibold">Portfolio Overview</CardTitle>
              {!isEmptyPortfolio && (
                <div className="w-full sm:w-auto">
                  <Tabs 
                    value={timeRange} 
                    onValueChange={(value) => setTimeRange(value as TimeRangeType)}
                    className="bg-[#1F2937] rounded-lg p-0.5"
                  >
                    <TabsList className="bg-transparent border-0">
                      {timeRanges.map((range) => (
                        <TabsTrigger 
                          key={range.value} 
                          value={range.value}
                          className="data-[state=active]:bg-[#374151] text-gray-400 data-[state=active]:text-white"
                        >
                          {range.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>
            <PortfolioSelector onPortfolioChange={handlePortfolioChange} />
          </div>
        </CardHeader>
        <CardContent>
          {isEmptyPortfolio ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <div className="text-lg mb-2">No data available</div>
              <div className="text-sm">Add transactions to see portfolio analytics</div>
              <Button 
                onClick={() => setIsAddTransactionOpen(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Transaction
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-3xl font-bold text-white">$299441.37</div>
                <div className="flex items-center text-[#4ADE80]">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  1.75% ($5143.97)
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#1F2937" 
                      horizontal={true} 
                      vertical={false} 
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tickFormatter={dateFormatter}
                      tick={{ fontSize: 11 }}
                      dy={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={formatYAxis}
                      width={60}
                      tick={{ fontSize: 11 }}
                      dx={-10}
                      domain={['dataMin', 'dataMax']}
                      padding={{ top: 20, bottom: 20 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        color: '#E5E7EB',
                        fontSize: '12px',
                        padding: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                      labelFormatter={(label: string) => new Date(label).toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="url(#colorGradient)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#8B5CF6' }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="w-full lg:w-1/2">
                  <h3 className="text-white font-semibold mb-4">Asset Distribution</h3>
                  <div className="h-[300px] relative">
                    {isEmptyPortfolio ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                        <div className="text-sm">No assets in portfolio</div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="symbol"
                            onClick={(_, index) => {
                              const asset = pieChartData[index];
                              if ('logo' in asset) {  // проверяем, что это полнй объект актива
                                setSelectedAsset(asset);
                              }
                            }}
                            activeIndex={pieChartData.findIndex(a => a.symbol === currentSelectedAsset?.symbol)}
                            activeShape={(props: any) => {
                              const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                              return (
                                <g>
                                  <Sector
                                    cx={cx}
                                    cy={cy}
                                    innerRadius={innerRadius}
                                    outerRadius={outerRadius + 10}
                                    startAngle={startAngle}
                                    endAngle={endAngle}
                                    fill={fill}
                                  />
                                </g>
                              );
                            }}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke="transparent"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.95)',
                              border: 'none', 
                              borderRadius: '6px',
                              padding: '6px 10px', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                              zIndex: 50,
                              fontSize: '0.51rem' 
                            }}
                            formatter={(value: number, name: string, entry: any) => [
                              <div key="tooltip" className="flex flex-col gap-1 text-white" style={{ position: 'relative', zIndex: 50 }}>
                                <div className="text-lg font-bold">${value.toLocaleString()}</div>
                                <div className="flex items-center gap-1 text-xs">
                                  <span style={{ color: entry.payload.color }}>{name}</span>
                                  <span className="text-gray-300">{entry.payload.percentage.toFixed(2)}%</span>
                                </div>
                                {entry.payload.symbol !== 'OTHER' && (
                                  <>
                                    <div className="text-[0.6rem] text-gray-300">
                                      Amount: {entry.payload.amount.toLocaleString()} {name}
                                    </div>
                                    <div className="flex justify-between text-[0.6rem]">
                                      <span>24h: <span className={entry.payload.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>{entry.payload.change24h.toFixed(2)}%</span></span>
                                      <span>7d: <span className={entry.payload.change7d >= 0 ? 'text-green-400' : 'text-red-400'}>{entry.payload.change7d.toFixed(2)}%</span></span>
                                    </div>
                                  </>
                                )}
                              </div>,
                              ''
                            ]}
                            wrapperStyle={{ zIndex: 50 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {currentSelectedAsset && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[90px] z-20"> 
                        <div className="text-base font-bold text-white">${currentSelectedAsset.value.toLocaleString()}</div>
                        <div className="text-xs font-medium text-white">{currentSelectedAsset.symbol}</div>
                        <div className="text-xs text-gray-400">{currentSelectedAsset.percentage.toFixed(2)}%</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <h3 className="text-white font-semibold mb-4">Portfolio Distribution</h3>
                  {isEmptyPortfolio ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                      <div className="text-sm">No assets in portfolio</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pieChartData.map((asset) => (
                        <div key={asset.symbol} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {asset.symbol === 'OTHER' ? (
                              <Avatar className="h-5 w-5">
                                <AvatarFallback>OTH</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={'logo' in asset ? asset.logo : ''} alt={asset.name} />
                                <AvatarFallback>{asset.symbol}</AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-white text-sm">{asset.symbol}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">{asset.percentage.toFixed(2)}%</span>
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: asset.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">Risk Factor</h3>
                  <span className="text-sm text-gray-400">{portfolioRisk.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-gray-800">
                  <div 
                    className={`h-full transition-all duration-500 ${getRiskColor(portfolioRisk)}`}
                    style={{ width: `${portfolioRisk}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Low</span>
                  <span className="text-xs text-gray-400">High</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-[#1F2937]">
                      Portfolio
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1F2937]">
                      Transactions
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1F2937]">
                      Portfolio Analytics
                    </Button>
                  </div>
                  <Button 
                    onClick={() => setIsAddTransactionOpen(true)} 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>

                {isEmptyPortfolio ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                    <div className="text-sm">No transactions yet</div>
                    <Button 
                      onClick={() => setIsAddTransactionOpen(true)}
                      className="mt-4 bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-800/30 overflow-hidden">
                    <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 p-2 text-sm text-[#D1D5DB] bg-[#0A1929]">
                      <div className="col-span-2">Asset</div>
                      <div className="text-right hidden lg:block">Amount</div>
                      <div className="text-right">24h</div>
                      <div className="text-right hidden lg:block">7d</div>
                      <div className="text-right">Price</div>
                      <div className="text-right hidden lg:block">Value</div>
                      <div className="text-right hidden lg:block">P/L</div>
                    </div>
                    <div className="flex flex-col">
                      <AnimatePresence>
                        {assets.map((asset, index) => (
                          <motion.div 
                            key={asset.symbol}
                            className={`grid grid-cols-4 lg:grid-cols-8 gap-2 p-2 hover:bg-[#0A1929] cursor-pointer ${
                              index % 2 === 0 ? 'bg-[#010714]' : 'bg-[#010714]/50'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="col-span-2 flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={asset.logo} alt={asset.name} />
                                <AvatarFallback>{asset.symbol}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white text-sm">{asset.name}</div>
                                <div className="text-xs text-[#9CA3AF]">{asset.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right text-white text-sm hidden lg:block">{asset.amount.toLocaleString()}</div>
                            <div className={`text-right text-sm ${asset.change24h >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                              {asset.change24h.toFixed(2)}%
                            </div>
                            <div className={`text-right text-sm hidden lg:block ${asset.change7d >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                              {asset.change7d.toFixed(2)}%
                            </div>
                            <div className="text-right text-white text-sm">${asset.price.toLocaleString()}</div>
                            <div className="text-right text-white text-sm hidden lg:block">${asset.value.toLocaleString()}</div>
                            <div className={`text-right text-sm hidden lg:block ${(asset.profit || 0) >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                              {((asset.profit / asset.value) * 100).toFixed(2)}%
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <AddTransactionDialog 
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        selectedPortfolioId={selectedPortfolioId}
      />
    </main>
  )
}