'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, Users, Percent, Signal, Menu } from 'lucide-react'

interface AlphaFactor {
  name: string
  x: number
  y: number
}

interface SignalData {
  type: 'buy' | 'sell' | 'hold' | 'analyze'
  x: number
  y: number
  opacity: number
}

const alphaFactors: AlphaFactor[] = [
  { name: 'On-chain Data', x: 20, y: 100 },
  { name: 'Social Sentiment', x: 20, y: 200 },
  { name: 'Order Book Depth', x: 20, y: 300 },
  { name: 'Volatility', x: 20, y: 400 },
  { name: 'Funding Rates', x: 20, y: 500 },
  { name: 'Whale Movements', x: 580, y: 100 },
  { name: 'Liquidations', x: 580, y: 200 },
  { name: 'Exchange Inflows', x: 580, y: 300 },
  { name: 'Futures Open Interest', x: 580, y: 400 },
  { name: 'Correlation Analysis', x: 580, y: 500 },
]

const random = (min: number, max: number) => Math.random() * (max - min) + min

function SignalFlowVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signals, setSignals] = useState<SignalData[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })

  useEffect(() => {
    const updateCanvasSize = () => {
      const width = Math.min(600, window.innerWidth - 40) // 40px for padding
      setCanvasSize({ width, height: width })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    const scaleFactor = canvasSize.width / 600

    let dots: { x: number; y: number; factor: AlphaFactor; progress: number }[] = []
    alphaFactors.forEach(factor => {
      for (let i = 0; i < 3; i++) {
        dots.push({
          x: factor.x * scaleFactor,
          y: factor.y * scaleFactor,
          factor,
          progress: random(0, 1)
        })
      }
    })

    const animate = () => {
      requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw dotted background
        ctx.fillStyle = '#ffffff0a'
        for (let i = 0; i < canvas.width; i += 20 * scaleFactor) {
          for (let j = 0; j < canvas.height; j += 20 * scaleFactor) {
            ctx.beginPath()
            ctx.arc(i, j, 1 * scaleFactor, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Draw paths and animate dots
        dots.forEach(dot => {
          const targetX = canvas.width / 2
          const targetY = canvas.height / 2

          ctx.beginPath()
          ctx.strokeStyle = '#ffffff1a'
          ctx.lineWidth = 1 * scaleFactor
          ctx.setLineDash([5 * scaleFactor, 5 * scaleFactor])
          ctx.moveTo(dot.factor.x * scaleFactor, dot.factor.y * scaleFactor)
          ctx.lineTo(targetX, targetY)
          ctx.stroke()

          dot.progress += 0.01
          if (dot.progress > 1) dot.progress = 0

          dot.x = dot.factor.x * scaleFactor + (targetX - dot.factor.x * scaleFactor) * dot.progress
          dot.y = dot.factor.y * scaleFactor + (targetY - dot.factor.y * scaleFactor) * dot.progress

          ctx.beginPath()
          ctx.fillStyle = '#60A5FA'
          ctx.shadowColor = '#60A5FA'
          ctx.shadowBlur = 10 * scaleFactor
          ctx.arc(dot.x, dot.y, 2 * scaleFactor, 0, Math.PI * 2)
          ctx.fill()
        })

        // Generate new signals
        if (Math.random() < 0.005 && signals.length < 10) { // Reduced frequency and limited to 10 signals
          const signalTypes: SignalData['type'][] = ['buy', 'sell', 'hold', 'analyze']
          const angle = Math.random() * Math.PI * 2;
          const radius = random(100, 200); // Slightly smaller radius
          const x = 300 + Math.cos(angle) * radius;
          const y = 300 + Math.sin(angle) * radius;
          setSignals(prev => [...prev, {
            type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
            x,
            y,
            opacity: 1
          }])
        }

        animate()
      })
    }

    animate()
  }, [canvasSize])

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => 
        prev
          .map(signal => ({ ...signal, opacity: signal.opacity - 0.01 }))
          .filter(signal => signal.opacity > 0)
      )
    }, 50) // Уменьшили интервал для более плавного обновления

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full" style={{ height: canvasSize.height }}>
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Central Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-[2px]">
          <div className="w-full h-full rounded-full bg-[#0A0B0D] flex items-center justify-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#60A5FA] to-[#3B82F6]">
              Alpha<br />Quant
            </div>
          </div>
        </div>
      </div>

      {/* Alpha Factors */}
      {alphaFactors.map((factor) => (
        <div key={factor.name} className="absolute text-sm text-white" style={{ left: factor.x - 50, top: factor.y - 10 }}>
          <div className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-1 border border-white/20">
            {factor.name}
          </div>
        </div>
      ))}

      {/* Floating Signals */}
      {signals.map((signal, index) => (
        <motion.div
          key={index}
          className={`absolute px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[8px] sm:text-xs md:text-sm font-medium ${
            signal.type === 'buy' ? 'bg-[#00C853]/20 text-[#00C853]' :
            signal.type === 'sell' ? 'bg-[#FF3B30]/20 text-[#FF3B30]' :
            signal.type === 'hold' ? 'bg-[#007AFF]/20 text-[#007AFF]' :
            'bg-[#FFD60A]/20 text-[#FFD60A]'
          }`}
          style={{
            left: signal.x,
            top: signal.y,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: signal.opacity, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          {signal.type.toUpperCase()}
        </motion.div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] bg-opacity-95 text-white overflow-hidden" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E')" }}>
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-xl font-bold">AlphaQuant</div>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Platform</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Signals</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Documentation</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Community</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Signal className="h-4 w-4 text-[#007AFF]" />
                <span className="text-sm">Signals: 2.4K</span>
              </div>
              <div className="flex items-center space-x-2">
                <Percent className="h-4 w-4 text-[#00C853]" />
                <span className="text-sm">Win Rate: 76%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[#FFD60A]" />
                <span className="text-sm">Users: 15.2K</span>
              </div>
            </div>
            <Button className="hidden md:flex">
              Launch Platform
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              QUANTITATIVE
              <br />
              ALPHA SIGNALS_
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-white/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Professional-grade trading signals powered by machine learning and on-chain analytics
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="text-[#007AFF] text-xl sm:text-2xl font-bold">24.5%</div>
                  <div className="text-xs sm:text-sm text-white/50">Monthly Return</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="text-[#00C853] text-xl sm:text-2xl font-bold">76%</div>
                  <div className="text-xs sm:text-sm text-white/50">Win Rate</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="text-[#FFD60A] text-xl sm:text-2xl font-bold">2.4K</div>
                  <div className="text-xs sm:text-sm text-white/50">Active Signals</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button className="h-12 px-8 text-base sm:text-lg bg-[#007AFF] hover:bg-[#0056b3]">
                Start Trading
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
          <div className="w-full max-w-[600px] mx-auto lg:max-w-none">
            <SignalFlowVisualization />
          </div>
        </div>
      </main>

      <section className="border-t border-white/10 py-12">
        
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-8 text-center">Trusted By</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}