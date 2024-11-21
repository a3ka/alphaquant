import { useState, useCallback, useEffect } from 'react'
import { Portfolio, TimeRangeType, isDemoPortfolio } from '@/src/types/portfolio.types'
import { getPeriodByRange } from '@/src/utils/date'
import { generateDataForTimeRange } from '@/app/data/fakePortfolio'
import { ChartDataPoint } from '@/src/types/portfolio.types'



export const usePortfolioHistory = (selectedPortfolio: Portfolio | null, timeRange: TimeRangeType) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadChartData = useCallback(async () => {
    if (!selectedPortfolio) return
    setIsLoading(true)
    setError(null)

    try {
      if (isDemoPortfolio(selectedPortfolio)) {
        setChartData(generateDataForTimeRange(timeRange))
        return
      }

      const period = getPeriodByRange(timeRange)
      const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/history?period=${period}&days=${timeRange}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch chart data')
      }
      
      const data = await response.json()
      setChartData(data)
    } catch (error) {
      console.error('Failed to load chart data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load chart data')
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedPortfolio, timeRange])

  useEffect(() => {
    loadChartData()
  }, [loadChartData])

  return { chartData, error, isLoading }
}