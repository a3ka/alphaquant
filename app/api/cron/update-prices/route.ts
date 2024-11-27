import { NextRequest, NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('=== Starting update-prices cron job ===', {
    time: new Date().toISOString(),
    url: request.url,
    headers: Object.fromEntries(request.headers)
  })
  
  try {
    const authHeader = request.headers.get('Authorization')
    const tokenParam = request.nextUrl.searchParams.get('token')
    const expectedToken = process.env.CRON_SECRET

    if (authHeader !== `Bearer ${expectedToken}` && tokenParam !== expectedToken) {
      console.log('Auth failed:', { 
        authHeader,
        tokenParam,
        expectedToken: `Bearer ${expectedToken}`
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Auth check:', {
      authHeader,
      tokenParam,
      expectedToken: process.env.CRON_SECRET
    })

    // Обновляем метаданные в начале
    try {
      await marketService.updateCryptoMetadata()
    } catch (error) {
      console.error('Failed to update crypto metadata:', error)
    }

    const batchNumber = parseInt(request.nextUrl.searchParams.get('batch') || '0')
    const previousTime = parseInt(request.nextUrl.searchParams.get('prevTime') || '0')
    
    const portfolios = await portfolioService.getAllActivePortfolios()
    const batchSize = portfolioService.calculateBatchSize(portfolios.length, previousTime)
    
    const portfolioBatches = []
    for (let i = 0; i < portfolios.length; i += batchSize) {
      portfolioBatches.push(portfolios.slice(i, i + batchSize).map(p => p.id))
    }

    if (batchNumber >= portfolioBatches.length) {
      return NextResponse.json({ 
        success: true,
        message: 'All batches processed',
        stats: { totalPortfolios: portfolios.length }
      })
    }

    const now = new Date()
    const force = request.nextUrl.searchParams.get('force')
    const periodsToUpdate = force 
      ? [
          Period.MINUTE_15,
          ...(force === 'hour' ? [Period.HOUR_1] : []),
          ...(force === 'hour4' ? [Period.HOUR_4] : []),
          ...(force === 'hour24' ? [Period.HOUR_24] : [])
        ]
      : portfolioService.getPeriodsToUpdate(now.getMinutes(), now.getHours())

    const result = await portfolioService.processBatch(
      portfolioBatches[batchNumber],
      periodsToUpdate,
      startTime
    )

    // Запускаем следующий батч
    if (batchNumber + 1 < portfolioBatches.length) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
      try {
        const nextBatchSuccess = await portfolioService.triggerNextBatch(
          baseUrl,
          batchNumber,
          result.executionTime || 0,
          process.env.CRON_SECRET!
        )
        console.log('Next batch triggered:', { success: nextBatchSuccess, batchNumber: batchNumber + 1 })
      } catch (error) {
        console.error('Failed to trigger next batch:', error)
      }
    }

    return NextResponse.json({
      success: result.success,
      stats: {
        batchNumber,
        batchSize,
        totalBatches: portfolioBatches.length,
        remainingBatches: portfolioBatches.length - batchNumber - 1,
        ...result
      }
    })

  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: { executionTime: Date.now() - startTime }
      },
      { status: 500 }
    )
  }
}