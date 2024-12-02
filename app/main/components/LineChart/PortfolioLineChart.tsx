import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { ChartDataPoint, TimeRangeType } from '@/src/types/portfolio.types'
import { CHART_CONFIG, getTooltipDate, getFormattedDate, TIME_RANGE_CONFIGS } from '@/src/utils/chartDataFormatter'
import { ChartTooltip } from './ChartTooltip'
import { analyzeChartData, getOptimalTimeRange } from '@/src/utils/chartDataAnalyzer'
import { formatChartData } from '@/src/utils/chartDataFormatter'

interface PortfolioLineChartProps {
  data: ChartDataPoint[]
  timeRange: TimeRangeType
  formatYAxis: (value: number) => string
  formatDate: (date: string) => string
  highestValue: number
  highestValueDate: string | null
}

export function PortfolioLineChart({
  data,
  timeRange,
  formatYAxis,
  formatDate,
  highestValue,
  highestValueDate
}: PortfolioLineChartProps) {
  const dataInfo = useMemo(() => analyzeChartData(data), [data])
  const adaptedTimeRange = useMemo(() => getOptimalTimeRange(dataInfo), [dataInfo])
  const chartData = useMemo(() => formatChartData(data, adaptedTimeRange, dataInfo), [data, adaptedTimeRange, dataInfo])

  const config = TIME_RANGE_CONFIGS[adaptedTimeRange]

  const customFormatDate = (value: string): string => {
    if (timeRange === '24H') {
      const date = new Date(value)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    if (timeRange === '1W') {
      return getFormattedDate(value, config)
    }
    const date = new Date(value)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const tooltipLabelFormatter = (label: string): string => {
    return getTooltipDate(label, config)
  }

  const getAxisInterval = () => {
    if (timeRange === '24H') {
      return Math.max(1, Math.floor(chartData.length / 12))
    }
    
    if (timeRange === '1W') {
      return Math.floor(chartData.length / dataInfo.uniqueDates.size)
    }

    if (timeRange === '1M') {
      const uniqueDaysCount = dataInfo.uniqueDates.size
      const hoursInDay = 24
      
      if (uniqueDaysCount <= 14) {
        // Если дней меньше или равно 14, показываем все дни
        return Math.floor(chartData.length / uniqueDaysCount)
      } else {
        // Иначе вычисляем оптимальный интервал для 14 точек
        const interval = Math.ceil(uniqueDaysCount / 14)
        return Math.floor(chartData.length / (uniqueDaysCount / interval))
      }
    }

    return Math.max(1, Math.floor(chartData.length / (typeof config.axisPoints === 'number' ? config.axisPoints : 12)))
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
      <LineChart data={chartData} margin={CHART_CONFIG.margin}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_CONFIG.colors.gradient.start} stopOpacity={1}/>
            <stop offset="95%" stopColor={CHART_CONFIG.colors.gradient.end} stopOpacity={1}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={CHART_CONFIG.colors.grid} 
          horizontal={true} 
          vertical={false} 
        />
        
        <XAxis 
          dataKey="timestamp" 
          stroke={CHART_CONFIG.colors.axis}
          tickFormatter={customFormatDate}
          tick={{ fontSize: 11 }}
          dy={10}
          interval={getAxisInterval()}
          minTickGap={35}
          type="category"
          axisLine={{ stroke: CHART_CONFIG.colors.axis, strokeWidth: 1 }}
          tickLine={{ stroke: CHART_CONFIG.colors.axis, strokeWidth: 1 }}
        />
        
        <YAxis 
          stroke={CHART_CONFIG.colors.axis}
          tickFormatter={formatYAxis}
          width={60}
          tick={{ fontSize: 11 }}
          dx={-10}
          domain={['dataMin', 'dataMax']}
          padding={{ top: 20, bottom: 20 }}
        />
        
        <Tooltip 
          content={<ChartTooltip timeRange={adaptedTimeRange} />}
          labelFormatter={tooltipLabelFormatter}
        />
        
        <Line 
          type="monotone" 
          dataKey="total_value" 
          stroke="url(#colorGradient)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: CHART_CONFIG.colors.gradient.start }}
        />
        
        {highestValue && highestValueDate && (
          <ReferenceLine
            x={highestValueDate}
            stroke={CHART_CONFIG.colors.gradient.start}
            strokeDasharray="3 3"
            label={{
              position: 'top',
              value: `High: $${highestValue.toLocaleString()}`,
              fill: CHART_CONFIG.colors.tooltip.text,
              fontSize: 12,
              offset: 20
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
} 