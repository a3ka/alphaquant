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
    
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Для недельного графика используем все 15-минутные точки для построения линии
    if (timeRange === '1W') {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Фильтруем только данные за последние 7 дней
      return sortedData.filter(point => {
        const pointDate = new Date(point.timestamp);
        return pointDate >= sevenDaysAgo && pointDate <= now;
      });
    }

    return sortedData;
  }, [data, timeRange]);

  const customFormatDate = (value: string): string => {
    const date = new Date(value);
    
    switch (timeRange) {
      case '24H': {
        const hours = date.getHours();
        return `${hours.toString().padStart(2, '0')}:00`;
      }
      case '1W': {
        // Для оси X показываем только дни
        return date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
      }
      case '1M': {
        return date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
      }
      case '3M':
      case '6M': {
        return date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
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

  const tooltipLabelFormatter = (label: string): React.ReactNode => {
    const date = new Date(label);
    
    switch (timeRange) {
      case '24H': {
        return date.toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      case '1W': {
        // Для недельного графика показываем точное время с 15-минутным интервалом
        return date.toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      case '1M':
      case '3M':
      case '6M': {
        return date.toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      case '1Y':
      case 'ALL': {
        return date.toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      default:
        return date.toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
    }
  };

  const getAxisInterval = () => {
    const totalPoints = chartData.length;
    
    // Фиксированное количество точек для каждого диапазона
    const pointsMap = {
      '24H': 12,  // каждые 2 часа
      '1W': 7,    // каждый день
      '1M': 10,   // каждые 3 дня
      '3M': 12,   // каждую неделю
      '6M': 12,   // каждые 2 недели
      '1Y': 12,   // каждый месяц
      'ALL': 12   // зависит от общего периода
    };

    return Math.max(1, Math.floor(totalPoints / pointsMap[timeRange]));
  };

  const getAdaptedTimeRange = (
    requestedRange: TimeRangeType,
    availableDays: number
  ): TimeRangeType => {
    const rangeMap: Record<TimeRangeType, number> = {
      '24H': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': 365
    };

    // Находим ближайший подходящий диапазон
    const ranges: TimeRangeType[] = ['24H', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
    for (const range of ranges) {
      if (rangeMap[range] >= availableDays) {
        return range;
      }
    }
    
    return '24H'; // Минимальный диапазон по умолчанию
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