import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting cron job...')
    
    await marketService.updateCryptoMetadata()
    console.log('Market data updated')
    
    const portfolios = await portfolioService.getAllActivePortfolios()
    console.log(`Found ${portfolios.length} active portfolios`)
    
    const now = new Date()
    const currentMinute = now.getMinutes()
    const currentHour = now.getHours()
    
    let updatedCount = 0
    let historyCount = 0

    for (const portfolio of portfolios) {
      try {
        const totalValue = await portfolioService.updatePortfolioData(portfolio.id)
        const periodsToUpdate = portfolioService.getPeriodsToUpdate(currentMinute, currentHour)
        updatedCount++

        for (const period of periodsToUpdate) {
          await portfolioService.savePortfolioHistory({
            portfolioId: portfolio.id,
            totalValue,
            period
          })
          historyCount++
        }
      } catch (error) {
        console.error(`Failed to update portfolio ${portfolio.id}:`, error)
        continue
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio values updated successfully',
      stats: {
        totalPortfolios: portfolios.length,
        updatedPortfolios: updatedCount,
        savedHistoryRecords: historyCount
      }
    })
  } catch (error: any) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}