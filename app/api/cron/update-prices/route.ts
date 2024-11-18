import { NextResponse } from 'next/server'
import { marketService } from '@/src/services/market'
import { portfolioService } from '@/src/services/portfolio'
import { Period } from '@/src/types/portfolio.types'

export async function GET() {
  try {
    // Обновляем рыночные данные
    await marketService.updateCryptoMetadata()
    
    // Получаем все активные портфели и обновляем их историю
    const portfolios = await portfolioService.getAllActivePortfolios()
    
    for (const portfolio of portfolios) {
      const { balances, isEmpty } = await portfolioService.getPortfolioBalances(portfolio.id.toString())
      
      if (!isEmpty) {
        let totalValue = 0
        for (const balance of balances) {
          const currentPrice = await marketService.getCurrentPrice(balance.coin_ticker)
          totalValue += balance.amount * currentPrice
        }

        const currentMinute = new Date().getMinutes()
        
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
        if (currentMinute === 0 && new Date().getHours() % 4 === 0) {
          await portfolioService.savePortfolioHistory({
            portfolioId: portfolio.id,
            totalValue,
            period: Period.HOUR_4
          })
        }
        
        // Сохраняем дневные данные
        if (currentMinute === 0 && new Date().getHours() === 0) {
          await portfolioService.savePortfolioHistory({
            portfolioId: portfolio.id,
            totalValue,
            period: Period.HOUR_24
          })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}