'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight } from 'lucide-react'
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { UserProfile } from '@/components/user-profile'
import ParticleBackground from '@/components/ParticleBackground'
import SignalFlowVisualization from '@/components/SignalFlowVisualization'
import Navbar from '@/components/Navbar'

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
    <div className="h-screen w-screen bg-[#0A0B0D] bg-opacity-95 text-white overflow-hidden relative">
      <ParticleBackground>
        <div className="flex flex-col h-full">
          <Navbar />
          <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 flex items-center">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              <LandingPageContent />
              <div className="w-full">
                <SignalFlowVisualization isMobile={isMobile} />
              </div>
            </div>
          </main>
        </div>
      </ParticleBackground>
    </div>
  )
}

function LandingPageContent() {
  const { user } = useUser();
  const router = useRouter();

  return (
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
        <StatCard title="Monthly Return" value="24.5%" color="#007AFF" />
        <StatCard title="Win Rate" value="76%" color="#00C853" />
        <StatCard title="Active Signals" value="2.4K" color="#FFD60A" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button 
          onClick={() => {
            if (user?.id) {
              router.push("/main")
            } else {
              router.push("/sign-in")
            }
          }}
          className="h-8 sm:h-10 md:h-12 px-4 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base lg:text-lg bg-gradient-to-r from-[#003366] to-[#0066CC] hover:from-[#002244] hover:to-[#004499] text-white border-none rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] hover:brightness-110"
        >
          Activate Alpha
          <ArrowUpRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </Button>
      </motion.div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div style={{ color }} className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">{value}</div>
        <div className="text-[10px] sm:text-xs md:text-sm text-white/50">{title}</div>
      </CardContent>
    </Card>
  )
}