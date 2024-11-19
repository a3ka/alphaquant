'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Plus, Loader2, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Sector, ReferenceLine } from "recharts"
import { AddTransactionDialog } from "./Add-Transaction"
import { useUser } from "@clerk/nextjs"
import { Portfolio, Asset, isDemoPortfolio, PortfolioBalancesResponse, PortfolioBalance, Period } from '@/src/types/portfolio.types'
import { PortfolioSelector } from './PortfolioSelector'
import { getUserPortfolios, getPortfolioBalances } from '@/utils/actions/portfolio-actions'
import { initialAssets, portfolioChartData as portfolioData, FakePortfolio } from '@/app/data/fakePortfolio'
import { portfolioService } from '@/src/services/portfolio'
import { marketService } from '@/src/services/market'



// Выноси логику загруз данных в отдельный хук
function useAssetsData(selectedPortfolio: Portfolio | null) {
  const [data, setData] = useState<{
    assets: Asset[],
    selectedAsset: Asset,
    pieChartData: any[],
    isEmpty: boolean
  } | null>(null)

  useEffect(() => {
    let mounted = true
    console.log('useAssetsData effect triggered with portfolio:', selectedPortfolio)
    
    const loadData = async () => {
      try {
        if (!selectedPortfolio) {
          console.log('No portfolio selected')
          return
        }

        if (isDemoPortfolio(selectedPortfolio)) {
          console.log('Loading demo portfolio data:', selectedPortfolio.data)
          const assets = selectedPortfolio.data.assets
          if (mounted) {
            setData({
              assets,
              selectedAsset: assets[0],
              pieChartData: generatePieChartData(assets),
              isEmpty: false
            })
          }
        } else {
          console.log('Loading real portfolio data for ID:', selectedPortfolio.id)
          const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/balance`)
          const { balances, isEmpty } = await response.json()
          console.log('Received balances:', balances)
          
          if (isEmpty) {
            if (mounted) {
              setData({
                assets: [],
                selectedAsset: initialAssets[0],
                pieChartData: [],
                isEmpty: true
              })
            }
            return
          }

          const assets = await Promise.all((balances as PortfolioBalance[]).map(async (balance: PortfolioBalance) => {
            try {
              const response = await fetch(`/api/market/metadata/${balance.coin_ticker}`)
              const metadata = await response.json()
              
              // Используем дефолтные значения, если метаданных нет
              return {
                name: metadata?.name || balance.coin_ticker,
                symbol: balance.coin_ticker,
                logo: metadata?.logo || '/images/default-coin.png',
                amount: balance.amount,
                price: metadata?.current_price || 1, // для стейблкоинов используем 1
                change24h: metadata?.price_change_24h || 0,
                change7d: 0,
                value: balance.amount * (metadata?.current_price || 1),
                profit: 0,
                percentage: 0,
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
              }
            } catch (error) {
              console.error(`Failed to load metadata for ${balance.coin_ticker}:`, error)
              // Возвращаем базовый объект в случае ошибки
              return {
                name: balance.coin_ticker,
                symbol: balance.coin_ticker,
                logo: '/images/default-coin.png',
                amount: balance.amount,
                price: 1,
                change24h: 0,
                change7d: 0,
                value: balance.amount,
                profit: 0,
                percentage: 0,
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
              }
            }
          }))

          const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
          assets.forEach(asset => {
            asset.percentage = totalValue > 0 ? (asset.value / totalValue * 100) : 0
          })

          if (mounted) {
            setData({
              assets,
              selectedAsset: assets[0],
              pieChartData: generatePieChartData(assets),
              isEmpty: false
            })
          }
        }
      } catch (error) {
        console.error('Failed to load portfolio data:', error)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [selectedPortfolio])

  return data
}

// Вспомогательная функция для генерации данных пирога
function generatePieChartData(assets: Asset[]) {
  const topAssets = assets.slice(0, 7)
  const otherAssets = assets.slice(7)
  
  return otherAssets.length > 0 ? [
    ...topAssets,
    {
      name: 'Other',
      symbol: 'OTHER',
      value: otherAssets.reduce((sum, asset) => sum + asset.value, 0),
      percentage: otherAssets.reduce((sum, asset) => sum + asset.percentage, 0),
      color: '#808080'
    }
  ] : assets
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
      interval = 14 * 24 * 60 * 60 * 1000 // кажды две недели
      break
    case '1Y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      interval = 30 * 24 * 60 * 60 * 1000 // каждый месяц
      break
    case 'ALL':
      return portfolioData // используем данные из импорта
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
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeType>('24H')
  const [chartData, setChartData] = useState(portfolioData)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const assetsData = useAssetsData(selectedPortfolio)
  const currentSelectedAsset = selectedAsset || assetsData?.selectedAsset
  const isEmptyPortfolio = assetsData?.isEmpty || false
  
  const portfolioRisk = useMemo(() => {
    if (!assetsData?.assets) return 0
    const volatilityFactor = assetsData.assets.reduce((acc, asset) => {
      return acc + (Math.abs(asset.change24h) + Math.abs(asset.change7d)) * (asset.percentage / 100)
    }, 0)
    return Math.min(Math.max(volatilityFactor * 2.5, 0), 100)
  }, [assetsData?.assets])

  useEffect(() => {
    console.log('Loading portfolios for user:', user?.id)
    const loadPortfolios = async () => {
      if (!user?.id) return
      try {
        const data = await getUserPortfolios(user.id)
        console.log('Received portfolios:', data)
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

  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolio) {
      console.log('Setting initial portfolio:', portfolios[0])
      handlePortfolioChange(portfolios[0])
    }
  }, [portfolios])

  const handlePortfolioChange = async (portfolio: Portfolio) => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (isDemoPortfolio(portfolio)) {
        setSelectedPortfolio(portfolio)
        setSelectedPortfolioId(portfolio.id.toString())
        setChartData(generateDataForTimeRange(timeRange))
        return
      }

      setSelectedPortfolio(portfolio)
      setSelectedPortfolioId(portfolio.id.toString())
      await loadPortfolioChartData(portfolio.id, timeRange)
      
    } catch (error) {
      console.error('Portfolio fetch failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to load portfolio')
      
      if (portfolios.length > 0) {
        const demoPortfolio = portfolios.find(p => isDemoPortfolio(p))
        if (demoPortfolio) {
          setSelectedPortfolio(demoPortfolio)
          setSelectedPortfolioId(demoPortfolio.id.toString())
          setChartData(generateDataForTimeRange(timeRange))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadPortfolioChartData = async (portfolioId: string | number, range: TimeRangeType) => {
    try {
      let period: Period
      switch(range) {
        case '24H':
          period = Period.HOUR_24
          break
        case '1W':
        case '1M':
        case '3M':
        case '6M':
        case '1Y':
          period = Period.HOUR_24
          break
        default:
          period = Period.HOUR_24
      }
      
      const response = await fetch(`/api/portfolio/${portfolioId}/history?period=${period}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch chart data')
      }
      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received')
      }
      setChartData(data)
    } catch (error) {
      console.error('Failed to load portfolio chart data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load chart data')
      setChartData([])
    }
  }

  // 2. Все useMemo хуки
  const { highestValue, highestValueDate } = useMemo(() => {
    if (!chartData.length) return { highestValue: 0, highestValueDate: null }
    
    const highest = Math.max(...chartData.map(item => item.value))
    const date = chartData.find(item => item.value === highest)?.date
    
    return {
      highestValue: highest,
      highestValueDate: date
    }
  }, [chartData])

  const dateFormatter = useMemo(() => 
    getDateFormatter(timeRange)
  , [timeRange])

  // Сздаем мемоизированную функцию для загрузки данных
  const loadChartData = useCallback((portfolio: Portfolio, range: TimeRangeType) => {
    if (isDemoPortfolio(portfolio)) {
      setChartData(generateDataForTimeRange(range))
    } else {
      loadPortfolioChartData(portfolio.id, range)
    }
  }, [])

  // Обновляем useEffect с правильными зависимостями
  useEffect(() => {
    if (selectedPortfolio) {
      loadChartData(selectedPortfolio, timeRange)
    }
  }, [timeRange, selectedPortfolio, loadChartData])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    )
  }

  if (!assetsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const assets = assetsData?.assets || []
  const pieChartData = assetsData?.pieChartData || []

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
    if (!assetsData?.assets) return 0
    
    const volatilityFactor = assetsData.assets.reduce((acc, asset) => {
      return acc + (Math.abs(asset.change24h) + Math.abs(asset.change7d)) * (asset.percentage / 100)
    }, 0)
    return Math.min(Math.max(volatilityFactor * 2.5, 0), 100)
  }

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
              {!assetsData ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-white">
                      ${assetsData?.assets?.reduce((sum, asset) => sum + (asset.value || 0), 0).toLocaleString() || '0'}
                    </div>
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
                            {assetsData?.assets?.map((asset, index) => (
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