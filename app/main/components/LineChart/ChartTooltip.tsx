import { ChartDataPoint, TimeRangeType } from '@/src/types/portfolio.types'
import { CHART_CONFIG, TIME_RANGE_CONFIGS } from '@/src/utils/chartDataFormatter'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartDataPoint }>
  label?: string
  timeRange: TimeRangeType
}

export function ChartTooltip({ active, payload, label, timeRange }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null

  const config = TIME_RANGE_CONFIGS[timeRange]
  const formattedDate = new Date(label || '').toLocaleDateString('en-US', config.tooltipFormat)

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