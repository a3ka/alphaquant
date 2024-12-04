'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { Portfolio, TimeRangeType, Asset } from '@/src/types/portfolio.types'
import { PortfolioSelector } from './PortfolioSelector'
import { AddTransactionDialog } from "./Add-Transaction"
import { usePortfolioHistory } from '@/src/hooks/portfolio/usePortfolioHistory'
import { useAssetsData } from '@/src/hooks/portfolio/useAssetsData'
import { FakePortfolio } from '@/app/data/fakePortfolio'
import { Button } from '@/components/ui/button'
import { PortfolioCharts } from './PortfolioCharts'
import { PortfolioTable } from './PortfolioTable'
import { EmptyPortfolioState } from './EmptyPortfolioState'
import { usePortfolioValueMetrics } from '@/src/hooks/portfolio/usePortfolioValueMetrics'

export function MainContent() {
  const { user } = useUser()
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | undefined>(undefined)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('')
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeType>('24H')

  const { assets, pieChartData, selectedAsset, setSelectedAsset, error: assetsError, mutate: mutateAssets } = useAssetsData(selectedPortfolio)
  const { 
    data: chartData, 
    error: chartError, 
    isLoading: chartLoading,
    mutate: mutateChart 
  } = usePortfolioHistory(selectedPortfolio, timeRange)

  // Добавляем логирование для отладки
  console.log('Chart Data:', {
    length: chartData?.length,
    first: chartData?.[0],
    last: chartData?.[chartData?.length - 1]
  })

  const { totalValue, totalProfit, profitPercentage } = usePortfolioValueMetrics(
    selectedPortfolio,
    assets || [],
    chartData || []
  )

  const currentSelectedAsset = selectedAsset
  const isLoading = chartLoading || !assets

  const isEmptyPortfolio = !isLoading && (!assets || assets.length === 0)

  // Проверяем есть ли активы в портфеле
  const hasAssets = assets && assets.length > 0

  // Вычисляем риск портфеля
  const portfolioRisk = useMemo(() => {
    if (!assets) return 0
    const volatilityFactor = assets.reduce((acc: number, asset: Asset) => {
      return acc + (Math.abs(asset.change24h) + Math.abs(asset.change7d)) * (asset.percentage / 100)
    }, 0)
    return Math.min(Math.max(volatilityFactor * 2.5, 0), 100)
  }, [assets])

  // Обработчик смены портфеля
  const handlePortfolioChange = useCallback(async (portfolio: Portfolio) => {
    try {
      // Сначала инвалидируем кеш SWR для старого портфеля
      if (selectedPortfolio?.id) {
        await Promise.all([
          mutateAssets(),
          mutateChart()
        ])
      }
      
      // Сбрасываем выбранный актив при смене портфеля
      setSelectedAsset(undefined)
      
      // Устанавливаем новый портфель
      setSelectedPortfolio(portfolio)
      setSelectedPortfolioId(portfolio.id.toString())
      
      // Принудительно запрашиваем новые данные
      await Promise.all([
        mutateAssets(),
        mutateChart()
      ])
    } catch (error) {
      console.error('Failed to update portfolio data:', error)
    }
  }, [selectedPortfolio, mutateAssets, mutateChart, setSelectedAsset])

  // Инициализация первого портфеля
  useEffect(() => {
    if (!selectedPortfolio) {
      handlePortfolioChange(FakePortfolio)
    }
  }, [handlePortfolioChange, selectedPortfolio])

  const refreshData = useCallback(async () => {
    if (selectedPortfolio) {
      await Promise.all([
        mutateAssets(),
        mutateChart()
      ])
    }
  }, [selectedPortfolio, mutateAssets, mutateChart])

  if (chartError || assetsError) {
    return (
      <main className="w-full bg-[#010714] rounded-lg border border-gray-400">
        <Card className="bg-transparent">
          <CardContent className="flex items-center justify-center h-[600px] text-red-500">
            {chartError || assetsError}
          </CardContent>
        </Card>
      </main>
    )
  }

  // Если портфель пустой и загрузка завершена, показываем EmptyPortfolioState
  if (isEmptyPortfolio && !isLoading) {
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
              pieChartData={pieChartData || []}
              assets={assets || []}
              currentSelectedAsset={currentSelectedAsset}
              setSelectedAsset={setSelectedAsset}
              portfolioRisk={portfolioRisk}
              getRiskColor={getRiskColor}
              formatYAxis={formatYAxis}
              formatDate={(date) => new Date(date).toLocaleDateString()}
              onPortfolioChange={handlePortfolioChange}
              setIsAddTransactionOpen={setIsAddTransactionOpen}
              selectedPortfolio={selectedPortfolio}
              totalValue={totalValue}
              totalProfit={totalProfit}
              profitPercentage={profitPercentage}
              isLoading={isLoading}
            />

            <PortfolioTable 
              assets={assets || []}
              isAddTransactionOpen={isAddTransactionOpen}
              setIsAddTransactionOpen={setIsAddTransactionOpen}
              currentSelectedAsset={currentSelectedAsset}
              setSelectedAsset={setSelectedAsset}
            />
          </div>
        </CardContent>
      </Card>

      <AddTransactionDialog 
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        selectedPortfolioId={selectedPortfolioId}
        onSuccess={refreshData}
      />
    </main>
  )
}   