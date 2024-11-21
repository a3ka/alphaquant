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

    // Обновляем рыночные данные
    await marketService.updateCryptoMetadata()
    
    // Получаем все активные портфели
    const portfolios = await portfolioService.getAllActivePortfolios()
    
    const now = new Date()
    const currentMinute = now.getMinutes()
    const currentHour = now.getHours()

    for (const portfolio of portfolios) {
      try {
        // Получаем текущую стоимость портфеля
        const totalValue = await portfolioService.updatePortfolioData(portfolio.id)
        
        // Сохраняем данные для разных периодов
        const periodsToUpdate = []

        // 15-минутные данные
        if (currentMinute % 15 === 0) {
          periodsToUpdate.push(Period.MINUTE_15)
        }

        // Часовые данные
        if (currentMinute === 0) {
          periodsToUpdate.push(Period.HOUR_1)
        }

        // 4-часовые данные
        if (currentMinute === 0 && currentHour % 4 === 0) {
          periodsToUpdate.push(Period.HOUR_4)
        }

        // Дневные данные
        if (currentMinute === 0 && currentHour === 0) {
          periodsToUpdate.push(Period.HOUR_24)
        }

        // Сохраняем историю для каждого периода
        for (const period of periodsToUpdate) {
          await portfolioService.savePortfolioHistory({
            portfolioId: portfolio.id,
            totalValue,
            period
          })
        }

      } catch (error) {
        console.error(`Failed to update portfolio ${portfolio.id}:`, error)
        continue
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio values updated successfully',
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