import { Activity, AlertTriangle, BarChart2, GitBranch, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const strategies = [
  {
    name: 'Flow Trading Strategy',
    roi: 15.2,
    activePairs: 8,
    avgTradeTime: '2.5h',
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    name: 'Pair Trading Strategy',
    roi: 12.8,
    correlation: 0.85,
    activeArbitrages: 5,
    icon: <GitBranch className="h-5 w-5" />
  },
  {
    name: 'Momentum Strategy',
    roi: 18.5,
    momentum: 'Strong',
    timeframe: '4h',
    icon: <Activity className="h-5 w-5" />
  }
]

export function LeftSidebar() {
  return (
    <aside className="col-span-12 lg:col-span-3 bg-[#010714] overflow-y-auto border border-gray-700 rounded-lg sticky top-20 self-start max-h-[calc(100vh-5rem)]">
      <div className="p-4 space-y-4">
        {strategies.map((strategy) => (
          <Card key={strategy.name} className="bg-[#010714] hover:bg-[#0A1929] transition-colors duration-300 shadow-lg border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  {strategy.icon}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-white">{strategy.name}</h3>
                  <div className="mt-1 space-y-1 text-sm text-[#93C5FD]">
                    {strategy.roi && (
                      <div>ROI: <span className="text-[#4ADE80]">{strategy.roi}%</span></div>
                    )}
                    {strategy.activePairs && (
                      <div>Active Pairs: {strategy.activePairs}</div>
                    )}
                    {strategy.avgTradeTime && (
                      <div>Avg Trade Time: {strategy.avgTradeTime}</div>
                    )}
                    {strategy.correlation && (
                      <div>Correlation: {strategy.correlation}</div>
                    )}
                    {strategy.activeArbitrages && (
                      <div>Active Arbitrages: {strategy.activeArbitrages}</div>
                    )}
                    {strategy.momentum && (
                      <div>Momentum: <span className="text-blue-400">{strategy.momentum}</span></div>
                    )}
                    {strategy.timeframe && (
                      <div>Timeframe: {strategy.timeframe}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="mt-6 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-[#D1D5DB] hover:text-white hover:bg-[#0A1929] transition-colors duration-300 px-4">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Risk Factor Analysis
          </Button>
          <Button variant="ghost" className="w-full justify-start text-[#D1D5DB] hover:text-white hover:bg-[#0A1929] transition-colors duration-300 px-4">
            <BarChart2 className="mr-2 h-4 w-4" />
            Market Statistics
          </Button>
          <Button variant="ghost" className="w-full justify-start text-[#D1D5DB] hover:text-white hover:bg-[#0A1929] transition-colors duration-300 px-4">
            <Activity className="mr-2 h-4 w-4" />
            Technical Analysis
          </Button>
        </div>
      </div>
    </aside>
  )
}