import { ChartDataPoint, TimeRangeType } from '@/src/types/portfolio.types'
import { DataRangeInfo } from '@/src/types/chart.types'

export const analyzeChartData = (data: ChartDataPoint[]): DataRangeInfo => {
  if (!data?.length) {
    return {
      totalDays: 0,
      uniqueDates: new Set(),
      firstDate: new Date(),
      lastDate: new Date(),
      dataPoints: 0,
      pointsPerDay: {}
    }
  }

  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const pointsPerDay: Record<string, number> = {}
  const uniqueDates = new Set<string>()

  sortedData.forEach(point => {
    const dateStr = new Date(point.timestamp).toISOString().split('T')[0]
    uniqueDates.add(dateStr)
    pointsPerDay[dateStr] = (pointsPerDay[dateStr] || 0) + 1
  })

  return {
    totalDays: uniqueDates.size,
    uniqueDates,
    firstDate: new Date(sortedData[0].timestamp),
    lastDate: new Date(sortedData[sortedData.length - 1].timestamp),
    dataPoints: sortedData.length,
    pointsPerDay
  }
}

export const getOptimalTimeRange = (dataInfo: DataRangeInfo): TimeRangeType => {
  const { totalDays } = dataInfo
  
  if (totalDays <= 1) return '24H'
  if (totalDays <= 7) return '1W'
  if (totalDays <= 30) return '1M'
  if (totalDays <= 90) return '3M'
  if (totalDays <= 180) return '6M'
  if (totalDays <= 365) return '1Y'
  return 'ALL'
}