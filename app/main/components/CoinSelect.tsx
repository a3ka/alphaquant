'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Coin {
  logo: string
  name: string
  symbol: string
  market_cap_rank: number
}

interface CoinSelectProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function CoinSelect({ value, onValueChange, className }: CoinSelectProps) {
  const [open, setOpen] = useState(false)
  const [coins, setCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('/api/crypto-metadata')
        if (!response.ok) throw new Error('Failed to fetch coins')
        const data = await response.json()
        const sortedCoins = data.sort((a: Coin, b: Coin) => 
          (a.market_cap_rank || Infinity) - (b.market_cap_rank || Infinity)
        )
        setCoins(sortedCoins)
      } catch (error) {
        console.error('Failed to fetch coins:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoins()
  }, [])

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCoin = coins.find(coin => coin.symbol === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between bg-[#1F2937] border-gray-600 ${className}`}
        >
          {selectedCoin ? (
            <div className="flex items-center gap-2">
              <img src={selectedCoin.logo} alt={selectedCoin.name} className="w-5 h-5 rounded-full" />
              <span>{selectedCoin.name}</span>
              <span className="text-xs text-gray-400">({selectedCoin.symbol})</span>
            </div>
          ) : (
            "Select coin"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-[#1F2937] border-gray-600">
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coins..."
              className="pl-8 bg-[#151F2E] border-gray-700 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : (
            filteredCoins.map((coin) => (
              <div
                key={`${coin.symbol}-${coin.market_cap_rank}`}
                className={cn(
                  "relative flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700",
                  value === coin.symbol && "bg-gray-700"
                )}
                onClick={() => {
                  onValueChange(coin.symbol)
                  setOpen(false)
                }}
              >
                <img src={coin.logo} alt={coin.name} className="w-5 h-5 rounded-full" />
                <span className="text-sm font-medium text-white">{coin.name}</span>
                <span className="text-xs text-gray-400">({coin.symbol})</span>
                {value === coin.symbol && (
                  <Check className="h-4 w-4 absolute right-2 text-green-500" />
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}