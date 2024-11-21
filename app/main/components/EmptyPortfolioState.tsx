'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Portfolio } from '@/src/types/portfolio.types'
import { PortfolioSelector } from './PortfolioSelector'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface EmptyPortfolioStateProps {
  onAddTransaction: () => void
  onPortfolioChange: (portfolio: Portfolio) => void
}


export function EmptyPortfolioState({ onAddTransaction, onPortfolioChange }: EmptyPortfolioStateProps) {
    return (
    <Card className="bg-transparent border-0">
      <CardHeader>      
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-white text-xl font-semibold">Portfolio Overview</CardTitle> 
        </div>
        <PortfolioSelector onPortfolioChange={onPortfolioChange} />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="text-lg mb-2">No data available</div>
          <div className="text-sm mb-4">Add transactions to see portfolio analytics</div>
          <Button 
            onClick={onAddTransaction}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Transaction
          </Button>
        </div> 
      </CardHeader>
    </Card>
  )
}