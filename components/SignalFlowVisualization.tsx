'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function SignalFlowVisualization({ isMobile }: { isMobile: boolean }) {
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
        const angle = Math.random() 
 * Math.PI * 2
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