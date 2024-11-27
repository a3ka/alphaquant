import { useMemo } from 'react'
import { Portfolio, Period } from '@/src/types/portfolio.types'
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
    const isDemoPortfolio = selectedPortfolio?.id === 'fake-portfolio'

    if (!selectedPortfolio || !assets?.length) {
      return {
        totalValue: 0,
        totalProfit: 0,
        profitPercentage: 0
      }
    }

    if (isDemoPortfolio && 'data' in selectedPortfolio) {
      return {
        totalValue: selectedPortfolio.data.totalValue,
        totalProfit: selectedPortfolio.data.totalProfit,
        profitPercentage: selectedPortfolio.data.profitPercentage
      }
    }

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const previousDayValue = chartData
      ?.filter(point => point.period === Period.MINUTE_15)
      .find(point => {
        const pointDate = new Date(point.date)
        const timeDiff = Math.abs(pointDate.getTime() - oneDayAgo.getTime())
        return timeDiff <= 15 * 60 * 1000
      })?.value || totalValue
    
    const totalProfit = totalValue - previousDayValue
    const profitPercentage = previousDayValue ? (totalProfit / previousDayValue) * 100 : 0

    console.log('Portfolio Metrics:', {
      id: selectedPortfolio.id,
      totalValue,
      totalProfit,
      profitPercentage,
      previousDayValue
    })

    return {
      totalValue,
      totalProfit,
      profitPercentage
    }
  }, [selectedPortfolio, assets, chartData])
}