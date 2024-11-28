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
    if (!selectedPortfolio || !assets.length || !chartData.length) {
      return { totalValue: 0, totalProfit: 0, profitPercentage: 0 }
    }

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
    
    const sortedData = [...chartData].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return dateB - dateA
    })

    console.log('Sorted data check:', {
      total: sortedData.length,
      first: sortedData[0],
      last: sortedData[sortedData.length - 1]
    })

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const historicalRecord = sortedData.find(record => 
      new Date(record.timestamp) <= oneDayAgo
    )

    if (!historicalRecord) {
      console.log('No historical record found for portfolio:', selectedPortfolio.id)
      return { totalValue, totalProfit: 0, profitPercentage: 0 }
    }

    const totalProfit = totalValue - historicalRecord.total_value
    const profitPercentage = Number(((totalProfit / historicalRecord.total_value) * 100).toFixed(2))

    return { totalValue, totalProfit, profitPercentage }
  }, [selectedPortfolio?.id, assets, chartData])
}