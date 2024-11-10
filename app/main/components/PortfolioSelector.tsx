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
import { getUserPortfolios, updatePortfolioName, createPortfolio } from '@/utils/actions/portfolio-actions'
import { useUser } from '@clerk/nextjs'
import { FakePortfolio } from '@/app/data/fakePortfolio'

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
        <SelectTrigger className="w-[140px] h-8 bg-[#1F2937] border-gray-800/50 text-sm">
          <SelectValue placeholder="Select Portfolio" />
        </SelectTrigger>
        <SelectContent>
          {portfolios.map((portfolio) => (
            <SelectItem 
              key={portfolio.id} 
              value={portfolio.id}
              className="text-white text-sm hover:bg-[#374151] group"
            >
              <div className="flex items-center justify-between w-full">
                <span>{portfolio.id === 'fake-portfolio' ? 'Demo Portfolio' : portfolio.name}</span>
                {portfolio.id !== 'fake-portfolio' && (
                  <Pencil 
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 cursor-pointer ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPortfolio(portfolio)
                      setIsEditNameOpen(true)
                    }}
                  />
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="add" className="text-blue-500 text-sm hover:bg-[#374151]">
            <Plus className="h-3 w-3 mr-2 inline-block" />
            Add Portfolio
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Name</Label>
              <Input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNameOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateName}>Save</Button>
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