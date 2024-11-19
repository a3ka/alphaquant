import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/src/services/market';

export async function GET(
  request: NextRequest,
  context: { params: any } // Убираем строгую типизацию для Vercel
) {
  try {
    console.log('Context object:', context); // Логируем объект context
    console.log('Raw params object:', context.params); // Логируем params до await

    const params = await context.params; // Явно ожидаем асинхронное разрешение
    console.log('Resolved params:', params); // Логируем распакованные параметры

    const ticker = params?.ticker;
    console.log('Resolved ticker:', ticker); // Логируем значение ticker

    if (!ticker) {
      console.error('Ticker parameter is missing');
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      );
    }

    // Получаем данные из базы
    const metadata = await marketService.getCoinMetadata(ticker);

    if (!metadata) {
      console.warn(`No metadata found for ticker: ${ticker}`);
      return NextResponse.json(
        { error: 'No metadata found for the given ticker' },
        { status: 404 }
      );
    }

    console.log(`Metadata for ticker ${ticker}:`, metadata);
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Error occurred while fetching metadata:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
