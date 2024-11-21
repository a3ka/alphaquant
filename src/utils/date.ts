import { TimeRangeType, Period } from '@/src/types/portfolio.types'

export const getStartDate = (range: TimeRangeType): Date => {
  const now = new Date()
  switch(range) {
    case '24H':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '1M':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '3M':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '6M':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case '1Y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
}

export const getPeriodByRange = (range: TimeRangeType): Period => {
  switch(range) {
    case '24H':
      return Period.HOUR_1
    case '1W':
      return Period.HOUR_4
    case '1M':
    case '3M':
    case '6M':
    case '1Y':
      return Period.HOUR_24
    default:
      return Period.HOUR_24
  }
}

export const getDateFormatter = (range: TimeRangeType) => {
  switch (range) {
    case '24H':
      return (date: string) => new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    case '1W':
      return (date: string) => new Date(date).toLocaleDateString('en-US', {
        weekday: 'short'
      })
    case '1M':
    case '3M':
      return (date: string) => new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    default:
      return (date: string) => new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      })
  }
}