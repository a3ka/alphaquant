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
    
    const [_, portfolios] = await Promise.all([
      marketService.updateCryptoMetadata(),
      portfolioService.getAllActivePortfolios()
    ])
    
    console.log(`Found ${portfolios.length} active portfolios`)
    
    const now = new Date()
    const currentMinute = now.getMinutes()
    const currentHour = now.getHours()
    
    const results = await Promise.all(
      portfolios.map(async (portfolio) => {
        try {
          const totalValue = await portfolioService.updatePortfolioData(portfolio.id)
          const periodsToUpdate = portfolioService.getPeriodsToUpdate(currentMinute, currentHour)
          
          await Promise.all(
            periodsToUpdate.map(period => 
              portfolioService.savePortfolioHistory({
                portfolioId: portfolio.id,
                totalValue,
                period
              })
            )
          )
          
          return { success: true, historyCount: periodsToUpdate.length }
        } catch (error) {
          console.error(`Failed to update portfolio ${portfolio.id}:`, error)
          return { success: false, historyCount: 0 }
        }
      })
    )

    const stats = results.reduce((acc, result) => ({
      updatedPortfolios: acc.updatedPortfolios + (result.success ? 1 : 0),
      savedHistoryRecords: acc.savedHistoryRecords + result.historyCount
    }), { updatedPortfolios: 0, savedHistoryRecords: 0 })

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio values updated successfully',
      stats: {
        totalPortfolios: portfolios.length,
        ...stats
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