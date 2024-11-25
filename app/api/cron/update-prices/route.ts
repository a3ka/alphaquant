import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('=== Starting update-prices cron job ===')
  
  try {
    const authHeader = request.headers.get('Authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Обновляем метаданные в начале
    try {
      await marketService.updateCryptoMetadata()
    } catch (error) {
      console.error('Failed to update crypto metadata:', error)
      // Продолжаем выполнение даже при ошибке обновления метаданных
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
    console.log('Current time:', now.toISOString())
    
    const force = request.nextUrl.searchParams.get('force')
    const periodsToUpdate = force 
      ? [
          Period.MINUTE_15,
          ...(force === 'hour' ? [Period.HOUR_1] : []),
          ...(force === 'hour4' ? [Period.HOUR_4] : []),
          ...(force === 'hour24' ? [Period.HOUR_24] : [])
        ]
      : portfolioService.getPeriodsToUpdate(now.getMinutes(), now.getHours())
    console.log('Periods to update:', periodsToUpdate)
    
    const results = await Promise.all(
      currentBatch.map(async (portfolio) => {
        try {
          console.log(`Processing portfolio ${portfolio.id}`)
          
          const totalValue = await portfolioService.updatePortfolioData(portfolio.id)
          console.log(`Portfolio ${portfolio.id} total value:`, totalValue)
          
          await Promise.all([
            portfolioService.deleteCurrentValue(portfolio.id),
            ...periodsToUpdate.map(async period => {
              await portfolioService.savePortfolioHistory({
                portfolioId: portfolio.id,
                totalValue,
                period
              })
            })
          ])

          // Возвращаем результат с количеством сохраненных записей
          return { 
            success: true, 
            historyCount: periodsToUpdate.length 
          }
        } catch (error) {
          console.error(`Failed to update portfolio ${portfolio.id}:`, error)
          return { success: false, historyCount: 0 }
        }
      })
    )

    const executionTime = Date.now() - startTime
    console.log('=== Cron job completed ===')
    console.log('Execution time:', executionTime, 'ms')
    console.log('Results:', JSON.stringify(results, null, 2))

    const stats = results.reduce((acc, result) => ({
      updatedPortfolios: acc.updatedPortfolios + (result.success ? 1 : 0),
      savedHistoryRecords: acc.savedHistoryRecords + result.historyCount
    }), { updatedPortfolios: 0, savedHistoryRecords: 0 })

    // Запускаем следующую группу
    if (batchNumber + 1 < portfolioBatches.length) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
      const nextBatchUrl = `${baseUrl}/api/cron/update-prices?batch=${batchNumber + 1}`
      console.log(`Triggering next batch: ${nextBatchUrl}`)
      
      // Используем абсолютный URL и добавляем метод
      await fetch(nextBatchUrl, {
        method: 'GET',
        headers: { 
          'Authorization': expectedAuth,
          'Content-Type': 'application/json'
        }
      })
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