import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  console.log('Auth check:', {
    received: authHeader,
    expected: expectedAuth,
    isMatch: authHeader === expectedAuth
  })

  if (authHeader !== expectedAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Обновляем рыночные данные
    await marketService.updateCryptoMetadata()
    
    // Получаем все активные портфели и обновляем их историю
    const portfolios = await portfolioService.getAllActivePortfolios()
    
    for (const portfolio of portfolios) {
      try {
        const { balances, isEmpty } = await portfolioService.getPortfolioBalances(portfolio.id.toString())
        
        if (!isEmpty) {
          let totalValue = 0
          for (const balance of balances) {
            const currentPrice = await marketService.getCurrentPrice(balance.coin_ticker)
            totalValue += balance.amount * currentPrice
          }

          const now = new Date()
          const currentMinute = now.getMinutes()
          const currentHour = now.getHours()
          
          // Сохраняем 15-минутные данные
          if (currentMinute % 15 === 0) {
            await portfolioService.savePortfolioHistory({
              portfolioId: portfolio.id,
              totalValue,
              period: Period.MINUTE_15
            })
          }
          
          // Сохраняем часовые данные
          if (currentMinute === 0) {
            await portfolioService.savePortfolioHistory({
              portfolioId: portfolio.id,
              totalValue,
              period: Period.HOUR_1
            })
          }
          
          // Сохраняем 4-часовые данные
          if (currentMinute === 0 && currentHour % 4 === 0) {
            await portfolioService.savePortfolioHistory({
              portfolioId: portfolio.id,
              totalValue,
              period: Period.HOUR_4
            })
          }
          
          // Сохраняем дневные данные
          if (currentMinute === 0 && currentHour === 0) {
            await portfolioService.savePortfolioHistory({
              portfolioId: portfolio.id,
              totalValue,
              period: Period.HOUR_24
            })
          }
        }
      } catch (error) {
        console.error(`Failed to update portfolio ${portfolio.id}:`, error)
        // Продолжаем с следующим портфолио
        continue
      }
    }
    
    console.log(`Successfully updated ${portfolios.length} portfolios`)
    return NextResponse.json({ 
      success: true,
      updatedPortfolios: portfolios.length 
    })
  } catch (error: any) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}