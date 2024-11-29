import { ChartDataPoint, TimeRangeType } from '@/src/types/portfolio.types'
import { CHART_CONFIG } from './config'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartDataPoint }>
  label?: string
  timeRange: TimeRangeType
}

export function ChartTooltip({ active, payload, label, timeRange }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null

  const formattedDate = timeRange === '24H'
    ? new Date(label || '').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : new Date(label || '').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

  return (
    <div className="bg-[#1F2937] border-0 rounded-lg p-2 shadow-lg">
      <p className="text-gray-400 text-xs">
        {formattedDate}
      </p>
      <p className="text-white text-sm font-medium">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
} 