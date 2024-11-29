import { useMemo } from 'react'
import { Portfolio, TimeRangeType } from '@/src/types/portfolio.types'
import { Asset, ChartDataPoint } from '@/src/types/portfolio.types'

interface PortfolioMetrics {
  totalValue: number
  totalProfit: number
  profitPercentage: number
}

export const usePortfolioValueMetrics = (
  selectedPortfolio: Portfolio | undefined,
  assets: Asset[],
  chartData: ChartDataPoint[]
): PortfolioMetrics => {
  return useMemo(() => {
    if (!selectedPortfolio || !assets.length || !chartData.length) {
      return { totalValue: 0, totalProfit: 0, profitPercentage: 0 }
    }

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
    
    // Берем первую и последнюю точки из данных графика
    const firstPoint = chartData[0]
    const lastPoint = chartData[chartData.length - 1]

    if (!firstPoint || !lastPoint) {
      return { totalValue, totalProfit: 0, profitPercentage: 0 }
    }

    const totalProfit = lastPoint.total_value - firstPoint.total_value
    const profitPercentage = Number(((totalProfit / firstPoint.total_value) * 100).toFixed(2))

    return { totalValue, totalProfit, profitPercentage }
  }, [selectedPortfolio?.id, assets, chartData])
}