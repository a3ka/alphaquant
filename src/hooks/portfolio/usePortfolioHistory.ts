import useSWR from 'swr'
import { Portfolio, PortfolioHistoryReturn, TimeRangeType, isDemoPortfolio, Period, PortfolioHistory } from '@/src/types/portfolio.types'
import { getPeriodByRange, getDaysFromTimeRange } from '@/src/utils/date'
import { generateDataForTimeRange } from '@/app/data/fakePortfolio'
import { useEffect, useRef, useState } from 'react'

type FetcherArgs = [string, number | string, Period, TimeRangeType]
type CachedData = { [key: string]: any }

const fetcher = async ([url, portfolioId, period, timeRange]: FetcherArgs) => {
  console.log('Fetching portfolio history:', { portfolioId, period, timeRange })
  const days = getDaysFromTimeRange(timeRange)
  const response = await fetch(`${url}?period=${period}&days=${days}&includeCurrent=true`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch chart data')
  }
  
  return await response.json()
}

const getTimeRangeConstraints = (range: TimeRangeType) => {
  const now = new Date()
  
  switch (range) {
    case '24H':
      return {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end: now,
        expectedPoints: 96 // каждые 15 минут
      }
    case '1W':
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        expectedPoints: 168 // каждый час
      }
    case '1M':
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
        expectedPoints: 180 // каждые 4 часа
      }
    case '3M':
      return {
        start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now,
        expectedPoints: 540 // каждые 4 часа
      }
    // ... остальные кейсы
  }
}

export const usePortfolioHistory = (
  selectedPortfolio: Portfolio | undefined, 
  timeRange: TimeRangeType
): PortfolioHistoryReturn => {
  const period = getPeriodByRange(timeRange)
  const shouldFetch = selectedPortfolio && !isDemoPortfolio(selectedPortfolio)
  const cachedDataRef = useRef<CachedData>({})
  const portfolioIdRef = useRef<string | number | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { data, error, isLoading, mutate } = useSWR<any, Error, FetcherArgs | null>(
    shouldFetch
      ? [`/api/portfolio/${selectedPortfolio.id}/history`, selectedPortfolio.id, period, timeRange] 
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300,
      keepPreviousData: true,
      revalidateOnMount: true,
      shouldRetryOnError: false,
      onSuccess: (newData) => {
        if (selectedPortfolio?.id) {
          cachedDataRef.current[selectedPortfolio.id] = newData
          setIsInitialLoad(false)
        }
      }
    }
  )

  useEffect(() => {
    if (selectedPortfolio?.id !== portfolioIdRef.current) {
      portfolioIdRef.current = selectedPortfolio?.id || null
      
      // Предварительно загружаем данные для нового портфеля
      if (selectedPortfolio?.id && !isDemoPortfolio(selectedPortfolio)) {
        const days = getDaysFromTimeRange(timeRange)
        const prefetchUrl = `/api/portfolio/${selectedPortfolio.id}/history?period=${period}&days=${days}&includeCurrent=true`
        fetch(prefetchUrl).then(async (res) => {
          if (res.ok) {
            const newData = await res.json()
            cachedDataRef.current[selectedPortfolio.id] = newData
          }
        })
      }
    }
  }, [selectedPortfolio?.id, period, timeRange])

  if (selectedPortfolio && isDemoPortfolio(selectedPortfolio)) {
    return {
      data: generateDataForTimeRange(timeRange),
      error: null,
      isLoading: false,
      mutate: async () => {}
    }
  }

  const currentData = isInitialLoad && cachedDataRef.current[selectedPortfolio?.id || ''] 
    ? cachedDataRef.current[selectedPortfolio?.id || '']
    : data

  const getAvailableRange = (data: PortfolioHistory[]) => {
    if (!data?.length) return null;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      start: new Date(sortedData[0].timestamp),
      end: new Date(sortedData[sortedData.length - 1].timestamp),
      totalDays: Math.ceil(
        (new Date(sortedData[sortedData.length - 1].timestamp).getTime() - 
         new Date(sortedData[0].timestamp).getTime()) / (24 * 60 * 60 * 1000)
      )
    };
  };

  return {
    data: currentData || [],
    error: error?.message || null,
    isLoading: isLoading && !currentData,
    mutate
  }
}