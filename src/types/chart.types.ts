import { ChartDataPoint, TimeRangeType, Period } from './portfolio.types'

export interface DataRangeInfo {
  totalDays: number
  uniqueDates: Set<string>
  firstDate: Date
  lastDate: Date
  dataPoints: number
  pointsPerDay: Record<string, number>
}

export interface TimeRangeConfig {
  interval: 'hour' | 'day' | 'week' | 'month'
  format: Intl.DateTimeFormatOptions
  tooltipFormat: Intl.DateTimeFormatOptions
  maxPoints: number
  axisInterval: 'hour' | 'day' | 'week' | 'month' | 'auto'
  axisPoints: number | 'auto'
  dataInterval: Period
  dateFormat: string
}
