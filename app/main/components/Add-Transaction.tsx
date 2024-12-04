'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import { Check, ChevronsUpDown, Calendar as CalendarIcon, Clock, TrendingUp, TrendingDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { getUserPortfolios } from '@/utils/actions/portfolio-actions'
import { useUser } from '@clerk/nextjs'
import { Portfolio, isDemoPortfolio } from '@/src/types/portfolio.types'
import { FakePortfolio } from '@/app/data/fakePortfolio'
import { AddStablecoinDialog } from './AddStablecoinDialog'
import { toast } from "sonner"
import { CoinSelect } from './CoinSelect'

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
  selectedPortfolioId: string;
  onSuccess?: () => void;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  selectedPortfolioId,
  onSuccess
}: AddTransactionDialogProps) {
  const { user } = useUser()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([FakePortfolio])
  
  useEffect(() => {
    const loadPortfolios = async () => {
      if (!user?.id) return
      try {
        const data = await getUserPortfolios(user.id)
        if (Array.isArray(data)) {
          setPortfolios([FakePortfolio, ...data])
        }
      } catch (error) {
        console.error('Failed to load portfolios:', error)
      }
    }
    
    loadPortfolios()
  }, [user?.id])

  const [transactionType, setTransactionType] = useState<'buy' | 'sell' | 'transfer'>('buy')
  const [portfolio, setPortfolio] = useState<string>(selectedPortfolioId)
  const [sourcePortfolio, setSourcePortfolio] = useState<string>('')
  const [targetPortfolio, setTargetPortfolio] = useState<string>('')
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
  const [dateInput, setDateInput] = useState('')
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isAddStablecoinOpen, setIsAddStablecoinOpen] = useState(false)

  useEffect(() => {
    if (selectedPortfolioId) {
      setPortfolio(selectedPortfolioId)
    }
  }, [selectedPortfolioId, open])

  useEffect(() => {
    if (portfolios.length > 0 && !portfolio) {
      const realPortfolio = portfolios.find(p => p.id !== 'fake-portfolio')
      if (realPortfolio) {
        const portfolioId = realPortfolio.id.toString()
        setPortfolio(portfolioId)
        setSourcePortfolio(portfolioId)
        setTargetPortfolio(portfolioId)
      }
    }
  }, [portfolios, portfolio])

  const handleTransactionTypeChange = (type: 'buy' | 'sell' | 'transfer') => {
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

  const transactionTypes: Array<{
    type: 'buy' | 'sell' | 'transfer'
    label: string
    color: string
  }> = [
    { type: 'buy', label: 'Buy', color: 'green' },
    { type: 'sell', label: 'Sell', color: 'red' },
    { type: 'transfer', label: 'Transfer', color: 'blue' }
  ]

  const selectedPortfolio = portfolios?.find(p => p.id === portfolio)
  const isMarginPortfolio = selectedPortfolio?.type.toLowerCase() === 'margin'
  const totalValue = Number(amount) * Number(price)

  const currentAssets = selectedPortfolio && isDemoPortfolio(selectedPortfolio) 
    ? selectedPortfolio.data.totalValue 
    : 0
  const currentDebt = selectedPortfolio?.margin_data?.debt || 0

  let newAssets, newDebt, currentRatio, newRatio

  if (isMarginPortfolio) {
    if (transactionType === 'buy') {
      newAssets = currentAssets + totalValue
      newDebt = currentDebt + totalValue
    } else if (transactionType === 'sell') {
      newAssets = currentAssets - totalValue
      newDebt = currentDebt - totalValue
    } else {
      newAssets = currentAssets
      newDebt = currentDebt
    }
    currentRatio = currentAssets / (currentDebt || 1)
    newRatio = newAssets / (newDebt || 1)
  } else {
    newAssets = transactionType === 'buy' ? currentAssets + totalValue : currentAssets - totalValue
    newDebt = currentDebt
    currentRatio = 0
    newRatio = 0
  }

  useEffect(() => {
    if (sourcePortfolio === 'portfolio2' && transactionType === 'transfer') {
      const newRatio = 2.5 - (selectedAssets.length * 0.1)
      setAssetToDebtRatio({ current: 2.5, after: newRatio })
    }
  }, [sourcePortfolio, transactionType, selectedAssets])

  const isValidDate = (value: string): boolean => {
    if (!value) return true;
    const parts = value.split('-');
    if (parts.length < 3) return true;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    return (
      day > 0 && day <= 31 &&
      month > 0 && month <= 12 &&
      year >= 1900 && year <= 2100
    );
  };

  const isValidTime = (value: string): boolean => {
    if (!value) return true;
    const parts = value.split(':');
    if (parts.length < 2) return true;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    return (
      hours >= 0 && hours <= 23 &&
      minutes >= 0 && minutes <= 59
    );
  };

  const isDateTimeValid = (inputDate: Date | undefined, inputTime: string): boolean => {
    if (!inputDate) return false;
    
    const [hours, minutes] = inputTime.split(':').map(Number);
    const selectedDateTime = new Date(inputDate);
    selectedDateTime.setHours(hours, minutes);
    
    const currentDateTime = new Date();
    
    return selectedDateTime <= currentDateTime;
  };

  // Функция сброса всех полей
  const resetForm = () => {
    setTransactionType('buy');
    setPortfolio(portfolios[0].id.toString());
    setSourcePortfolio(portfolios[0].id.toString());
    setTargetPortfolio(portfolios[1]?.id.toString() || portfolios[0].id.toString());
    setSelectedCoin("");
    setPaymentMethod("");
    setAmount('');
    setPrice('');
    setSelectedAssets([]);
    setDate(new Date());
    setDateInput(format(new Date(), "dd-MM-yyyy"));
    setTime('12:00');
    setHours('12');
    setMinutes('00');
    setAssetToDebtRatio({ current: 2.5, after: 2.5 });
    setShowAddFunds(false);
    setAdditionalFunds('');
    setInsufficientFunds(false);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedCoin || !amount || !date || !user?.id || !portfolio) {
        toast.error('Please fill in all required fields')
        return
      }

      const portfolioId = Number(portfolio)
      if (isNaN(portfolioId)) {
        toast.error('Invalid portfolio ID')
        return
      }

      // Создаем объект даты с учетом времени
      const [hours, minutes] = time.split(':').map(Number)
      const transactionDateTime = new Date(date)
      transactionDateTime.setHours(hours, minutes)

      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId,
          userId: user.id,
          type: transactionType.toUpperCase(),
          coinName: selectedCoin,
          coinTicker: selectedCoin,
          amount: Number(amount),
          paymentMethod: paymentMethod,
          paymentPrice: Number(price),
          paymentTotal: Number(amount) * Number(price),
          priceUsd: Number(price),
          totalUsd: Number(amount) * Number(price),
          transactionTime: transactionDateTime.toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      toast.success('Transaction added successfully')
      onOpenChange(false)
      
      if (onSuccess) {
        await onSuccess()
      }

      resetForm()
      
    } catch (error: any) {
      console.error('Failed to create transaction:', error)
      toast.error(error.message || 'Failed to add transaction')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1F2937] border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">Add Transaction</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">Enter the details of your transaction here.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-wrap gap-2">
            {transactionTypes.map(({ type, label, color }) => (
              <Button
                key={type}
                onClick={() => handleTransactionTypeChange(type as 'buy' | 'sell' | 'transfer')}
                className={cn(
                  "flex-1 text-white border-2 text-xs sm:text-sm py-1 px-2",
                  type === 'buy' && transactionType === type ? "bg-green-600 border-green-400 hover:bg-green-700" :
                  type === 'sell' && transactionType === type ? "bg-red-600 border-red-400 hover:bg-red-700" :
                  type === 'transfer' && transactionType === type ? "bg-blue-600 border-blue-400 hover:bg-blue-700" :
                  `bg-transparent border-gray-600 hover:bg-${color}-900 hover:border-${color}-400`
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
                        key={p.id.toString()} 
                        value={p.id.toString()}
                        className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="ml-2 text-xs text-gray-400">({p.type.toLowerCase()})</span>
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
                        key={p.id.toString()} 
                        value={p.id.toString()}
                        className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="ml-2 text-xs text-gray-400">({p.type.toLowerCase()})</span>
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
                <Select value={portfolio} onValueChange={(value) => {
                  console.log('Portfolio selected:', value)
                  console.log('Portfolio type:', typeof value)
                  setPortfolio(value)
                }}>
                  <SelectTrigger id="portfolio" className="w-full bg-[#1F2937] border-gray-600">
                    <SelectValue placeholder="Select portfolio" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border-gray-600">
                    {portfolios?.map((p) => (
                      <SelectItem 
                        key={p.id.toString()} 
                        value={p.id.toString()}
                        className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            p.type === 'SPOT' ? "bg-green-500" : "bg-yellow-500"
                          )} />
                          <span className="text-sm font-medium text-white">{p.name}</span>
                          <span className="ml-2 text-xs text-gray-400">({p.type.toLowerCase()})</span>
                        </div>
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
                      <p className="font-bold text-white">${currentAssets.toFixed(2)}</p>
                      <p className="font-medium text-gray-300 mt-1">After transaction:</p>
                      <p className="font-bold text-green-500">${newAssets.toFixed(2)}</p>
                      {transactionType === 'buy' && (
                        <p className="text-gray-400 mt-1">
                          +{amount} {selectedCoin} (${totalValue.toFixed(2)})
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
                      <p className="font-bold text-white">${currentDebt.toFixed(2)}</p>
                      <p className="font-medium text-gray-300 mt-1">After transaction:</p>
                      <p className="font-bold text-red-500">${newDebt.toFixed(2)}</p>
                      {transactionType === 'buy' && (
                        <p className="text-gray-400 mt-1">
                          +{totalValue.toFixed(2)} {paymentMethod}
                        </p>
                      )}
                      {transactionType === 'sell' && (
                        <p className="text-gray-400 mt-1">
                          +{amount} {selectedCoin}
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
                  <CoinSelect 
                    value={selectedCoin} 
                    onValueChange={setSelectedCoin}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-300">
                    {transactionType === 'buy' ? 'Payment Method' : 'Receive Method'}
                  </Label>
                  <div className="space-y-2">
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
                    
                    {transactionType === 'buy' && (
                      <Button
                        onClick={() => setIsAddStablecoinOpen(true)}
                        variant="ghost"
                        className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 text-xs"
                      >
                        + Add More Stablecoins to Portfolio
                      </Button>
                    )}
                  </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-300">Date</Label>
              <div className="relative">
                <Input
                  type="text"
                  id="date"
                  value={dateInput}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, '');
                    
                    // Автоматическое добавление дефисов
                    if (value.length > 4) {
                      value = value.slice(0, 4) + '-' + value.slice(4);
                    }
                    if (value.length > 2) {
                      value = value.slice(0, 2) + '-' + value.slice(2);
                    }
                    
                    setDateInput(value);
                    
                    // Валидация полной даты
                    if (value.length >= 8) {
                      const day = parseInt(value.slice(0, 2));
                      const month = parseInt(value.slice(3, 5));
                      const year = parseInt(value.slice(6));
                      
                      if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 1900 && year <= 2100) {
                        const newDate = new Date(year, month - 1, day);
                        if (isDateTimeValid(newDate, time)) {
                          setDate(newDate);
                        } else {
                          setDate(undefined);
                        }
                      } else {
                        setDate(undefined);
                      }
                    } else {
                      setDate(undefined);
                    }
                  }}
                  className={cn(
                    "bg-[#1F2937] border-gray-600 text-white pr-10",
                    (dateInput && !date) || (date && !isDateTimeValid(date, time)) && "border-red-500"
                  )}
                  placeholder="DD-MM-YYYY"
                  maxLength={10}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      aria-label="Pick date"
                      role="button"
                      tabIndex={0}
                      className="absolute right-0 top-0 h-full px-3 inline-flex items-center justify-center hover:bg-gray-700/50 rounded-r-md cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="bg-[#1F2937] border-gray-600 p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                          setDateInput(format(newDate, "dd-MM-yyyy"));
                        }
                      }}
                      className="bg-[#1F2937] text-white rounded-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium text-gray-300">Time</Label>
              <div className="relative">
                <Input
                  type="text"
                  id="time"
                  value={time}
                  onChange={(e) => {
                    let value = e.target.value;
                    
                    // Разрешаем полное удаление
                    if (value === '') {
                      setTime('');
                      setHours('');
                      setMinutes('');
                      return;
                    }

                    // Удаляем все нецифровые имволы и двоеточие
                    value = value.replace(/[^\d:]/g, '');
                    
                    // Если есть двоеточие, обрабатываем часы и минуты отдельно
                    if (value.includes(':')) {
                      const [hoursStr, minutesStr] = value.split(':');
                      const validHours = hoursStr && parseInt(hoursStr) <= 23;
                      const validMinutes = minutesStr && parseInt(minutesStr) <= 59;
                      if (validHours && validMinutes) {
                        value = `${hoursStr}:${minutesStr}`;
                        setTime(value);
                        setHours(hoursStr);
                        setMinutes(minutesStr);
                      }
                    } else {
                      // Если нет двоеточия, добавляем его после первых двух цифр
                      if (value.length > 2) {
                        const hours = value.slice(0, 2);
                        const minutes = value.slice(2);
                        if (parseInt(hours) <= 23) {
                          value = `${hours}:${minutes}`;
                          setTime(value);
                          setHours(hours);
                          setMinutes(minutes);
                        }
                      } else {
                        setTime(value);
                        setHours(value);
                        setMinutes('');
                      }
                    }
                  }}
                  className={cn(
                    "bg-[#1F2937] border-gray-600 text-white pr-10",
                    ((dateInput && !date) || (date && time && !isDateTimeValid(date, time))) && "border-red-500"
                  )}
                  placeholder="HH:MM"
                  maxLength={5}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:ring-0"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-2 bg-[#1F2937] border-gray-600">
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Hours</Label>
                          <Input
                            type="text"
                            placeholder="HH"
                            value={hours}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '');
                              if (value === '') {
                                setHours('');
                                setTime('');
                                return;
                              }
                              if (parseInt(value) >= 0 && parseInt(value) <= 23) {
                                setHours(value);
                                setTime(`${value.padStart(2, '0')}:${minutes || '00'}`);
                              }
                            }}
                            className="bg-[#1F2937] border-gray-600 text-white h-8"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Minutes</Label>
                          <Input
                            type="text"
                            placeholder="MM"
                            value={minutes}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '');
                              if (parseInt(value) >= 0 && parseInt(value) <= 59) {
                                setMinutes(value);
                                setTime(`${hours || '00'}:${value.padStart(2, '0')}`);
                              }
                            }}
                            className="bg-[#1F2937] border-gray-600 text-white h-8"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!selectedCoin || !amount || !date || !portfolio}
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
      <AddStablecoinDialog
        open={isAddStablecoinOpen}
        onOpenChange={(open) => {
          console.log('Dialog opening state:', open)
          console.log('Current portfolio state:', portfolio)
          if (open && portfolio === 'fake-portfolio') {
            toast.error("Cannot add stablecoins to demo portfolio")
            return
          }
          if (open && !portfolio) {
            toast.error("Please select a portfolio first")
            return
          }
          setIsAddStablecoinOpen(open)
        }}
        portfolioId={portfolio === 'fake-portfolio' ? undefined : Number(portfolio)}
        onSuccess={() => {
          console.log('Transaction successful with portfolio:', portfolio)
        }}
      />
    </Dialog>
  )
}