'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import { Check, ChevronsUpDown, Calendar as CalendarIcon, TrendingUp, TrendingDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

const portfolios = [
  { id: 'portfolio1', name: 'Portfolio 1', type: 'Spot', balance: 10000, assets: 10000, debt: 0 },
  { id: 'portfolio2', name: 'Portfolio 2', type: 'Margin', balance: 5000, assets: 15000, debt: 10000 },
  { id: 'portfolio3', name: 'Portfolio 3', type: 'Spot', balance: 15000, assets: 15000, debt: 0 },
]

const coins = [
  { label: "Bitcoin", value: "BTC", icon: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400", amount: 1.5 },
  { label: "Ethereum", value: "ETH", icon: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628", amount: 10 },
  { label: "Stark Network", value: "STRK", icon: "https://assets.coingecko.com/coins/images/26433/standard/starknet.png?1696525507", amount: 100 },
  { label: "MAGIC", value: "MAGIC", icon: "https://assets.coingecko.com/coins/images/18623/standard/magic.png?1696518095", amount: 50 },
  { label: "Casper Network", value: "CSPR", icon: "https://assets.coingecko.com/coins/images/15279/standard/CSPR_Token_Logo_CoinGecko.png?1709518377", amount: 1000 },
  { label: "Hedera", value: "HBAR", icon: "https://assets.coingecko.com/coins/images/3688/standard/hbar.png?1696504364", amount: 5000 },
  { label: "Wormhole", value: "W", icon: "https://assets.coingecko.com/coins/images/35087/standard/womrhole_logo_full_color_rgb_2000px_72ppi_fb766ac85a.png?1708688954", amount: 20 },
]

const paymentMethods = [
  { label: "USDT", value: "USDT", balance: 95000 },
  { label: "USDC", value: "USDC", balance: 80000 },
  { label: "BTC", value: "BTC", balance: 2 },
]

const getRatioColor = (ratio: number) => {
  if (ratio < 1.5) return 'text-red-500'
  if (ratio < 2) return 'text-red-300'
  if (ratio < 2.5) return 'text-blue-300'
  return 'text-green-400'
}


interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [transactionType, setTransactionType] = useState('buy')
  const [portfolio, setPortfolio] = useState(portfolios[0].id)
  const [sourcePortfolio, setSourcePortfolio] = useState(portfolios[0].id)
  const [targetPortfolio, setTargetPortfolio] = useState(portfolios[1].id)
  const [selectedCoin, setSelectedCoin] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('12:00')
  const [assetToDebtRatio, setAssetToDebtRatio] = useState({ current: 2.5, after: 2.5 })
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [additionalFunds, setAdditionalFunds] = useState('')
  const [insufficientFunds, setInsufficientFunds] = useState(false)

  const handleTransactionTypeChange = (type: string) => {
    setTransactionType(type)
    setSelectedAssets([])
  }

  const handleAssetToggle = (value: string) => {
    setSelectedAssets(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const handleAddFunds = () => {
    const selectedMethod = paymentMethods.find(m => m.value === paymentMethod)
    if (selectedMethod) {
      selectedMethod.balance += Number(additionalFunds)
      setAdditionalFunds('')
      setShowAddFunds(false)
      checkFunds()
    }
  }

  const checkFunds = () => {
    if (isMarginPortfolio) {
      setInsufficientFunds(false)
      return
    }
    const totalAmount = Number(amount)
    const selectedCoinData = coins.find(c => c.value === selectedCoin)
    if (transactionType === 'sell' && selectedCoinData && totalAmount > selectedCoinData.amount) {
      setInsufficientFunds(true)
    } else if (transactionType === 'buy') {
      const totalCost = totalAmount * Number(price)
      const selectedMethod = paymentMethods.find(m => m.value === paymentMethod)
      if (selectedMethod && totalCost > selectedMethod.balance) {
        setInsufficientFunds(true)
      } else {
        setInsufficientFunds(false)
      }
    } else {
      setInsufficientFunds(false)
    }
  }

  useEffect(() => {
    checkFunds()
  }, [amount, price, paymentMethod, portfolio, selectedCoin, transactionType])

  const transactionTypes = [
    { type: 'buy', label: 'Buy', color: 'green' },
    { type: 'sell', label: 'Sell', color: 'red' },
    { type: 'transfer', label: 'Transfer', color: 'blue' }
  ]

  const selectedPortfolio = portfolios.find(p => p.id === portfolio) ?? portfolios[0]
  const totalAmount = Number(amount)
  const totalValue = totalAmount * Number(price)
  const isMarginPortfolio = selectedPortfolio?.type === 'Margin'
  let newAssets, newDebt, currentRatio, newRatio

  if (isMarginPortfolio) {
    if (transactionType === 'buy') {
      newAssets = selectedPortfolio.assets + totalValue
      newDebt = selectedPortfolio.debt + totalValue
    } else if (transactionType === 'sell') {
      newAssets = selectedPortfolio.assets + totalValue
      newDebt = selectedPortfolio.debt + totalValue
    } else {
      newAssets = selectedPortfolio.assets
      newDebt = selectedPortfolio.debt
    }
    currentRatio = selectedPortfolio.assets / selectedPortfolio.debt
    newRatio = newAssets / newDebt
  } else {
    newAssets = transactionType === 'buy' ? selectedPortfolio.assets + totalValue : selectedPortfolio.assets - totalValue
    newDebt = selectedPortfolio.debt
    currentRatio = 0
    newRatio = 0
  }

  useEffect(() => {
    if (sourcePortfolio === 'portfolio2' && transactionType === 'transfer') {
      const newRatio = 2.5 - (selectedAssets.length * 0.1)
      setAssetToDebtRatio({ current: 2.5, after: newRatio })
    }
  }, [sourcePortfolio, transactionType, selectedAssets])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[450px] lg:max-w-[500px] bg-[#0A1929] text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-white">Add Transaction</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">Enter the details of your transaction here.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-wrap gap-2">
            {transactionTypes.map(({ type, label, color }) => (
              <Button
                key={type}
                onClick={() => handleTransactionTypeChange(type)}
                className={cn(
                  "flex-1 text-white border-2 text-xs sm:text-sm py-1 px-2",
                  transactionType === type
                    ? `bg-${color}-600 border-${color}-400 hover:bg-${color}-700`
                    : `bg-transparent border-gray-600 hover:bg-${color}-900 hover:border-${color}-400`
                )}
              >
                {label}
              </Button>
            ))}
          </div>

          {transactionType === 'transfer' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="sourcePortfolio" className="text-sm font-medium text-gray-300">From</Label>
                <Select value={sourcePortfolio} onValueChange={setSourcePortfolio}>
                  <SelectTrigger id="sourcePortfolio" className="w-full bg-[#1F2937] border-gray-600">
                    <SelectValue placeholder="Select portfolio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border-gray-600">
                    {portfolios.map((p) => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id}
                        className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="ml-2 text-xs text-gray-400">({p.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 bg-[#1A2332] p-3 rounded-md border border-[#2A3A50]">
                <Label className="text-sm font-medium text-gray-300 mb-2 block">Select assets to transfer:</Label>
                <div 
                  className="space-y-2 overflow-y-auto pr-2" 
                  style={{
                    height: '180px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#888 #f1f1f1'
                  }}
                >
                  {coins.slice(0, 5).map((coin) => (
                    <div key={coin.value} className="flex items-center justify-between bg-[#0F1723] p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`asset-${coin.value}`}
                          checked={selectedAssets.includes(coin.value)}
                          onCheckedChange={() => handleAssetToggle(coin.value)}
                          className="border-[#2A3A50] data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <Label
                          htmlFor={`asset-${coin.value}`}
                          className="flex items-center space-x-2 text-xs font-medium leading-none cursor-pointer select-none"
                        >
                          <img src={coin.icon} alt={coin.label} className="w-4 h-4" />
                          <span>{coin.label}</span>
                          <span className="text-gray-400">({coin.amount})</span>
                        </Label>
                      </div>
                      {selectedAssets.includes(coin.value) && (
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-20 h-6 text-xs bg-[#1A2332] border-[#2A3A50] text-white placeholder-gray-500 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {sourcePortfolio === 'portfolio2' && (
                <div className="bg-[#1A2332] p-3 rounded-md border border-[#2A3A50]">
                  <h3 className="text-sm font-semibold text-white mb-2">Asset to Debt Ratio</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-gray-300">Current:</p>
                      <p className={`text-sm font-bold ${getRatioColor(assetToDebtRatio.current)}`}>
                        {assetToDebtRatio.current.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="text-gray-400 mx-2 w-4 h-4" />
                    <div>
                      <p className="text-xs font-medium text-gray-300">After transfer:</p>
                      <p className={`text-sm font-bold ${getRatioColor(assetToDebtRatio.after)}`}>
                        {assetToDebtRatio.after.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {assetToDebtRatio.after < assetToDebtRatio.current && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                      <TrendingDown className="inline w-3 h-3" />
                      Warning: This transfer will decrease your asset to debt ratio.
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="targetPortfolio" className="text-sm font-medium text-gray-300">To</Label>
                <Select value={targetPortfolio} onValueChange={setTargetPortfolio}>
                  <SelectTrigger id="targetPortfolio" className="w-full bg-[#1F2937] border-gray-600">
                    <SelectValue placeholder="Select portfolio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border-gray-600">
                    {portfolios.map((p) => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id}
                        className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="ml-2 text-xs text-gray-400">({p.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-sm font-medium text-gray-300">Portfolio</Label>
                <Select value={portfolio} onValueChange={setPortfolio}>
                  <SelectTrigger id="portfolio" className="w-full bg-[#1F2937] border-gray-600">
                    <SelectValue placeholder="Select portfolio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border-gray-600">
                    {portfolios.map((p) => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id}
                        className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="ml-2 text-xs text-gray-400">({p.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isMarginPortfolio && (
                <div className="bg-[#1A2332] p-3 rounded-md border border-[#2A3A50]">
                  <h3 className="text-sm font-semibold text-white mb-2">Portfolio Balance</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium text-gray-300">Assets:</p>
                      <p className="font-bold text-white">${selectedPortfolio.assets.toFixed(2)}</p>
                      <p className="font-medium text-gray-300 mt-1">After transaction:</p>
                      <p className="font-bold text-green-500">${newAssets.toFixed(2)}</p>
                      {transactionType === 'buy' && (
                        <p className="text-gray-400 mt-1">
                          +{totalAmount} {selectedCoin} (${totalValue.toFixed(2)})
                        </p>
                      )}
                      {transactionType === 'sell' && (
                        <p className="text-gray-400 mt-1">
                          +{totalValue.toFixed(2)} {paymentMethod}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-300">Debt:</p>
                      <p className="font-bold text-white">${selectedPortfolio.debt.toFixed(2)}</p>
                      <p className="font-medium text-gray-300 mt-1">After transaction:</p>
                      <p className="font-bold text-red-500">${newDebt.toFixed(2)}</p>
                      {transactionType === 'buy' && (
                        <p className="text-gray-400 mt-1">
                          +{totalValue.toFixed(2)} {paymentMethod}
                        </p>
                      )}
                      {transactionType === 'sell' && (
                        <p className="text-gray-400 mt-1">
                          +{totalAmount} {selectedCoin}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <p className="font-medium text-gray-300">Asset to Debt Ratio:</p>
                    <div className="flex justify-between items-center">
                      <p className={`font-bold ${getRatioColor(currentRatio)}`}>
                        {currentRatio.toFixed(2)}
                      </p>
                      <TrendingUp className="text-gray-400 mx-2 w-4 h-4" />
                      <p className={`font-bold ${getRatioColor(newRatio)}`}>
                        {newRatio.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="coin" className="text-sm font-medium text-gray-300">Coin</Label>
                  <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                    <SelectTrigger id="coin" className="w-full bg-[#1F2937] border-gray-600">
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-gray-600">
                      {coins.map((coin) => (
                        <SelectItem 
                          key={coin.value} 
                          value={coin.value}
                          className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                        >
                          <div className="flex items-center">
                            <img src={coin.icon} alt={coin.label} className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium text-white">{coin.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-300">
                    {transactionType === 'buy' ? 'Payment Method' : 'Receive Method'}
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod" className="w-full bg-[#1F2937] border-gray-600">
                      <SelectValue placeholder={`Select ${transactionType === 'buy' ? 'payment' : 'receive'} method`} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-gray-600">
                      {paymentMethods.map((method) => (
                        <SelectItem 
                          key={method.value} 
                          value={method.value}
                          className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                        >
                          <span className="text-sm font-medium text-white">{method.label}</span>
                          {!isMarginPortfolio && <span className="ml-2 text-xs text-gray-400">({method.balance})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {insufficientFunds && !isMarginPortfolio && transactionType === 'buy' && (
                <Button
                  onClick={() => setShowAddFunds(true)}
                  className="w-full bg-transparent hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500 hover:border-transparent rounded text-xs py-1"
                >
                  + Add More {paymentMethod}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-300">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#1F2937] border-gray-600 text-right text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-gray-300">Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-[#1F2937] border-gray-600 text-right text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-300">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal text-sm",
                      !date && "text-muted-foreground",
                      "bg-[#1F2937] border-gray-600 text-white hover:bg-[#2C3E50] hover:text-white"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd-MM-yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1F2937] border-gray-600">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-[#1F2937] text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium text-gray-300">Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-[#1F2937] border-gray-600 text-white text-sm [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3"
            disabled={transactionType === 'transfer' ? selectedAssets.length === 0 : !selectedCoin || !amount || !price || !paymentMethod || (!isMarginPortfolio && insufficientFunds)}
          >
            Add Transaction
          </Button>
        </div>
      </DialogContent>
      {showAddFunds && (
        <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
          <DialogContent className="sm:max-w-[300px] bg-[#0A1929] text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">Add More {paymentMethod}</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">Enter the amount you want to add.</DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <Input
                type="number"
                placeholder="Amount"
                value={additionalFunds}
                onChange={(e) => setAdditionalFunds(e.target.value)}
                className="bg-[#1F2937] border-gray-600 text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddFunds} className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3">
                Add Funds
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}