'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Portfolio, PortfolioType } from '@/src/types/portfolio.types'
import { getUserPortfolios, updatePortfolioName, createPortfolio, disablePortfolio } from '@/utils/actions/portfolio-actions'
import { useUser } from '@clerk/nextjs'
import { FakePortfolio } from '@/app/data/fakePortfolio'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PortfolioSelectorProps {
  onPortfolioChange: (portfolio: Portfolio) => void
}

export function PortfolioSelector({ onPortfolioChange }: PortfolioSelectorProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([FakePortfolio])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(FakePortfolio)
  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('SPOT')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [portfolioDescription, setPortfolioDescription] = useState('')

  useEffect(() => {
    const loadPortfolios = async () => {
      if (!isLoaded || !isSignedIn) return
      
      try {
        const data = await getUserPortfolios(user.id)
        if (Array.isArray(data)) {
          setPortfolios([FakePortfolio, ...data])
        } else {
          setError('Failed to load portfolios')
        }
      } catch (error) {
        console.error('Portfolio loading error:', error)
        setError('Failed to connect to the database')
      }
    }

    loadPortfolios()
  }, [user?.id, isLoaded, isSignedIn])

  const handleUpdateName = async () => {
    if (!selectedPortfolio?.id || !newName) return
    try {
      const response = await fetch(`/api/portfolio/${selectedPortfolio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      
      if (!response.ok) throw new Error('Failed to update portfolio name')
      
      setPortfolios(portfolios.map(p => 
        p.id === selectedPortfolio.id ? { ...p, name: newName } : p
      ))
      setIsEditNameOpen(false)
    } catch (error) {
      console.error('Failed to update portfolio name:', error)
      toast.error('Failed to update portfolio name')
    }
  }

  const handleCreatePortfolio = async () => {
    if (!user?.id || !newPortfolioName) return
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newPortfolioName,
          type: portfolioType,
          description: portfolioDescription
        })
      })
      
      if (!response.ok) throw new Error('Failed to create portfolio')
      const newPortfolio = await response.json()
      
      setPortfolios(prev => {
        const withoutFake = prev.filter(p => p.id !== 'fake-portfolio')
        return [FakePortfolio, ...withoutFake, newPortfolio]
      })
      setSelectedPortfolio(newPortfolio)
      onPortfolioChange(newPortfolio)
      
      setIsAddPortfolioOpen(false)
      setNewPortfolioName('')
      setPortfolioDescription('')
      setPortfolioType('SPOT')
      
      toast.success('Portfolio created successfully')
    } catch (error) {
      console.error('Failed to create portfolio:', error)
      toast.error('Failed to create portfolio')
    }
  }

  const handleDeletePortfolio = async () => {
    if (!selectedPortfolio?.id || selectedPortfolio.id === 'fake-portfolio') return
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await disablePortfolio(selectedPortfolio.id.toString())
      setPortfolios(portfolios.filter(p => p.id !== selectedPortfolio.id))
      setIsEditNameOpen(false)
      setIsDeleteConfirmOpen(false)
      
      if (selectedPortfolio.id === selectedPortfolio.id) {
        setSelectedPortfolio(FakePortfolio)
        onPortfolioChange(FakePortfolio)
      }
      toast.success("Portfolio successfully deleted")
    } catch (error) {
      console.error('Failed to delete portfolio:', error)
      toast.error("Failed to delete portfolio")
    }
  }

  const resetCreatePortfolioForm = () => {
    setNewPortfolioName('')
    setPortfolioDescription('')
    setPortfolioType('SPOT')
  }

  const handlePortfolioChange = (value: string) => {
    if (value === "add") {
      setIsAddPortfolioOpen(true)
      return
    }
    const portfolio = portfolios.find(p => p.id.toString() === value)
    if (!portfolio) {
      console.error('Portfolio not found:', value)
      return
    }
    setSelectedPortfolio(portfolio)
    onPortfolioChange(portfolio)
  }

  return (
    <>
      <Select
        value={selectedPortfolio?.id.toString() || ''}
        onValueChange={handlePortfolioChange}
      >
        <SelectTrigger className="w-[160px] h-8 bg-[#1F2937] border-gray-800/50 text-sm text-white whitespace-nowrap overflow-hidden text-ellipsis">
          <SelectValue placeholder="Select Portfolio" />
        </SelectTrigger>
        <SelectContent>
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="relative">
              <SelectItem 
                value={portfolio.id.toString()}
                className="text-white text-sm hover:bg-[#374151] group pr-8"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    portfolio.id === 'fake-portfolio' 
                      ? "bg-gray-500" 
                      : portfolio.type === 'SPOT' 
                        ? "bg-green-500" 
                        : "bg-yellow-500"
                  )} />
                  <span>{portfolio.id === 'fake-portfolio' ? 'Demo Portfolio' : portfolio.name}</span>
                  {portfolio.id !== 'fake-portfolio' && (
                    <>
                      <span className="text-xs text-gray-400">
                        ({portfolio.type.toLowerCase()})
                      </span>
                      {portfolio.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 hover:text-white cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1F2937] border-gray-600 text-white text-xs max-w-[200px]">
                              {portfolio.description}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </>
                  )}
                </div>
              </SelectItem>
              {portfolio.id !== 'fake-portfolio' && (
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const selectTrigger = document.querySelector('[role="combobox"]')
                    if (selectTrigger instanceof HTMLElement) {
                      selectTrigger.click()
                    }
                    setTimeout(() => {
                      setNewName(portfolio.name)
                      setSelectedPortfolio(portfolio)
                      setIsEditNameOpen(true)
                    }, 50)
                  }}
                >
                  <Pencil className="h-3 w-3 text-gray-400 hover:text-white" />
                </div>
              )}
            </div>
          ))}
          <SelectItem value="add" className="text-blue-500 text-sm hover:bg-[#374151]">
            <Plus className="h-3 w-3 mr-2 inline-block" />
            Add Portfolio
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog 
        open={isEditNameOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditNameOpen(false)
            setNewName('')
          } else {
            setIsEditNameOpen(true)
          }
        }}
      >
        <DialogContent className="bg-[#1F2937] border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">New Name</Label>
              <Input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New Portfolio Name"
                className="bg-[#374151] border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handleDeletePortfolio}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditNameOpen(false)}
                className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateName}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isAddPortfolioOpen} 
        onOpenChange={(open) => {
          if (!open) {
            resetCreatePortfolioForm()
          }
          setIsAddPortfolioOpen(open)
        }}
      >
        <DialogContent className="bg-[#0A1929] border border-gray-800/50 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Create New Portfolio</DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              Add a new portfolio to track your investments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Portfolio Name</Label>
              <Input 
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Enter portfolio name"
                maxLength={16}
                className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-400">
                {16 - newPortfolioName.length} characters remaining
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Description</Label>
              <Input 
                value={portfolioDescription}
                onChange={(e) => setPortfolioDescription(e.target.value)}
                placeholder="Enter portfolio description (optional)"
                className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Portfolio Type</Label>
              <RadioGroup 
                value={portfolioType}
                onValueChange={(value) => setPortfolioType(value as PortfolioType)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="relative">
                  <RadioGroupItem
                    value="SPOT"
                    id="spot"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="spot"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-[#1F2937] p-4 hover:bg-[#2D3748] hover:border-blue-500 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer"
                  >
                    <svg
                      className="mb-2 h-6 w-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Spot
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem
                    value="MARGIN"
                    id="margin"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="margin"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-[#1F2937] p-4 hover:bg-[#2D3748] hover:border-yellow-500 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-500/10 cursor-pointer"
                  >
                    <svg
                      className="mb-2 h-6 w-6 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Margin
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreatePortfolio}
              disabled={!newPortfolioName}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Portfolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-[#1F2937] border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Portfolio</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete portfolio "{selectedPortfolio?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 