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
    // Проверка авторизации
    const authHeader = request.headers.get('Authorization')
    const tokenParam = request.nextUrl.searchParams.get('token')
    const expectedToken = process.env.CRON_SECRET

    if (!expectedToken) {
      console.error('CRON_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const authToken = authHeader?.split(' ')[1]
    if (authToken !== expectedToken && tokenParam !== expectedToken) {
      console.log('Auth failed:', { authToken, tokenParam, expectedToken })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Обновляем метаданные криптовалют
    console.log('Updating crypto metadata...')
    try {
      await marketService.updateCryptoMetadata()
      console.log('Crypto metadata updated successfully')
    } catch (error) {
      console.error('Failed to update crypto metadata:', error)
    }

    // Получаем все активные портфели и обновляем их
    console.log('Fetching all active portfolios...')
    const portfolios = await portfolioService.getAllActivePortfolios()
    console.log(`Fetched ${portfolios.length} active portfolios`)

    const periodsToUpdate = portfolioService.getPeriodsToUpdate(
      new Date().getMinutes(), 
      new Date().getHours()
    )
    console.log('Periods to update:', periodsToUpdate)

    const result = await portfolioService.processPortfoliosInParallel(
      portfolios,
      periodsToUpdate
    )
    console.log('Portfolios processed:', result)

    // Очищаем старые записи
    console.log('Starting cleanup of old history records...')
    try {
      await portfolioService.cleanupOldHistory()
      console.log('Old history records cleaned up successfully')
    } catch (error) {
      console.error('Failed to cleanup old history:', error)
    }

    const executionTime = Date.now() - startTime
    console.log('=== Cron job completed ===', {
      executionTime,
      successRate: `${((result.results.filter(r => r.success).length / portfolios.length) * 100).toFixed(1)}%`,
      periodsUpdated: periodsToUpdate,
      totalPortfolios: portfolios.length
    })

    return NextResponse.json({
      success: result.success,
      stats: {
        totalPortfolios: portfolios.length,
        successfulUpdates: result.results.filter(r => r.success).length,
        failedUpdates: result.results.filter(r => !r.success).length,
        executionTime: result.executionTime,
        periodsUpdated: periodsToUpdate,
        errors: result.results
          .filter(r => !r.success)
          .map(r => `Portfolio ${r.portfolioId}: ${r.error}`)
      }
    })

  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: { executionTime }
      },
      { status: 500 }
    )
  }
}