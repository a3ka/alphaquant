'use client'

import { useState, useEffect } from 'react'

export default function AsciiCharacter() {
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