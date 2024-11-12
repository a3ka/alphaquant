'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Portfolio } from '@/utils/supabase'
import { getUserPortfolios, updatePortfolioName, createPortfolio, deletePortfolio } from '@/utils/actions/portfolio-actions'
import { useUser } from '@clerk/nextjs'
import { FakePortfolio } from '@/app/data/fakePortfolio'
import { toast } from 'sonner'

interface PortfolioSelectorProps {
  onPortfolioChange: (portfolio: Portfolio) => void
}

export function PortfolioSelector({ onPortfolioChange }: PortfolioSelectorProps) {
  const { user } = useUser()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([FakePortfolio])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(FakePortfolio)
  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [portfolioType, setPortfolioType] = useState<'spot' | 'margin'>('spot')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPortfolios = async () => {
      console.log('Starting loadPortfolios function')
      console.log('Current user:', user)
      
      if (!user?.id) {
        console.log('No user ID found')
        return
      }
      
      try {
        console.log('Calling getUserPortfolios with userId:', user.id)
        const data = await getUserPortfolios(user.id)
        console.log('Data received from getUserPortfolios:', data)
        
        if (Array.isArray(data)) {
          setPortfolios([FakePortfolio, ...data])
        } else {
          console.error('Data is not an array:', data)
          setError('Failed to load portfolios')
        }
      } catch (error) {
        console.error('Portfolio loading error:', error)
        setError('Failed to connect to the database')
      }
    }

    loadPortfolios()
  }, [user?.id])

  const handleUpdateName = async () => {
    if (!selectedPortfolio?.id || !newName) return
    try {
      await updatePortfolioName(selectedPortfolio.id, newName)
      setPortfolios(portfolios.map(p => 
        p.id === selectedPortfolio.id ? { ...p, name: newName } : p
      ))
      setIsEditNameOpen(false)
    } catch (error) {
      console.error('Failed to update portfolio name:', error)
    }
  }

  const handleCreatePortfolio = async () => {
    if (newPortfolioName.length > 16) {
      toast.error("Portfolio name cannot exceed 16 characters");
      return;
    }
    if (!user?.id || !newPortfolioName) return
    try {
      const newPortfolio = await createPortfolio(user.id, newPortfolioName, portfolioType)
      if (newPortfolio) {
        setPortfolios([...portfolios, newPortfolio])
        setIsAddPortfolioOpen(false)
        setNewPortfolioName('')
        setPortfolioType('spot')
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error)
    }
  }

  const handleDeletePortfolio = async () => {
    if (!selectedPortfolio?.id || selectedPortfolio.id === 'fake-portfolio') return
    
    try {
      await deletePortfolio(selectedPortfolio.id)
      setPortfolios(portfolios.filter(p => p.id !== selectedPortfolio.id))
      setIsEditNameOpen(false)
      
      if (selectedPortfolio.id === selectedPortfolio.id) {
        setSelectedPortfolio(FakePortfolio)
        onPortfolioChange(FakePortfolio)
      }
    } catch (error) {
      console.error('Failed to delete portfolio:', error)
    }
  }

  return (
    <>
      <Select
        value={selectedPortfolio.id}
        onValueChange={(value) => {
          if (value === "add") {
            setIsAddPortfolioOpen(true)
            return
          }
          const portfolio = portfolios.find(p => p.id === value)
          if (portfolio) {
            setSelectedPortfolio(portfolio)
            onPortfolioChange(portfolio)
          }
        }}
      >
        <SelectTrigger className="w-[160px] h-8 bg-[#1F2937] border-gray-800/50 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
          <SelectValue placeholder="Select Portfolio" />
        </SelectTrigger>
        <SelectContent>
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="relative">
              <SelectItem 
                value={portfolio.id}
                className="text-white text-sm hover:bg-[#374151] group pr-8"
              >
                <span>{portfolio.id === 'fake-portfolio' ? 'Demo Portfolio' : portfolio.name}</span>
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

      <Dialog open={isAddPortfolioOpen} onOpenChange={setIsAddPortfolioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Portfolio Name</Label>
              <Input 
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Enter portfolio name"
                maxLength={16}
                className="bg-transparent border-gray-800 text-white"
              />
            </div>
            <div>
              <Label>Type</Label>
              <RadioGroup 
                value={portfolioType}
                onValueChange={(value) => setPortfolioType(value as 'spot' | 'margin')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spot" id="spot" />
                  <Label htmlFor="spot">Spot</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="margin" id="margin" />
                  <Label htmlFor="margin">Margin</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPortfolioOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePortfolio}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 