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
    
    // Получаем все портфели и разбиваем их на группы по 2
    const portfolios = await portfolioService.getAllActivePortfolios()
    const batchSize = 2
    const portfolioBatches = []
    
    for (let i = 0; i < portfolios.length; i += batchSize) {
      portfolioBatches.push(portfolios.slice(i, i + batchSize))
    }

    console.log(`Found ${portfolios.length} active portfolios, split into ${portfolioBatches.length} batches`)
    
    // Обрабатываем только первую группу портфелей
    const currentBatch = portfolioBatches[0]
    const now = new Date()
    
    const results = await Promise.all(
      currentBatch.map(async (portfolio) => {
        try {
          const totalValue = await portfolioService.updatePortfolioData(portfolio.id)
          const periodsToUpdate = portfolioService.getPeriodsToUpdate(now.getMinutes(), now.getHours())
          
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

    // Запускаем следующий крон для обработки следующей группы
    if (portfolioBatches.length > 1) {
      const nextBatchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/update-prices?batch=1`
      fetch(nextBatchUrl, {
        headers: { 'Authorization': expectedAuth }
      }).catch(console.error)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio batch updated successfully',
      stats: {
        totalPortfolios: portfolios.length,
        currentBatchSize: currentBatch.length,
        remainingBatches: portfolioBatches.length - 1,
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