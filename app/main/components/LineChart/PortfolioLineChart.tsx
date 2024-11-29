import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { ChartDataPoint, Period, TimeRangeType } from '@/src/types/portfolio.types'
import { CHART_CONFIG } from './config'
import { ChartTooltip } from './ChartTooltip'

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
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [data]);

  const customFormatDate = (value: any, index: number): string => {
    const date = new Date(value);
    
    switch (timeRange) {
      case '24H': {
        const hours = date.getHours();
        return `${hours.toString().padStart(2, '0')}:00`;
      }
      case '1W': {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${month} ${day}`;
      }
      case '1M': {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      }
      case '3M':
      case '6M': {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      }
      case '1Y': {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
      case 'ALL': {
        if (!chartData.length) return '';
        const timeDiff = (new Date().getTime() - new Date(chartData[0].timestamp).getTime());
        const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
        
        return daysDiff > 365 
          ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short' });
      }
      default:
        return formatDate(value);
    }
  };

  const tooltipLabelFormatter = (label: any, payload: any[]): React.ReactNode => {
    const date = new Date(label);
    
    if (timeRange === '24H') {
      return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getAxisInterval = () => {
    const totalPoints = chartData.length;
    
    switch (timeRange) {
      case '24H':
        return Math.floor(totalPoints / 12);
      case '1W':
        return Math.floor(totalPoints / 7);
      case '1M':
        return Math.ceil(totalPoints / 10) - 1;
      case '3M':
        return Math.ceil(totalPoints / 12) - 1;
      case '6M':
        return Math.ceil(totalPoints / 12) - 1;
      case '1Y':
        return Math.ceil(totalPoints / 12) - 1;
      case 'ALL':
        if (!chartData.length) return 'preserveStartEnd';
        const timeDiff = (new Date().getTime() - new Date(chartData[0].timestamp).getTime());
        const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
        return daysDiff > 365 
          ? Math.ceil(totalPoints / 12) - 1
          : Math.ceil(totalPoints / 6) - 1;
      default:
        return 'preserveStartEnd';
    }
  };

  const getWeeklyTicks = () => {
    if (!chartData.length) return [];
    
    const startTime = new Date(chartData[0].timestamp).getTime();
    const endTime = new Date(chartData[chartData.length - 1].timestamp).getTime();
    const dayInterval = (endTime - startTime) / 6;
    
    return Array.from({ length: 7 }, (_, i) => 
      new Date(startTime + dayInterval * i).toISOString()
    );
  };

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
          ticks={timeRange === '1W' ? getWeeklyTicks() : undefined}
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
          content={<ChartTooltip timeRange={timeRange} />}
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
        {highestValueDate && (
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
  );
} 