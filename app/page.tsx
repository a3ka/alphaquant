'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ArrowUpRight, 
  Users, 
  Percent, 
  Signal, 
  Menu,
  Shield,
  LineChart,
  Wallet,
  ArrowRight,
  Check
} from 'lucide-react'
import config from "@/config";
import Pricing from "@/components/homepage/pricing";


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

      // Generate new signals
      if (Math.random() < 0.01 && signals.length < 10) { // Reduced frequency and limited to 10 signals
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

      requestAnimationFrame(animate)
    }

    animate()
  }, [canvasSize])

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => 
        prev
          .map(signal => ({ ...signal, opacity: signal.opacity - 0.02 }))
          .filter(signal => signal.opacity > 0)
      )
    }, 30) // Adjusted to make signals disappear after about 1.5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full" style={{ height: canvasSize.height }}>
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Central Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#001a2c] to-[#0A0B0D] p-[2px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#007AFF] to-[#00C6FF]">
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

const features = [
  {
    title: "Crypto Asset Risk Scoring",
    description: "Comprehensive risk and volatility assessment of crypto assets based on historical data and market indicators",
    icon: Shield,
    color: "#5856D6"
  },
  {
    title: "Alpha Factors and Trading Signals",
    description: "Automatic identification of trading opportunities based on technical and on-chain analysis",
    icon: LineChart,
    color: "#007AFF"
  },
  {
    title: "Portfolio Health Analysis",
    description: "Monitoring of diversification, risks, and potential opportunities in your crypto portfolio",
    icon: Wallet,
    color: "#00C853"
  }
]

const howItWorks = [
  {
    title: "Connect",
    description: "Link your exchange accounts via API or manually track your portfolio. Access thousands of alpha ideas powered by real-time AI analysis."
  },
  {
    title: "Analyze",
    description: "Receive a comprehensive analysis of your portfolio with optimization recommendations, leveraging AI-driven insights."
  },
  {
    title: "Monitor",
    description: "Track changes in real-time, receive notifications about important events, and get instant trading signals for timely decision-making."
  }
]

const plans = [
  {
    name: "Free",
    description: "Basic portfolio analysis",
    price: "0",
    features: [
      "Basic risk scoring",
      "Limited set of indicators",
      "Trading history",
      "Email support"
    ]
  },
  {
    name: "Pro",
    description: "Full platform functionality",
    price: "99",
    features: [
      "Advanced risk scoring",
      "All indicators and signals",
      "Portfolio analysis",
      "Priority support"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "API access and custom solutions",
    price: "Custom",
    features: [
      "API access",
      "Custom metrics",
      "Dedicated manager",
      "SLA guarantees"
    ]
  }
]

const partners = [
  { name: "Dragonfly", logo: "/dragonfly-logo.svg" },
  { name: "Binance Labs", logo: "/binance-labs-logo.svg" },
  { name: "Bybit", logo: "/bybit-logo.svg" },
  { name: "OKX Ventures", logo: "/okx-ventures-logo.svg" },
  { name: "Deribit", logo: "/deribit-logo.svg" },
  { name: "Fidelity", logo: "/fidelity-logo.svg" },
  { name: "Franklin Templeton", logo: "/franklin-templeton-logo.svg" },
  { name: "Wintermute", logo: "/wintermute-logo.svg" }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] bg-opacity-95 text-white overflow-hidden" 
         style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E')" }}>
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold  leading-tight"
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

      {/* Features Section */}
      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Advantages</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Comprehensive solution for crypto asset analysis and management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                       style={{ backgroundColor: `${feature.color}20` }}>
                    <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Simple process to start working with the platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                    {index + 1}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="flex-1 h-px bg-blue-500/20 mx-4">
                      <ArrowRight className="text-blue-500 absolute top-3 right-0" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Real-time Market Insights</h3>
              <p className="text-white/70 mb-4">Our AI-powered platform continuously analyzes market data, providing you with up-to-the-minute insights and trading opportunities.</p>
              <Image
                src="/placeholder.svg?height=300&width=500&text=Real-time+Market+Dashboard"
                alt="Real-time Market Insights Dashboard"
                width={500}
                height={300}
                className="rounded-lg"
              />
            </div>
            <div className="bg-white/5 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">AI-Driven Signal Generation</h3>
              <p className="text-white/70 mb-4">Experience the power of our advanced AI algorithms that generate high-quality trading signals based on multiple data sources and market factors.</p>
              <Image
                src="/placeholder.svg?height=300&width=500&text=AI+Signal+Generation+Visualization"
                alt="AI-Driven Signal Generation Visualization"
                width={500}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {(config.auth.enabled && config.payments.enabled) && (
        <Pricing />
      )}
      
      

      {/* Partners Section */}
      <section className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-8 text-center">Trusted By</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={120}
                  height={40}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}