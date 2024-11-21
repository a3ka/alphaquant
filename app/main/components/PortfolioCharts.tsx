'use client'

import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Sector, ReferenceLine } from "recharts"
import { MouseEvent, useMemo, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartDataPoint, TimeRangeType, PortfolioChartsProps, Asset, PieChartDataItem } from '@/src/types/portfolio.types'
import { PortfolioSelector } from './PortfolioSelector'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { FakePortfolio } from '@/app/data/fakePortfolio'


export function PortfolioCharts({
  timeRange,
  setTimeRange,
  portfolioData,
  pieChartData: initialPieChartData,
  assets,
  currentSelectedAsset,
  setSelectedAsset,
  portfolioRisk,
  getRiskColor,
  formatYAxis,
  formatDate,
  onPortfolioChange,
  setIsAddTransactionOpen,
  selectedPortfolio
}: PortfolioChartsProps) {
  useEffect(() => {
    if (!currentSelectedAsset && processedPieChartData.length > 0) {
      const firstAsset = assets.find(asset => asset.symbol === processedPieChartData[0].symbol)
      if (firstAsset) {
        setSelectedAsset(firstAsset)
      }
    }
  }, [])

  const handleTimeRangeChange = (value: string) => {
    if (value === '24H' || value === '1W' || value === '1M' || value === '3M' || value === '6M' || value === '1Y' || value === 'ALL') {
      setTimeRange(value as TimeRangeType)
    }
  }

  const processedPieChartData = useMemo(() => {
    // Сортируем по процентам в портфеле
    const sortedData = [...initialPieChartData].sort((a, b) => b.percentage - a.percentage)
    
    // Берем топ-7 активов
    const topAssets = sortedData.slice(0, 7)
    
    // Считаем общую сумму оставшихся активов
    const otherAssets = sortedData.slice(7)
    const otherValue = otherAssets.reduce((sum, asset) => sum + asset.value, 0)
    const otherPercentage = otherAssets.reduce((sum, asset) => sum + asset.percentage, 0)
    
    if (otherAssets.length === 0) return topAssets

    return [
      ...topAssets,
      {
        name: 'Other',
        symbol: 'OTHER',
        value: otherValue,
        percentage: otherPercentage,
        color: '#6B7280'
      }
    ]
  }, [initialPieChartData])

  const highestValue = Math.max(...portfolioData.map((item: ChartDataPoint) => item.value))
  const highestValueDate = portfolioData.find(item => item.value === highestValue)?.date

  const handlePieClick = (_: MouseEvent<SVGElement>, index: number) => {
    const clickedItem = processedPieChartData[index];
    if (clickedItem.symbol === 'OTHER') return;
    
    const correspondingAsset = assets.find(asset => asset.symbol === clickedItem.symbol);
    if (correspondingAsset) {
      setSelectedAsset(correspondingAsset);
    }
  };

  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-white text-xl font-semibold">Portfolio Overview</CardTitle>
          <Tabs value={timeRange} onValueChange={handleTimeRangeChange}>
            <TabsList className="bg-[#1F2937] border border-gray-700">
              {['24H', '1W', '1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
                <TabsTrigger 
                  key={range}
                  className="data-[state=active]:bg-[#374151] text-gray-400 data-[state=active]:text-white hover:text-white" 
                  value={range}
                >
                  {range}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {/* <PortfolioSelector onPortfolioChange={onPortfolioChange} /> */}
        <PortfolioSelector 
          onPortfolioChange={onPortfolioChange}
          externalSelectedPortfolio={selectedPortfolio || FakePortfolio}
        />
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
                tickFormatter={formatDate}
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
                    data={processedPieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="symbol"
                    onClick={handlePieClick}
                    activeIndex={processedPieChartData.findIndex(a => a.symbol === currentSelectedAsset?.symbol)}
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
                    {processedPieChartData.map((entry: PieChartDataItem, index: number) => (
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
                        {entry.payload.symbol !== 'OTHER' && entry.payload.amount && (
                          <>
                            <div className="text-[0.6rem] text-gray-300">
                              Amount: {entry.payload.amount.toLocaleString()} {name}
                            </div>
                            {entry.payload.change24h !== undefined && entry.payload.change7d !== undefined && (
                              <div className="flex justify-between text-[0.6rem]">
                                <span>24h: <span className={entry.payload.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>{entry.payload.change24h.toFixed(2)}%</span></span>
                                <span>7d: <span className={entry.payload.change7d >= 0 ? 'text-green-400' : 'text-red-400'}>{entry.payload.change7d.toFixed(2)}%</span></span>
                              </div>
                            )}
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
              {processedPieChartData.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      {asset.symbol === 'OTHER' ? (
                        <AvatarFallback>OTH</AvatarFallback>
                      ) : (
                        <AvatarImage src={asset.logo} alt={asset.name} />
                      )}
                    </Avatar>
                    <span className="text-white text-sm">{asset.name}</span>
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
      </CardContent>
    </Card>
  )
} 