'use client'

import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Asset } from '@/src/types/portfolio.types'

interface PortfolioTableProps {
  assets: Asset[]
  isAddTransactionOpen: boolean
  setIsAddTransactionOpen: (value: boolean) => void
  currentSelectedAsset?: Asset | undefined
  setSelectedAsset?: (asset: Asset | undefined) => void
}

export function PortfolioTable({
  assets,
  isAddTransactionOpen,
  setIsAddTransactionOpen,
  currentSelectedAsset,
  setSelectedAsset
}: PortfolioTableProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:text-white hover:bg-[#1F2937]">
            Portfolio
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1F2937]">
            Transactions
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1F2937]">
            Portfolio Analytics
          </Button>
        </div>
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          className="h-8 bg-blue-600 hover:bg-blue-700"
          >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
              <th className="pb-4 font-medium">Asset</th>
              <th className="pb-4 font-medium">Price</th>
              <th className="pb-4 font-medium">24h Change</th>
              <th className="pb-4 font-medium">7d Change</th>
              <th className="pb-4 font-medium">Holdings</th>
              <th className="pb-4 font-medium">Profit/Loss</th>
              <th className="pb-4 font-medium">Portfolio %</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.symbol} className="border-t border-gray-800">
                <td className="py-4">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <img src={asset.logo} alt={asset.name} />
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{asset.name}</div>
                      <div className="text-sm text-gray-400">{asset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="text-white">${asset.price.toLocaleString()}</div>
                </td>
                <td className="py-4">
                  <span className={`${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                </td>
                <td className="py-4">
                  <span className={`${asset.change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.change7d >= 0 ? '+' : ''}{asset.change7d}%
                  </span>
                </td>
                <td className="py-4">
                  <div className="text-white">${asset.value.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">{asset.amount} {asset.symbol}</div>
                </td>
                <td className="py-4">
                  <span className={`${asset.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.profit >= 0 ? '+' : ''}${Math.abs(asset.profit).toLocaleString()}
                  </span>
                </td>
                <td className="py-4">
                  <div className="text-white">{asset.percentage.toFixed(2)}%</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 