'use client'

import { Portfolio } from "@/src/types/portfolio.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTransactionDialog } from "./Add-Transaction"
import { useState } from "react"
import { FakePortfolio } from "@/app/data/fakePortfolio"
import { PortfolioSelector } from "./PortfolioSelector"
import { Plus } from "lucide-react"

interface EmptyPortfolioStateProps {
  onAddTransaction: () => void
  onPortfolioChange: (portfolio: Portfolio) => void
  selectedPortfolio: Portfolio | undefined
}

export function EmptyPortfolioState({ 
  onAddTransaction, 
  onPortfolioChange, 
  selectedPortfolio 
}: EmptyPortfolioStateProps) {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
    return (
      <main className="w-full bg-[#010714] rounded-lg border border-gray-400">
          <Card className="bg-transparent border-0">
            <CardHeader>      
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-white text-xl font-semibold">Portfolio Overview</CardTitle> 
              </div>
              <PortfolioSelector 
                onPortfolioChange={onPortfolioChange}
                externalSelectedPortfolio={selectedPortfolio || FakePortfolio}
              />
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="text-lg mb-2">No data available</div>
          <div className="text-sm mb-4">Add transactions to see portfolio analytics</div>
          <Button 
            onClick={() => setIsAddTransactionOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Transaction
          </Button>
        </div> 
      </CardHeader>
    </Card>
    <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        selectedPortfolioId={selectedPortfolio?.id.toString() || ''}
      />
    </main>
  )
}