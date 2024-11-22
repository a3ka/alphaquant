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

    // Получаем номер текущей группы из параметров запроса
    const batchNumber = parseInt(request.nextUrl.searchParams.get('batch') || '0')
    console.log(`Starting cron job for batch ${batchNumber}...`)
    
    const portfolios = await portfolioService.getAllActivePortfolios()
    const batchSize = 2
    const portfolioBatches = []
    
    for (let i = 0; i < portfolios.length; i += batchSize) {
      portfolioBatches.push(portfolios.slice(i, i + batchSize))
    }

    // Проверяем, существует ли запрошенная группа
    if (batchNumber >= portfolioBatches.length) {
      return NextResponse.json({ 
        success: true,
        message: 'All batches processed',
        stats: { totalPortfolios: portfolios.length }
      })
    }

    const currentBatch = portfolioBatches[batchNumber]
    console.log(`Processing batch ${batchNumber} with ${currentBatch.length} portfolios`)
    
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

    // Запускаем следующую группу
    if (batchNumber + 1 < portfolioBatches.length) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
      const nextBatchUrl = `${baseUrl}/api/cron/update-prices?batch=${batchNumber + 1}`
      console.log(`Triggering next batch: ${nextBatchUrl}`)
      fetch(nextBatchUrl, {
        headers: { 'Authorization': expectedAuth }
      }).catch(console.error)
    }

    return NextResponse.json({ 
      success: true,
      message: `Batch ${batchNumber} processed successfully`,
      stats: {
        totalPortfolios: portfolios.length,
        currentBatchSize: currentBatch.length,
        remainingBatches: portfolioBatches.length - batchNumber - 1,
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