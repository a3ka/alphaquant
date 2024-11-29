import { Period } from "@/src/types/portfolio.types";

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
  },
  timeRanges: {
    '24H': {
      axisInterval: 'hour',
      axisPoints: 24,
      dataInterval: Period.MINUTE_15,
      dateFormat: 'HH:mm'
    },
    '1W': {
      axisInterval: 'day',
      axisPoints: 7,
      dataInterval: Period.MINUTE_15,
      dateFormat: 'MMM d'
    },
    '1M': {
      axisInterval: 'day',
      axisPoints: 10,
      dataInterval: Period.HOUR_1,
      dateFormat: 'MMM d'
    },
    '3M': {
      axisInterval: 'day',
      axisPoints: 12,
      dataInterval: Period.HOUR_4,
      dateFormat: 'MMM d, yyyy'
    },
    '6M': {
      axisInterval: 'day',
      axisPoints: 12,
      dataInterval: Period.HOUR_4,
      dateFormat: 'MMM d, yyyy'
    },
    '1Y': {
      axisInterval: 'week',
      axisPoints: 26,
      dataInterval: Period.HOUR_24,
      dateFormat: 'MMM d, yyyy'
    },
    'ALL': {
      axisInterval: 'auto',
      axisPoints: 12,
      dataInterval: Period.HOUR_24,
      dateFormat: 'auto'
    }
  }
} 