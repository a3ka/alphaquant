'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from 'lucide-react'

const AsciiCharacter = () => {
  const [frame, setFrame] = useState(0)
  const frames = [
    `
   /\\_/\\
  ( o.o )
   > ^ <
    `,
    `
   /\\_/\\
  ( ^.^ )
   > ^ <
    `
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length)
    }, 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <pre className="text-xs sm:text-sm md:text-base text-white font-mono cursor-pointer select-none">
      {frames[frame]}
    </pre>
  )
}

const AIChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: "I'm an AI assistant. How can I help you today?" }])
      }, 1000)
      setInput('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat with AI Assistant</DialogTitle>
          <DialogDescription>
            Ask me anything about quantitative trading and alpha signals.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[300px] w-full pr-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'ai' ? 'text-blue-500' : 'text-green-500'}`}>
              <strong>{msg.role === 'ai' ? 'AI: ' : 'You: '}</strong>
              {msg.content}
            </div>
          ))}
        </div>
        <div className="flex items-center mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} className="ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const AIAgent = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  
  return (
    <>
      <div 
        className="absolute left-4 bottom-4 z-10"
        onClick={() => setIsAIChatOpen(true)}
      >
        <AsciiCharacter />
      </div>
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  )
} 