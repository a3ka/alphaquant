import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/user-profile"
import { 
  ArrowUpRight, 
  Users, 
  Percent, 
  Signal, 
  Menu
} from 'lucide-react'
import { useUser } from "@clerk/nextjs"

export default function Navbar() {
  const { user } = useUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0B0D]/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
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
            <div className="flex items-center space-x-4">
              {user && <UserProfile />}
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}