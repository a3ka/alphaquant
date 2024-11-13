'use client'

import { useState } from 'react'
import { Info, Lock, Unlock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Signal {
  name: string;
  winRate: number;
  status: string;
  signalsPerDay: number;
  trend: string;
  timeline: string;
  probability: number;
  direction: string;
}

const alphaSignals = [
  { 
    name: 'Volatility Breakout Alpha', 
    winRate: 76, 
    status: 'locked',
    signalsPerDay: 12, 
    trend: 'up',
    timeline: '2 weeks',
    probability: 75,
    direction: 'growth'
  },
  { 
    name: 'Order Flow Imbalance Alpha', 
    winRate: 82, 
    status: 'unlocked',
    signalsPerDay: 8, 
    trend: 'up',
    timeline: '1 month',
    probability: 80,
    direction: 'growth'
  },
  { 
    name: 'Whale Movement Alpha', 
    winRate: 71, 
    status: 'unlocked',
    signalsPerDay: 5, 
    trend: 'down',
    timeline: '1 week',
    probability: 65,
    direction: 'decline'
  },
  { 
    name: 'Funding Rate Arbitrage Alpha', 
    winRate: 79, 
    status: 'locked',
    signalsPerDay: 15, 
    trend: 'neutral',
    timeline: '3 days',
    probability: 70,
    direction: 'sideways'
  },
  { 
    name: 'Exchange Flow Alpha', 
    winRate: 74, 
    status: 'unlocked',
    signalsPerDay: 10, 
    trend: 'up',
    timeline: '5 days',
    probability: 72,
    direction: 'growth'
  },
]

export function RightSidebar() {
  const [alphaInfoOpen, setAlphaInfoOpen] = useState(false)
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)

  return (
    <aside className="col-span-12 lg:col-span-3 border border-gray-700 rounded-lg overflow-hidden sticky top-20 self-start">
      <Card className="bg-[#010714] h-full border border-gray-800/30 rounded-lg flex flex-col">
        <CardHeader>
          <CardTitle className="text-white text-xl font-semibold">Alpha Signals</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-hidden">
          <div className="grid grid-cols-2 gap-4 p-4">
            <Card className="bg-[#0A1929] border border-gray-800/30">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-[#4ADE80]">76%</div>
                <div className="text-sm text-[#9CA3AF]">Avg Win Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0A1929] border border-gray-800/30">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-[#0B84D4]">142</div>
                <div className="text-sm text-[#9CA3AF]">Active Signals</div>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)] px-4 pb-4 overflow-y-auto [&_.scrollbar]:hidden [&_.thumb]:hidden">
            <div className="space-y-4">
              {alphaSignals.map((signal) => (
                <Card key={signal.name} className="bg-[#0A1929] hover:bg-[#0A1929]/80 transition-colors duration-300 border border-gray-800/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white">{signal.name}</h3>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 hover:bg-[#1F2937]"
                              onClick={() => {
                                setSelectedSignal(signal)
                                setAlphaInfoOpen(true)
                              }}
                            >
                              <Info className="h-4 w-4 text-[#9CA3AF]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-[#1F2937]"
                            >
                              {signal.status === 'locked' ? (
                                <Lock className="h-4 w-4 text-[#9CA3AF]" />
                              ) : (
                                <Unlock className="h-4 w-4 text-[#9CA3AF]" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {signal.status === 'unlocked' ? (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#9CA3AF]">Win Rate:</span>
                              <span className="text-sm font-bold text-[#4ADE80]">{signal.winRate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div 
                                className={`w-6 h-6 rounded-full ${
                                  signal.trend === 'up' ? 'bg-green-500' :
                                  signal.trend === 'down' ? 'bg-red-500' :
                                  'bg-yellow-500'
                                }`}
                              />
                              <span className="flex-1 ml-2 text-[#E5E7EB] text-sm">
                                {signal.direction} • {signal.timeline} • {signal.probability}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 h-16 bg-[#1F2937]/50 backdrop-blur-sm rounded-md flex items-center justify-center">
                            <span className="text-[#9CA3AF]">Locked Content</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  )
}