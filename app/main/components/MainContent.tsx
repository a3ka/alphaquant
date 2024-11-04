'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { ArrowDown, ArrowUp, BarChart2, MoreVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const portfolioData = Array.from({ length: 30 }, (_, i) => ({
  date: `2023-${(i + 1).toString().padStart(2, '0')}-01`,
  value: 250000 + Math.random() * 100000
}))

const assets = [
  { 
    name: 'Bitcoin',
    symbol: 'BTC',
    amount: 2.5,
    price: 45000,
    change24h: 2.3,
    change7d: 5.1,
    value: 112500,
    profit: 15000
  },
  { 
    name: 'Ethereum',
    symbol: 'ETH',
    amount: 30,
    price: 3000,
    change24h: -1.2,
    change7d: 3.7,
    value: 90000,
    profit: 7500
  },
  { 
    name: 'Cardano',
    symbol: 'ADA',
    amount: 10000,
    price: 1.2,
    change24h: 0.5,
    change7d: -2.1,
    value: 12000,
    profit: -500
  },
  { 
    name: 'Binance Coin',
    symbol: 'BNB',
    amount: 50,
    price: 300,
    change24h: 1.8,
    change7d: 4.2,
    value: 15000,
    profit: 2000
  },
  { 
    name: 'Solana',
    symbol: 'SOL',
    amount: 200,
    price: 40,
    change24h: -0.7,
    change7d: 6.5,
    value: 8000,
    profit: 1200
  },
]

const assetDistribution = [
  { name: 'BTC', value: 112500 },
  { name: 'ETH', value: 90000 },
  { name: 'ADA', value: 12000 },
  { name: 'BNB', value: 15000 },
  { name: 'Others', value: 44500 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function MainContent() {
  const [timeRange, setTimeRange] = useState('24H')
  const [portfolioValue, setPortfolioValue] = useState(299441.37)
  const [portfolioChange, setPortfolioChange] = useState({ value: 5143.97, percentage: 1.75 })

  useEffect(() => {
    // Simulating data updates
    const interval = setInterval(() => {
      // Update portfolio data
      setPortfolioValue(prevValue => {
        const newValue = prevValue + (Math.random() - 0.5) * 5000
        const change = newValue - prevValue
        const changePercentage = (change / prevValue) * 100
        setPortfolioChange({ value: change, percentage: changePercentage })
        return newValue
      })

      // Update asset data
      assets.forEach(asset => {
        asset.price *= (1 + (Math.random() - 0.5) * 0.01)
        asset.change24h += (Math.random() - 0.5) * 0.5
        asset.change7d += (Math.random() - 0.5) * 0.5
        asset.value = asset.amount * asset.price
        asset.profit = asset.value - (asset.amount * asset.price * 0.95) // Assuming 5% initial profit
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="col-span-12 lg:col-span-6 p-6 overflow-visible">
      <div className="container mx-auto max-w-full">
        <div className="grid grid-cols-12 gap-4">
          {/* Portfolio section with unified border */}
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
                  <div className="text-3xl font-bold text-white">${portfolioValue.toFixed(2)}</div>
                  <div className={`flex items-center ${portfolioChange.value >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                    {portfolioChange.value >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    {portfolioChange.percentage.toFixed(2)}% (${Math.abs(portfolioChange.value).toFixed(2)})
                  </div>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0B84D4" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#0B84D4' }}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="w-1/2">
                    <h3 className="text-white font-semibold  mb-2">Asset Distribution</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {assetDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                            labelStyle={{ color: '#E5E7EB' }}
                            itemStyle={{ color: '#0B84D4' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="w-1/2 pl-4">
                    <h3 className="text-white font-semibold mb-2">Quick Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]">Total Assets:</span>
                        <span className="text-white">{assets.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]">Best Performer:</span>
                        <span className="text-[#4ADE80]">
                          {assets.reduce((best, asset) => asset.change7d > best.change7d ? asset : best).symbol} 
                          ({assets.reduce((best, asset) => asset.change7d > best.change7d ? asset : best).change7d.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]">Worst Performer:</span>
                        <span className="text-[#FF4D4D]">
                          {assets.reduce((worst, asset) => asset.change7d < worst.change7d ? asset : worst).symbol}
                          ({assets.reduce((worst, asset) => asset.change7d < worst.change7d ? asset : worst).change7d.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#D1D5DB]">24h Change:</span>
                        <span className={portfolioChange.value >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}>
                          ${Math.abs(portfolioChange.value).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Input 
                      placeholder="Search assets..." 
                      className="max-w-xs bg-[#0A1929] border-gray-600 text-white"
                    />
                    <Button variant="outline" size="sm">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Portfolio Analytics
                    </Button>
                  </div>

                  <div className="rounded-lg border border-gray-800/30 overflow-hidden">
                    <div className="grid grid-cols-8 gap-4 p-2 text-sm text-[#D1D5DB] bg-[#0A1929]">
                      <div className="col-span-2">Asset</div>
                      <div className="text-right text-sm text-white">Amount</div>
                      <div className="text-right text-sm text-white">24h</div>
                      <div className="text-right text-sm text-white">7d</div>
                      <div className="text-right text-sm text-white">Price</div>
                      <div className="text-right text-sm text-white">Value</div>
                      <div className="text-right text-sm text-white">P/L</div>
                    </div>
                    <div className="flex flex-col">
                      {assets.map((asset, index) => (
                        <motion.div 
                          key={asset.symbol}
                          className={`grid grid-cols-8 gap-2 p-2 hover:bg-[#0A1929] cursor-pointer ${
                            index % 2 === 0 ? 'bg-[#010714]' : 'bg-[#010714]/50'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div className="col-span-2 flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={`/placeholder.svg?text=${asset.symbol}`} />
                              <AvatarFallback>{asset.symbol}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-white text-sm">{asset.name}</div>
                              <div className="text-xs text-[#9CA3AF]">{asset.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right text-white text-sm">{asset.amount}</div>
                          <div className={`text-right text-white text-sm ${asset.change24h >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                            {asset.change24h.toFixed(2)}%
                          </div>
                          <div className={`text-right text-white text-sm ${asset.change7d >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                            {asset.change7d.toFixed(2)}%
                          </div>
                          <div className="text-right text-white text-sm">${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          <div className="text-right text-white text-sm">${asset.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                          <div className={`text-right text-white text-sm ${asset.profit >= 0 ? 'text-[#4ADE80]' : 'text-[#FF4D4D]'}`}>
                            ${Math.abs(asset.profit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export { MainContent }