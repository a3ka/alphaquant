export interface Asset {
    name: string
    symbol: string
    logo: string
    amount: number
    price: number
    change24h: number
    change7d: number
    value: number
    profit: number
    percentage: number
    color: string
  }
  
  export interface BasePortfolio {
    id: string | number
    name: string
    user_id: string
    type: 'SPOT' | 'MARGIN'
    description: string | null
    is_active: boolean
    margin_data?: {
      debt: number
      collateral: number
    }
  }
  
  export interface DemoPortfolioData {
    assets: Asset[]
    pieChartData: Asset[]
    chartData: ChartDataPoint[]
    totalValue: number
    totalProfit: number
    profitPercentage: number
  }
  
  export interface DemoPortfolio extends BasePortfolio {
    id: string
    name: string
    user_id: string
    type: 'SPOT' | 'MARGIN'
    description: string
    is_active: boolean
    created_at: string
    updated_at: string
    data: DemoPortfolioData
  }
  
  export interface UserPortfolio extends BasePortfolio {
    id: number
    type: 'SPOT' | 'MARGIN'
    created_time: string
    balances?: {
      coin_ticker: string
      amount: number
      borrowed: number
      in_collateral: number
      last_updated: string
    }[]
  }
  
  export type Portfolio = UserPortfolio | DemoPortfolio
  export type PortfolioType = 'SPOT' | 'MARGIN'
  
  export const isDemoPortfolio = (portfolio: Portfolio): portfolio is DemoPortfolio => {
    return typeof portfolio?.id === 'string'
  }
  
  export interface AssetMetadata {
    name: string
    logo: string
    current_price: number
    price_change_24h: number
  }
  
  export interface PortfolioBalance {
    id: number
    portfolio_id: number
    coin_ticker: string
    amount: number
    borrowed: number
    in_collateral: number
    last_updated: string
    metadata: AssetMetadata
  }
  
  export interface PortfolioBalancesResponse {
    balances: PortfolioBalance[]
    isEmpty: boolean
  }
  
  export interface UsePortfolioBalanceReturn {
    assets: Asset[]
    totalValue: number
    isLoading: boolean
    isEmpty: boolean
    error: Error | null
    selectedAsset: Asset | null
    pieChartData: any[]
    updateBalance: (coinTicker: string, amount: number, isMargin?: boolean) => Promise<void>
  }
  
  export enum Period {
    CURRENT = 'CURRENT',
    MINUTE_15 = 'MINUTE_15',
    HOUR_1 = 'HOUR_1',
    HOUR_4 = 'HOUR_4',
    HOUR_24 = 'HOUR_24'
  }
  
  export type ChartDataPoint = {
    timestamp: string
    total_value: number
    period: Period
  }
  
  export type TimeRangeType = '24H' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  
  export interface PieChartDataItem {
    name: string
    symbol: string
    value: number
    percentage: number
    color: string
    logo?: string
  }
  
  export interface AssetsDataReturn {
    assets: Asset[]
    pieChartData: PieChartDataItem[]
    selectedAsset: Asset | undefined
    setSelectedAsset: (asset: Asset | undefined) => void
    isEmpty: boolean
    error: string | null
    mutate: () => Promise<void>
  }
  
  export interface Balance {
    coin_ticker: string
    amount: number
  }
  
  export interface PortfolioChartsProps {
    timeRange: TimeRangeType
    setTimeRange: (range: TimeRangeType) => void
    portfolioData: ChartDataPoint[]
    pieChartData: PieChartDataItem[]
    assets: Asset[]
    currentSelectedAsset: Asset | undefined
    setSelectedAsset: (asset: Asset) => void
    portfolioRisk: number
    getRiskColor: (risk: number) => string
    formatYAxis: (value: number) => string
    formatDate: (date: string) => string
    onPortfolioChange: (portfolio: Portfolio) => void
    setIsAddTransactionOpen: (isOpen: boolean) => void
    selectedPortfolio: Portfolio | undefined
    totalValue: number
    totalProfit: number
    profitPercentage: number
  }
  
  export interface CoinMetadata {
    name: string
    symbol: string
    logo: string
    current_price: number
    price_change_24h: number
    market_cap_rank: number
  }
  
  export interface EnrichedPortfolioBalance extends PortfolioBalance {
    metadata: {
      name: string
      logo: string
      current_price: number
      price_change_24h: number
    }
  }
  
  export type PortfolioId = number
  
  export interface PortfolioHistoryReturn {
    data: ChartDataPoint[]
    error: string | null
    isLoading: boolean
    mutate: () => Promise<void>
  }
  
  export interface BatchResult {
    success: boolean
    updatedPortfolios: number
    savedHistoryRecords: number
    errors?: string[]
    executionTime?: number
  }
  
  export interface PortfolioUpdateResult {
    success: boolean
    historyCount: number
    error?: string
  }
  
  export interface PortfolioProcessResult {
    portfolioId: number
    success: boolean
    error?: string
  }
  
  export interface PortfolioProcessResponse {
    success: boolean
    results: PortfolioProcessResult[]
    executionTime: number
  }
  
  export interface PortfolioUpdateStats {
    totalPortfolios: number
    successfulUpdates: number
    failedUpdates: number
    executionTime: number
    periodsUpdated: Period[]
  }
  
  export interface PortfolioHistory {
    id: number
    portfolio_id: number
    total_value: number
    period: Period
    timestamp: string
  }
  
  