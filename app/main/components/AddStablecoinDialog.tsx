'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import { useState } from "react"
import { createTransaction } from "@/utils/actions/transaction-actions"
import { toast } from "sonner"
import { useUser } from '@clerk/nextjs'

const stablecoins = [
  { label: "USDT", value: "USDT", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { label: "USDC", value: "USDC", icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" },
]

interface AddStablecoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioId: number | undefined
  onSuccess?: () => void
}

export function AddStablecoinDialog({ open, onOpenChange, portfolioId, onSuccess }: AddStablecoinDialogProps) {
  console.log('AddStablecoinDialog mounted with portfolioId:', portfolioId)
  
  const { user } = useUser()
  const [selectedCoin, setSelectedCoin] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    console.log('HandleSubmit called with portfolioId:', portfolioId)
    console.log('User:', user?.id)
    
    if (!user?.id) {
      console.log('No user ID found')
      return
    }
    
    if (!portfolioId) {
      console.log('No portfolio ID found')
      toast.error("Please select a portfolio first")
      return
    }
    
    if (!selectedCoin) {
      toast.error("Please select a stablecoin")
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      setIsLoading(true)
      await createTransaction({
        portfolioId,
        userId: user.id,
        type: "BUY",
        coinName: selectedCoin,
        coinTicker: selectedCoin,
        amount: parseFloat(amount),
        priceUsd: 1,
        totalUsd: parseFloat(amount),
        notes: "Added manually as payment method"
      })

      toast.success("Stablecoin added successfully")
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedCoin("")
    setAmount("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A1929] text-white">
        <DialogHeader>
          <DialogTitle>Add Stablecoin to Portfolio</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add stablecoins to use as payment method
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Select value={selectedCoin} onValueChange={setSelectedCoin}>
              <SelectTrigger className="w-full bg-[#1F2937] border-gray-600">
                <SelectValue placeholder="Select stablecoin" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border-gray-600">
                {stablecoins.map((coin) => (
                  <SelectItem 
                    key={coin.value} 
                    value={coin.value}
                    className="text-gray-200 hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <img src={coin.icon} alt={coin.label} className="w-4 h-4 mr-2" />
                      <span>{coin.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-[#1F2937] border-gray-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCoin || !amount || isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? "Adding..." : "Add Stablecoin"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
