'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { Portfolio, TimeRangeType } from '@/src/types/portfolio.types'
import { PortfolioSelector } from './PortfolioSelector'
import { AddTransactionDialog } from "./Add-Transaction"
import { usePortfolioHistory } from '@/src/hooks/portfolio/usePortfolioHistory'
import { useAssetsData } from '@/src/hooks/portfolio/useAssetsData'
import { FakePortfolio } from '@/app/data/fakePortfolio'
import { Button } from '@/components/ui/button'
import { PortfolioCharts } from './PortfolioCharts'
import { PortfolioTable } from './PortfolioTable'
import { EmptyPortfolioState } from './EmptyPortfolioState'

export function MainContent() {
  const { user } = useUser()
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('')
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeType>('24H')

  const assetsData = useAssetsData(selectedPortfolio)
  const { chartData, error: chartError, isLoading: chartLoading } = usePortfolioHistory(selectedPortfolio, timeRange)

  const currentSelectedAsset = assetsData?.selectedAsset
  const isLoading = chartLoading || !assetsData

  const isEmptyPortfolio = !isLoading && assetsData?.isEmpty

  // Проверяем есть ли активы в портфеле
  const hasAssets = assetsData?.assets && assetsData.assets.length > 0

  // Вычисляем риск портфеля
  const portfolioRisk = useMemo(() => {
    if (!assetsData?.assets) return 0
    const volatilityFactor = assetsData.assets.reduce((acc, asset) => {
      return acc + (Math.abs(asset.change24h) + Math.abs(asset.change7d)) * (asset.percentage / 100)
    }, 0)
    return Math.min(Math.max(volatilityFactor * 2.5, 0), 100)
  }, [assetsData?.assets])

  // Обработчик смены портфеля
  const handlePortfolioChange = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setSelectedPortfolioId(portfolio.id.toString())
  }

  // Инициализация первого портфеля
  useEffect(() => {
    if (!selectedPortfolio) {
      handlePortfolioChange(FakePortfolio)
    }
  }, [])

  if (chartError || assetsData?.error) {
    return (
      <main className="w-full bg-[#010714] rounded-lg border border-gray-400">
        <Card className="bg-transparent">
          <CardContent className="flex items-center justify-center h-[600px] text-red-500">
            {chartError || assetsData?.error}
          </CardContent>
        </Card>
      </main>
    )
  }

  // Если нет активов, показываем EmptyPortfolioState
  if (!hasAssets) {
    return (
      <EmptyPortfolioState 
        onAddTransaction={() => setIsAddTransactionOpen(true)}
        onPortfolioChange={handlePortfolioChange}
        selectedPortfolio={selectedPortfolio}
      />
    )
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-green-500'
    if (risk < 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <main className="w-full bg-[#010714] rounded-lg border border-gray-400">
      <Card className="bg-transparent">
        <CardContent className="p-6">
          <div className="space-y-6">

            <PortfolioCharts
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              portfolioData={chartData}
              pieChartData={assetsData?.pieChartData || []}
              assets={assetsData?.assets || []}
              currentSelectedAsset={currentSelectedAsset}
              setSelectedAsset={assetsData?.setSelectedAsset}
              portfolioRisk={portfolioRisk}
              getRiskColor={getRiskColor}
              formatYAxis={formatYAxis}
              formatDate={(date) => new Date(date).toLocaleDateString()}
              onPortfolioChange={handlePortfolioChange}
              setIsAddTransactionOpen={setIsAddTransactionOpen}
            />

            <PortfolioTable 
              assets={assetsData?.assets || []}
              isAddTransactionOpen={isAddTransactionOpen}
              setIsAddTransactionOpen={setIsAddTransactionOpen}
              currentSelectedAsset={currentSelectedAsset}
              setSelectedAsset={assetsData?.setSelectedAsset}
            />
          </div>
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