'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowUpRight, 
  Users,
  Percent,
  Signal, 
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { AIAgent } from 'components/homepage/AIAgent'

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

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#002D4F')
      gradient.addColorStop(1, '#001A2C')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        particles.slice(i + 1).forEach(other => {
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
    />
  )
}

function SignalFlowVisualization({ isMobile }: { isMobile: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signals, setSignals] = useState<SignalData[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const size = isMobile
        ? Math.min(containerWidth, containerHeight, 300)
        : Math.min(containerWidth, containerHeight, 600)
      setCanvasSize({ width: size, height: size })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [isMobile])

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
      for (let i = 0; i < (isMobile ? 2 : 3); i++) {
        dots.push({
          x: factor.x * scaleFactor,
          y: factor.y * scaleFactor,
          factor,
          progress: random(0, 1)
        })
      }
    })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#ffffff0a'
      for (let i = 0; i < canvas.width; i += 20 * scaleFactor) {
        for (let j = 0; j < canvas.height; j += 20 * scaleFactor) {
          ctx.beginPath()
          ctx.arc(i, j, 1 * scaleFactor, 0, Math.PI * 2)
          ctx.fill()
        }
      }

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

        dot.progress += 0.005
        if (dot.progress > 1) dot.progress = 0

        dot.x = dot.factor.x * scaleFactor + (targetX - dot.factor.x * scaleFactor) * dot.progress
        dot.y = dot.factor.y * scaleFactor + (targetY - dot.factor.y * scaleFactor) * dot.progress

        ctx.beginPath()
        ctx.fillStyle = '#007AFF'
        ctx.shadowColor = '#007AFF'
        ctx.shadowBlur = 10 * scaleFactor
        ctx.arc(dot.x, dot.y, 2 * scaleFactor, 0, Math.PI * 2)
        ctx.fill()
      })

      if (Math.random() < 0.02 && signals.length < (isMobile ? 4 : 8)) {
        const signalTypes: SignalData['type'][] = ['buy', 'sell', 'hold', 'analyze']
        const angle = Math.random() * Math.PI * 2
        const radius = random(isMobile ? 50 : 100, isMobile ? 100 : 200) * scaleFactor
        const x = (canvas.width / 2) + Math.cos(angle) * radius
        const y = (canvas.height / 2) + Math.sin(angle) * radius
        setSignals(prev => [...prev, {
          type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
          x,
          y,
          opacity: 1
        }])
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [canvasSize, isMobile])

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => 
        prev
          .map(signal => ({ ...signal, opacity: signal.opacity - (1 / 30) }))
          .filter(signal => signal.opacity > 0)
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full aspect-square ${isMobile ? 'max-w-[300px]' : 'max-w-[600px]'} mx-auto`}>
      <canvas ref={canvasRef} className="w-full h-full rounded-xl" />

      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isMobile ? 'w-1/3' : 'w-1/4'} aspect-square`}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#001a2c] to-[#0A0B0D] p-[2px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <div className={`${isMobile ? 'text-sm' : 'text-lg sm:text-xl md:text-2xl'} font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#007AFF] to-[#00C6FF]`}>
              Alpha<br />Quant
            </div>
          </div>
        </div>
      </div>

      {alphaFactors.map((factor) => {
        const scaleFactor = canvasSize.width / 600
        const x = factor.x * scaleFactor
        const y = factor.y * scaleFactor
        return (
          <div 
            key={factor.name} 
            className={`absolute ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs md:text-sm'} text-white transform -translate-x-1/2 -translate-y-1/2`}
            style={{ left: x, top: y }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 border border-white/20 whitespace-nowrap">
              {factor.name}
            </div>
          </div>
        )
      })}

      <AnimatePresence>
        {signals.map((signal, index) => (
          <motion.div
            
            key={index}
            className={`absolute px-1.5 py-0.5 sm:px-2 sm:py-1 rounded ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs md:text-sm'} font-medium ${
              signal.type === 'buy' ? 'bg-[#00C853]/20 text-[#00C853]' :
              signal.type === 'sell' ? 'bg-[#FF3B30]/20 text-[#FF3B30]' :
              signal.type === 'hold' ? 'bg-[#007AFF]/20 text-[#007AFF]' :
              'bg-[#FFD60A]/20 text-[#FFD60A]'
            }`}
            style={{
              left: signal.x,
              top: signal.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            {signal.type.toUpperCase()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="h-screen w-screen bg-[#0A0B0D] bg-opacity-95 text-white overflow-hidden relative p-2 sm:p-4" 
         style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E')" }}>
      <ParticleBackground />
      <div className="h-full w-full flex flex-col backdrop-blur-sm rounded-2xl border border-[#0A1929]" 
           style={{ boxShadow: '0 0 20px rgba(0, 122, 255, 0.2)', background: 'linear-gradient(to bottom, rgba(10, 25, 41, 0.8), rgba(10, 11, 13, 0.9))' }}>
        <div className="pt-2 sm:pt-4 rounded-t-2xl bg-[#0A1929]/80 backdrop-blur-md" style={{ boxShadow: '0 0 20px rgba(0, 122, 255, 0.2)' }}>
          <nav className="container mx-auto px-3 sm:px-4">
            <div className="h-12 sm:h-16 flex items-center justify-between">
              <div className="flex items-center space-x-4 sm:space-x-8">
                <div className="text-lg sm:text-xl font-bold">AlphaQuant</div>
                <div className="hidden md:flex space-x-4 lg:space-x-6">
                  <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">Platform</Link>
                  <Link href="#" className="text-sm  text-white/70 hover:text-white transition-colors">Signals</Link>
                  <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">Documentation</Link>
                  <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">Community</Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                  <div className="flex items-center space-x-2">
                    <Signal className="h-4 w-4 text-[#007AFF]" />
                    <span className="text-sm">2.4K</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-[#00C853]" />
                    <span className="text-sm">76%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-[#FFD60A]" />
                    <span className="text-sm">15.2K</span>
                  </div>
                </div>
                <Button className="hidden md:flex h-9 px-4 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Launch Platform
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </nav>
        </div>

        <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 flex items-center">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="space-y-4 sm:space-y-6">
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                QUANTITATIVE
                <br />
                ALPHA SIGNALS_
              </motion.h1>
              <motion.p 
                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Professional-grade trading signals powered by machine learning and on-chain analytics
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="text-[#007AFF] text-base sm:text-lg md:text-xl lg:text-2xl font-bold">24.5%</div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/50">Monthly Return</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="text-[#00C853] text-base sm:text-lg md:text-xl lg:text-2xl font-bold">76%</div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/50">Win Rate</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="text-[#FFD60A] text-base sm:text-lg md:text-xl lg:text-2xl font-bold">2.4K</div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/50">Active Signals</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button className="h-8 sm:h-10 md:h-12 px-4 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base lg:text-lg bg-gradient-to-r from-[#003366] to-[#0066CC] hover:from-[#002244] hover:to-[#004499] text-white border-none rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] hover:brightness-110">
                  Start Trading
                  <ArrowUpRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </Button>
              </motion.div>
            </div>
            <div className="w-full">
              <SignalFlowVisualization isMobile={isMobile} />
            </div>
          </div>
        </main>

        <AIAgent />
      </div>
    </div>
  )
}