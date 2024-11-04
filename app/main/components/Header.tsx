import { Bell, Globe, Settings, TrendingUp, User, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-[#0A1929]/80 backdrop-blur-md shadow-[0_4px_12px_rgba(11,132,212,0.15)]">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-white">AlphaQuant</h1>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost">Portfolio</Button>
              <Button variant="ghost">Signals</Button>
              <Button variant="ghost">Strategies</Button>
              <Button variant="ghost">Oracle</Button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <span>2.4K Signals</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>76% Win Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-yellow-400" />
                <span>15.2K Users</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}