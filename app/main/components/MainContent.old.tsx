'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Plus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Sector, ReferenceLine } from "recharts"
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

// Выносим логику загрузки данных в отдельный хук
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

// Основной компонент
export function MainContent() {
  const [timeRange, setTimeRange] = useState('24H')
  const [selectedAsset, setSelectedAsset] = useState<typeof initialAssets[0] | null>(null)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  console.log('🔄 MainContent rendering...')
  
  const data = useAssetsData()
  console.log('📦 Current data state:', {
    hasData: !!data,
    assetsLength: data?.assets?.length,
    selectedAsset: data?.selectedAsset?.symbol,
    pieChartLength: data?.pieChartData?.length
  })

  const highestValue = useMemo(() => 
    Math.max(...portfolioData.map(item => item.value))
  , []);
  
  const highestValueDate = useMemo(() => 
    portfolioData.find(item => item.value === highestValue)?.date
  , [highestValue]);

  if (!data) {
    console.log('⏳ Loading state...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  console.log('🎨 Rendering full component...')
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

  return (
    <main className="col-span-12 lg:col-span-6 p-6 overflow-visible">
      <div className="container mx-auto max-w-full">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 rounded-lg border border-gray-800/30 bg-[#010714] shadow-lg">
            <Card className="bg-transparent">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white text-xl font-semibold">Portfolio Overview</CardTitle>
                  <Tabs value={timeRange} onValueChange={setTimeRange}>
                    <TabsList>
                      <TabsTrigger value="24H">24H</TabsTrigger>
                      <TabsTrigger value="7D">7D</TabsTrigger>
                      <TabsTrigger value="1M">1M</TabsTrigger>
                      <TabsTrigger value="ALL">ALL</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-white">$299441.37</div>
                  <div className="flex items-center text-[#4ADE80]">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    1.75% ($5143.97)
                  </div>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#1F2937" 
                        horizontal={true} 
                        vertical={false} 
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => formatDate(value)}
                        tick={{ fontSize: 11 }}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tickFormatter={formatYAxis}
                        width={60}
                        tick={{ fontSize: 11 }}
                        dx={-10}
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
                      {highestValueDate && (
                        <ReferenceLine
                          x={highestValueDate}
                          stroke="#8B5CF6"
                          strokeDasharray="3 3"
                          label={{
                            position: 'top',
                            value: `High: $${highestValue.toLocaleString()}`,
                            fill: '#E5E7EB',
                            fontSize: 12,
                            offset: 20
                          }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 flex justify-between items-start">
                  <div className="w-1/2">
                    <h3 className="text-white font-semibold mb-2">Asset Distribution</h3>
                    <div className="h-[300px] relative">
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
                              if ('logo' in asset) {  // проверяем, что это полный объект актива
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
                      {currentSelectedAsset && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[90px] z-20"> 
                          <div className="text-base font-bold text-white">${currentSelectedAsset.value.toLocaleString()}</div>
                          <div className="text-xs font-medium text-white">{currentSelectedAsset.symbol}</div>
                          <div className="text-xs text-gray-400">{currentSelectedAsset.percentage.toFixed(2)}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-1/2 pl-4">
                    <h3 className="text-white font-semibold mb-4">Portfolio Distribution</h3>
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
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
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

                  <div className="rounded-lg border border-gray-800/30 overflow-hidden">
                    <div className="grid grid-cols-8 gap-4 p-2 text-sm text-[#D1D5DB] bg-[#0A1929]">
                      <div className="col-span-2">Asset</div>
                      <div className="text-right">Amount</div>
                      <div className="text-right">24h</div>
                      <div className="text-right">7d</div>
                      <div className="text-right">Price</div>
                      <div className="text-right">Value</div>
                      <div className="text-right">P/L</div>
                    </div>
                    <div className="flex flex-col">
                      <AnimatePresence>
                      {assets.map((asset, index) => (
                          <motion.div 
                            key={asset.symbol}
                            className={`grid grid-cols-8 gap-2 p-2 hover:bg-[#0A1929] cursor-pointer ${
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
                            <div className="text-right text-white text-sm">{asset.amount.toLocaleString()}</div>
                            <div className={`text-right text-sm ${asset.change24h >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                              {asset.change24h.toFixed(2)}%
                            </div>
                            <div className={`text-right text-sm ${asset.change7d >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                              {asset.change7d.toFixed(2)}%
                            </div>
                            <div className="text-right text-white text-sm">${asset.price.toFixed(2)}</div>
                            <div className="text-right text-white text-sm">${asset.value.toLocaleString()}</div>
                            <div className={`text-right text-sm ${asset.profit >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                              ${Math.abs(asset.profit).toLocaleString()}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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