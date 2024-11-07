import Provider from '@/app/provider'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AuthWrapper from '@/components/wrapper/auth-wrapper'
import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://alphaquant.io"),
  title: {
    default: 'AlphaQuant'
  },
  description: 'AlpaQuant',
  openGraph: {
    description: 'AlpaQuant',
    images: ['https://utfs.io/f/QMCNpWnR0ZDVII5ZKGqqUmdH9Ir1e4Dzj2WgfkLZoF8pCa5y'],
    url: 'https://alphaquant.io'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlpaQuant',
    description: 'AlpaQuant',
    siteId: "",
    creator: "@aka",
    creatorId: "",
    images: ['https://utfs.io/f/QMCNpWnR0ZDVII5ZKGqqUmdH9Ir1e4Dzj2WgfkLZoF8pCa5y'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="preload"
            href="https://utfs.io/f/QMCNpWnR0ZDVII5ZKGqqUmdH9Ir1e4Dzj2WgfkLZoF8pCa5y"
            as="image"
          />
          <link
            rel="preload"
            href="https://utfs.io/f/QMCNpWnR0ZDVII5ZKGqqUmdH9Ir1e4Dzj2WgfkLZoF8pCa5y"
            as="image"
          />
        </head>
        <body className={GeistSans.className}>
          <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </Provider>
          <Analytics />
        </body>
      </html>
    </AuthWrapper>
  )
}