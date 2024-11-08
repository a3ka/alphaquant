"use client"

import * as React from "react"
import { Check, ChevronsUpDown, CalendarIcon, Clock, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"

const portfolios = [
  { label: "Main Portfolio", value: "main" },
  { label: "Trading Portfolio", value: "trading" },
  { label: "Long-term Holdings", value: "longterm" },
]

const coins = [
  { label: "Bitcoin", value: "BTC", icon: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400" },
  { label: "Ethereum", value: "ETH", icon: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628" },
  { label: "Stark Network", value: "STRK", icon: "https://assets.coingecko.com/coins/images/26433/standard/starknet.png?1696525507" },
  { label: "MAGIC", value: "MAGIC", icon: "https://assets.coingecko.com/coins/images/18623/standard/magic.png?1696518095" },
  { label: "Casper Network", value: "CSPR", icon: "https://assets.coingecko.com/coins/images/15279/standard/CSPR_Token_Logo_CoinGecko.png?1709518377" },
  { label: "Hedera", value: "HBAR", icon: "https://assets.coingecko.com/coins/images/3688/standard/hbar.png?1696504364" },
  { label: "Wormhole", value: "W", icon: "https://assets.coingecko.com/coins/images/35087/standard/womrhole_logo_full_color_rgb_2000px_72ppi_fb766ac85a.png?1708688954" },
  { label: "Convex Finance", value: "CVX", icon: "https://assets.coingecko.com/coins/images/15585/standard/convex.png?1696515221" },
  { label: "Decentraland", value: "MANA", icon: "https://assets.coingecko.com/coins/images/878/standard/decentraland-mana.png?1696502010" },
  { label: "Ethena", value: "ENA", icon: "https://assets.coingecko.com/coins/images/36530/standard/ethena.png?1711701436" }
]

interface CoinBalance {
  available: number
  inCollateral: number
}

const coinBalances: Record<string, CoinBalance> = {
  "BTC": { available: 1.5, inCollateral: 0.5 },
  "ETH": { available: 15.0, inCollateral: 3.0 },
  "STRK": { available: 1000, inCollateral: 200 },
  "MAGIC": { available: 500, inCollateral: 100 },
  "CSPR": { available: 10000, inCollateral: 2000 },
  "HBAR": { available: 20000, inCollateral: 4000 },
  "W": { available: 750, inCollateral: 150 },
  "CVX": { available: 300, inCollateral: 60 },
  "MANA": { available: 1500, inCollateral: 300 },
  "ENA": { available: 2000, inCollateral: 400 }
}

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [transactionType, setTransactionType] = React.useState<"buy" | "sell">("buy")
  const [tradeType, setTradeType] = React.useState<"spot" | "margin">("spot")
  const [selectedPortfolio, setSelectedPortfolio] = React.useState("")
  const [openPortfolio, setOpenPortfolio] = React.useState(false)
  const [selectedCoin, setSelectedCoin] = React.useState("")
  const [openCoin, setOpenCoin] = React.useState(false)
  const [date, setDate] = React.useState<Date>(new Date())
  const [openDate, setOpenDate] = React.useState(false)
  const [time, setTime] = React.useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
  const [amount, setAmount] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [selectedCollateral, setSelectedCollateral] = React.useState<string[]>([])
  const [collateralAmounts, setCollateralAmounts] = React.useState<Record<string, string>>({})
  const [step, setStep] = React.useState<"select" | "amount">("select")

  const handleSave = () => {
    console.log({
      transactionType,
      tradeType,
      selectedPortfolio,
      selectedCoin,
      date,
      time,
      amount,
      price,
      collateral: tradeType === "margin" ? 
        selectedCollateral.map(coin => ({
          coin,
          amount: collateralAmounts[coin] || "0",
          isCollateral: true
        })) : undefined
    })
    onOpenChange(false)
  }

  const handleCollateralSelect = (coin: string) => {
    setSelectedCollateral(prev => 
      prev.includes(coin) ? prev.filter(c => c !== coin) : [...prev, coin]
    )
  }

  const handleCollateralAmountChange = (coin: string, amount: string) => {
    setCollateralAmounts(prev => ({ ...prev, [coin]: amount }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0F1B] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2 bg-[#151B28] p-1 rounded-lg">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-md",
                transactionType === "buy" 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "text-gray-400 hover:text-white hover:bg-[#1F2937]"
              )}
              onClick={() => setTransactionType("buy")}
            >
              BUY
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-md",
                transactionType === "sell" 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "text-gray-400 hover:text-white hover:bg-[#1F2937]"
              )}
              onClick={() => setTransactionType("sell")}
            >
              SELL
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">PORTFOLIO</Label>
              <Button
                variant="outline"
                disabled
                className="w-full justify-between bg-[#151B28] border-gray-800 text-gray-500"
              >
                Select Portfolio
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </div>

            <div>
              <Label className="text-gray-400">COIN</Label>
              <Popover open={openCoin} onOpenChange={setOpenCoin}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCoin}
                    className="w-full justify-between bg-[#151B28] border-gray-800 text-white hover:bg-[#1F2937] hover:text-white"
                  >
                    {selectedCoin ? (
                      <div className="flex items-center">
                        <img 
                          src={coins.find(c => c.value === selectedCoin)?.icon} 
                          alt={selectedCoin}
                          className="w-5 h-5 mr-2"
                        />
                        {coins.find((coin) => coin.value === selectedCoin)?.label}
                      </div>
                    ) : (
                      "Search"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#151B28] border-gray-800">
                  <Command>
                    <CommandInput placeholder="Search coins..." className="bg-[#151B28]" />
                    <CommandEmpty>No coin found.</CommandEmpty>
                    <ScrollArea className="h-[200px]">
                      <CommandGroup>
                        {coins.map((coin) => (
                          <CommandItem
                            key={coin.value}
                            value={coin.value}
                            onSelect={(currentValue) => {
                              setSelectedCoin(currentValue === selectedCoin ? "" : currentValue)
                              setOpenCoin(false)
                            }}
                            className="text-gray-300 hover:bg-[#1F2937]"
                          >
                            <div className="flex items-center">
                              <img src={coin.icon} alt={coin.label} className="w-5 h-5 mr-2" />
                              {coin.label}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">DATE</Label>
                <Popover open={openDate} onOpenChange={setOpenDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        "bg-[#151B28] border-gray-800 text-white hover:bg-[#1F2937] hover:text-white"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? date.toLocaleDateString() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#151B28] border-gray-800">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date || new Date())
                        setOpenDate(false)
                      }}
                      initialFocus
                      className="bg-[#151B28] text-white border-gray-700 rounded-md"
                      classNames={{
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                        day_today: "bg-gray-700 text-white",
                        day: "text-gray-300 hover:bg-gray-700",
                        head_cell: "text-gray-400",
                        nav_button: "text-gray-400 hover:text-white",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-gray-400">TIME</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-[#151B28] border-gray-800 text-white pl-10"
                    placeholder="HH:MM"
                    pattern="[0-9]{2}:[0-9]{2}"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">AMOUNT</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.,]/g, '')
                    setAmount(value)
                  }}
                  className="bg-[#151B28] border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-400">PRICE</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.,]/g, '')
                    setPrice(value)
                  }}
                  className="bg-[#151B28] border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-400">TRADE TYPE</Label>
              <RadioGroup
                defaultValue="spot"
                onValueChange={(value) => {
                  setTradeType(value as "spot" | "margin")
                  setStep("select")
                  setSelectedCollateral([])
                  setCollateralAmounts({})
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spot" id="spot" className="border-gray-600 text-blue-500" />
                  <Label htmlFor="spot" className="text-white">Spot</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="margin" id="margin" className="border-gray-600 text-blue-500" />
                  <Label htmlFor="margin" className="text-white">Margin</Label>
                </div>
              </RadioGroup>
            </div>

            {tradeType === "margin" && step === "select" && (
              <div>
                <Label className="text-gray-400">SELECT COLLATERAL</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border border-gray-800">
                  <div className="p-4">
                    {coins.map((coin) => (
                      <div key={coin.value} className="flex items-center mb-2">
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            id={`collateral-${coin.value}`}
                            checked={selectedCollateral.includes(coin.value)}
                            onChange={() => handleCollateralSelect(coin.value)}
                            className="form-checkbox h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 bg-gray-700"
                          />
                        </div>
                        <div className="flex items-center ml-2">
                          <img src={coin.icon} alt={coin.label} className="w-5 h-5 mr-2" />
                          <span className="text-white">{coin.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button 
                  onClick={() => setStep("amount")} 
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                  disabled={selectedCollateral.length === 0}
                >
                  Next
                </Button>
              </div>
            )}

            {tradeType === "margin" && step === "amount" && (
              <div className="space-y-4">
                <Label className="text-gray-400">COLLATERAL AMOUNTS</Label>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-sm font-medium text-gray-400">Coin</div>
                  <div className="text-sm font-medium text-gray-400">Amount</div>
                  <div className="text-sm font-medium text-gray-400">Available</div>
                </div>
                {selectedCollateral.map((coinValue) => {
                  const coin = coins.find(c => c.value === coinValue)
                  const balance = coinBalances[coinValue]
                  const availableForCollateral = balance ? 
                    (balance.available - balance.inCollateral).toFixed(4) : 
                    "0"
                  
                  return (
                    <div key={coinValue} className="grid grid-cols-3 gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <img src={coin?.icon} alt={coin?.label} className="w-5 h-5" />
                        <span className="text-white">{coin?.label}</span>
                      </div>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        placeholder="0.0"
                        value={collateralAmounts[coinValue] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.,]/g, '')
                          handleCollateralAmountChange(coinValue, value)
                        }}
                        className="w-full bg-[#151B28] border-gray-800 text-white placeholder:text-gray-500"
                      />
                      <span className="text-sm text-gray-400">
                        {availableForCollateral}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          {tradeType === "margin" && step === "amount" && (
            <Button
              variant="outline"
              onClick={() => setStep("select")}
              className="px-3 py-2 text-sm bg-transparent border border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex justify-end gap-2 ml-auto">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="bg-[#151B28] text-gray-400 hover:text-white hover:bg-[#1F2937]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}