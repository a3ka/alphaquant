import useSWR from 'swr'
import { Portfolio, PortfolioHistoryReturn, TimeRangeType, isDemoPortfolio, Period } from '@/src/types/portfolio.types'
import { getPeriodByRange } from '@/src/utils/date'
import { generateDataForTimeRange } from '@/app/data/fakePortfolio'
import { useEffect, useRef } from 'react'

type FetcherArgs = [string, number | string, Period, TimeRangeType]

const fetcher = async ([url, portfolioId, period, timeRange]: FetcherArgs) => {
  console.log('Fetching portfolio history:', { portfolioId, period, timeRange })
  
  const response = await fetch(`${url}?period=${period}&days=${timeRange}&includeCurrent=true`)
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error('Portfolio history fetch failed:', errorData)
    throw new Error(errorData.error || 'Failed to fetch chart data')
  }
  
  const data = await response.json()
  console.log('Portfolio history received:', { 
    portfolioId, 
    recordsCount: data.length,
    firstRecord: data[0],
    lastRecord: data[data.length - 1] 
  })
  return data
}

export const usePortfolioHistory = (
  selectedPortfolio: Portfolio | undefined, 
  timeRange: TimeRangeType
): PortfolioHistoryReturn => {
  const period = getPeriodByRange(timeRange)
  const shouldFetch = selectedPortfolio && !isDemoPortfolio(selectedPortfolio)
  const currentRequestRef = useRef<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR<any, Error, FetcherArgs | null>(
    shouldFetch 
      ? [`/api/portfolio/${selectedPortfolio.id}/history`, selectedPortfolio.id, period, timeRange] 
      : null,
    async (args) => {
      const [url, portfolioId] = args
      const requestId = `${portfolioId}-${Date.now()}`
      
      if (currentRequestRef.current?.startsWith(String(portfolioId))) {
        console.log('Cancelling previous request for portfolio:', portfolioId)
        return
      }
      
      currentRequestRef.current = requestId
      const result = await fetcher(args)
      
      if (currentRequestRef.current === requestId) {
        currentRequestRef.current = null
        return result
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
      keepPreviousData: false,
      onError: (err) => {
        console.error('SWR Error:', err)
        currentRequestRef.current = null
      }
    }
  )

  // Принудительное обновление при смене портфеля
  useEffect(() => {
    if (shouldFetch && !currentRequestRef.current) {
      mutate()
    }
  }, [selectedPortfolio?.id, mutate, shouldFetch])

  // Добавляем дополнительное логирование
  useEffect(() => {
    if (selectedPortfolio) {
      console.log('Portfolio changed:', {
        id: selectedPortfolio.id,
        timeRange,
        period,
        hasData: !!data,
        dataLength: data?.length
      })
    }
  }, [selectedPortfolio, timeRange, data])

  // Для демо-портфеля возвращаем фейковые данные
  if (selectedPortfolio && isDemoPortfolio(selectedPortfolio)) {
    return {
      data: generateDataForTimeRange(timeRange),
      error: null,
      isLoading: false,
      mutate: async () => {}
    }
  }

  return {
    data: data || [],
    error: error?.message || null,
    isLoading,
    mutate
  }
}