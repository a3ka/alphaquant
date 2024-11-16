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
  
  export interface DemoPortfolio extends BasePortfolio {
    id: string
    type: 'SPOT' | 'MARGIN'
    created_at: string
    updated_at: string
    data: {
      assets: Asset[]
      pieChartData: Asset[]
      chartData: { date: string; value: number }[]
      totalValue: number
      totalProfit: number
      profitPercentage: number
    }
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
  
  export interface PortfolioBalance {
    id: string
    coin_ticker: string
    amount: number
    borrowed: number
    in_collateral: number
    last_updated: string
  }
  
  export interface PortfolioBalancesResponse {
    balances: PortfolioBalance[]
    isEmpty: boolean
  }