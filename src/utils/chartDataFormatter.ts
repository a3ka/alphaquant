import { ChartDataPoint, TimeRangeType, Period } from '@/src/types/portfolio.types'
import { DataRangeInfo, TimeRangeConfig } from '@/src/types/chart.types'

export const CHART_CONFIG = {
  height: 300,
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
  colors: {
    grid: '#1F2937',
    axis: '#9CA3AF',
    gradient: {
      start: '#8B5CF6',
      end: '#EC4899'
    },
    tooltip: {
      background: '#1F2937',
      text: '#E5E7EB'
    }
  }
}

export const TIME_RANGE_CONFIGS: Record<TimeRangeType, TimeRangeConfig> = {
  '24H': {
    interval: 'hour',
    format: { hour: '2-digit', minute: '2-digit', hour12: false },
    tooltipFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    maxPoints: 24,
    axisInterval: 'hour',
    axisPoints: 24,
    dataInterval: Period.MINUTE_15,
    dateFormat: 'HH:mm'
  },
  '1W': {
    interval: 'day',
    format: { month: 'short', day: 'numeric' },
    tooltipFormat: { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
    maxPoints: 7,
    axisInterval: 'day',
    axisPoints: 'auto',
    dataInterval: Period.MINUTE_15,
    dateFormat: 'MMM d'
  },
  '1M': {
    interval: 'day',
    format: { month: 'short', day: 'numeric' },
    tooltipFormat: { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
    maxPoints: 30,
    axisInterval: 'day',
    axisPoints: 'auto',
    dataInterval: Period.HOUR_1,
    dateFormat: 'MMM d'
  },
  '3M': {
    interval: 'day',
    format: { month: 'short', day: 'numeric' },
    tooltipFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    maxPoints: 90,
    axisInterval: 'day',
    axisPoints: 12,
    dataInterval: Period.HOUR_4,
    dateFormat: 'MMM d'
  },
  '6M': {
    interval: 'day',
    format: { month: 'short', day: 'numeric' },
    tooltipFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    maxPoints: 180,
    axisInterval: 'day',
    axisPoints: 12,
    dataInterval: Period.HOUR_4,
    dateFormat: 'MMM d'
  },
  '1Y': {
    interval: 'month',
    format: { month: 'short', day: 'numeric' },
    tooltipFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    maxPoints: 365,
    axisInterval: 'month',
    axisPoints: 12,
    dataInterval: Period.HOUR_24,
    dateFormat: 'MMM d'
  },
  'ALL': {
    interval: 'month',
    format: { month: 'short', year: '2-digit' },
    tooltipFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    maxPoints: 12,
    axisInterval: 'auto',
    axisPoints: 12,
    dataInterval: Period.HOUR_24,
    dateFormat: 'MMM d, yyyy'
  }
}

export const formatChartData = (
  data: ChartDataPoint[], 
  timeRange: TimeRangeType,
  dataInfo: DataRangeInfo
): ChartDataPoint[] => {
  const config = TIME_RANGE_CONFIGS[timeRange]
  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  if (timeRange === '24H') {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const filteredData = sortedData.filter(point => 
      new Date(point.timestamp) >= twentyFourHoursAgo
    )

    // Группируем по 15-минутным интервалам
    const groupedData = new Map<string, ChartDataPoint>()
    filteredData.forEach(point => {
      const date = new Date(point.timestamp)
      date.setMinutes(Math.floor(date.getMinutes() / 15) * 15)
      date.setSeconds(0)
      date.setMilliseconds(0)
      const key = date.toISOString()
      if (!groupedData.has(key)) {
        groupedData.set(key, point)
      }
    })

    return Array.from(groupedData.values())
  }

  if (timeRange === '1W') {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const filteredData = sortedData.filter(point => 
      new Date(point.timestamp) >= weekAgo
    )

    // Группируем по 15-минутным интервалам
    const groupedData = new Map<string, ChartDataPoint>()
    filteredData.forEach(point => {
      const date = new Date(point.timestamp)
      // Округляем до 15 минут
      const minutes = date.getMinutes()
      const roundedMinutes = Math.floor(minutes / 15) * 15
      date.setMinutes(roundedMinutes, 0, 0)
      
      const key = date.toISOString()
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          ...point,
          timestamp: date.toISOString() // Обновляем timestamp до округленного значения
        })
      }
    })

    return Array.from(groupedData.values())
  }

  if (timeRange === '1M') {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const filteredData = sortedData.filter(point => 
      new Date(point.timestamp) >= monthAgo
    )

    // Группируем по часам
    const groupedData = new Map<string, ChartDataPoint>()
    filteredData.forEach(point => {
      const date = new Date(point.timestamp)
      date.setMinutes(0, 0, 0)
      const key = date.toISOString()
      
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          ...point,
          timestamp: date.toISOString()
        })
      }
    })

    // Добавляем текущий час
    const currentHour = new Date()
    currentHour.setMinutes(0, 0, 0)
    const currentKey = currentHour.toISOString()
    
    if (!groupedData.has(currentKey) && groupedData.size > 0) {
      const lastPoint = Array.from(groupedData.values()).pop()!
      groupedData.set(currentKey, {
        ...lastPoint,
        timestamp: currentKey
      })
    }

    return Array.from(groupedData.values())
  }

  if (timeRange === '3M') {
    const now = new Date()
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const filteredData = sortedData.filter(point => 
      new Date(point.timestamp) >= threeMonthsAgo
    )

    // Группируем данные
    const groupedData = new Map<string, ChartDataPoint>()
    const uniqueDaysCount = dataInfo.uniqueDates.size

    filteredData.forEach(point => {
      const date = new Date(point.timestamp)
      
      if (uniqueDaysCount <= 14) {
        // Если дней меньше или равно 14, группируем по дням
        date.setHours(0, 0, 0, 0)
      } else {
        // Иначе группируем по неделям
        const dayOfWeek = date.getDay()
        date.setDate(date.getDate() - dayOfWeek) // Устанавливаем на начало недели
        date.setHours(0, 0, 0, 0)
      }
      
      const key = date.toISOString()
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          ...point,
          timestamp: date.toISOString()
        })
      }
    })

    // Добавляем текущую точку, если её нет
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const currentKey = currentDate.toISOString()
    
    if (!groupedData.has(currentKey) && groupedData.size > 0) {
      const lastPoint = Array.from(groupedData.values()).pop()!
      groupedData.set(currentKey, {
        ...lastPoint,
        timestamp: currentKey
      })
    }

    return Array.from(groupedData.values())
  }

  if (timeRange === '6M') {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const filteredData = sortedData.filter(point => 
      new Date(point.timestamp) >= sixMonthsAgo
    )

    // Группируем данные
    const groupedData = new Map<string, ChartDataPoint>()
    const uniqueDaysCount = dataInfo.uniqueDates.size

    filteredData.forEach(point => {
      const date = new Date(point.timestamp)
      
      if (uniqueDaysCount <= 14) {
        // Если дней меньше 14, группируем по дням
        date.setHours(0, 0, 0, 0)
      } else {
        // Группируем по 2 недели
        const weekNumber = Math.floor(date.getDate() / 14)
        date.setDate(1) // Устанавливаем на начало месяца
        date.setDate(weekNumber * 14) // Устанавливаем на начало двухнедельного периода
        date.setHours(0, 0, 0, 0)
      }
      
      const key = date.toISOString()
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          ...point,
          timestamp: date.toISOString()
        })
      }
    })

    return Array.from(groupedData.values())
  }

  if (timeRange === '1Y') {
    const now = new Date()
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    const filteredData = sortedData.filter(point => 
      new Date(point.timestamp) >= yearAgo
    )

    // Группируем данные
    const groupedData = new Map<string, ChartDataPoint>()
    const uniqueDaysCount = dataInfo.uniqueDates.size

    filteredData.forEach(point => {
      const date = new Date(point.timestamp)
      
      if (uniqueDaysCount <= 14) {
        // Если дней меньше 14, группируем по дням
        date.setHours(0, 0, 0, 0)
      } else {
        // Группируем по месяцам
        date.setDate(1)
        date.setHours(0, 0, 0, 0)
      }
      
      const key = date.toISOString()
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          ...point,
          timestamp: date.toISOString()
        })
      }
    })

    return Array.from(groupedData.values())
  }

  if (timeRange === 'ALL') {
    // Группируем данные по месяцам
    const groupedData = new Map<string, ChartDataPoint>()

    sortedData.forEach(point => {
      const date = new Date(point.timestamp)
      date.setDate(1) // Устанавливаем на начало месяца
      date.setHours(0, 0, 0, 0)
      
      const key = date.toISOString()
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          ...point,
          timestamp: date.toISOString()
        })
      }
    })

    return Array.from(groupedData.values())
  }

  // Для остальных периодов группируем по интервалу из конфигурации
  const groupedData = new Map<string, ChartDataPoint>()
  sortedData.forEach(point => {
    const date = new Date(point.timestamp)
    const interval = config.dataInterval
    
    // Округляем до нужного интервала
    switch (interval) {
      case Period.HOUR_1:
        date.setMinutes(0, 0, 0)
        break
      case Period.HOUR_4:
        date.setHours(Math.floor(date.getHours() / 4) * 4, 0, 0, 0)
        break
      case Period.HOUR_24:
        date.setHours(0, 0, 0, 0)
        break
    }
    
    const key = date.toISOString()
    if (!groupedData.has(key)) {
      groupedData.set(key, point)
    }
  })

  return Array.from(groupedData.values())
}

export const getFormattedDate = (value: string, config: TimeRangeConfig): string => {
  return new Date(value).toLocaleDateString('en-US', config.format)
}

export const getTooltipDate = (label: string, config: TimeRangeConfig): string => {
  return new Date(label).toLocaleDateString('en-US', config.tooltipFormat)
}