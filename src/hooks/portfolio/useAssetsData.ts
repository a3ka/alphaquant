import { useState, useEffect, useCallback } from 'react'
import { 
  Portfolio, 
  Asset, 
  isDemoPortfolio, 
  AssetsDataReturn
} from '@/src/types/portfolio.types'
import { marketService } from '@/src/services/market'

export const useAssetsData = (selectedPortfolio: Portfolio | undefined): AssetsDataReturn => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAssets = async () => {
    if (!selectedPortfolio) return

    try {
      if (isDemoPortfolio(selectedPortfolio)) {
        setAssets(selectedPortfolio.data.assets)
        return
      }

      const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/balance`)
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio balances')
      }
      const { balances, isEmpty } = await response.json()
      
      if (isEmpty) {
        setAssets([])
        return
      }

      const assetsData = await Promise.all(
        balances.map(async (balance: any) => {
          const metadata = balance.metadata
          return {
            name: metadata.name,
            symbol: balance.coin_ticker,
            logo: metadata.logo,
            amount: balance.amount,
            price: metadata.current_price,
            change24h: metadata.price_change_24h,
            change7d: 0,
            value: balance.amount * metadata.current_price,
            profit: 0,
            percentage: 0,
            color: generateRandomColor()
          }
        })
      )

      const totalValue = assetsData.reduce((sum, asset) => sum + asset.value, 0)
      const assetsWithPercentage = assetsData.map(asset => ({
        ...asset,
        percentage: (asset.value / totalValue) * 100
      }))

      setAssets(assetsWithPercentage)
    } catch (error) {
      console.error('Failed to load assets:', error)
      setError(error instanceof Error ? error.message : 'Failed to load assets')
    }
  }

  useEffect(() => {
    loadAssets()
  }, [selectedPortfolio])

  const mutate = useCallback(async () => {
    await loadAssets()
  }, [selectedPortfolio])

  const pieChartData = assets.map(({ name, symbol, value, percentage, color, amount, change24h, change7d, logo }) => ({
    name,
    symbol,
    value,
    percentage,
    color,
    amount,
    change24h,
    change7d,
    logo
  }))

  return {
    assets,
    pieChartData,
    selectedAsset,
    setSelectedAsset,
    isEmpty: assets.length === 0,
    error,
    mutate
  }
}

function generateRandomColor(): string {
  const colors = [
    '#FF69B4', '#8A2BE2', '#4169E1', '#20B2AA', 
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#9B59B6', '#3498DB', '#2ECC71', '#F1C40F'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}