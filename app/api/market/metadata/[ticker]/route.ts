import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/src/services/market';

export async function GET(
  request: NextRequest,
  context: { params: Record<string, string | undefined> }
) {
  try {
    console.log('Context object:', context); // Логирование всего объекта context
    console.log('Raw params object:', context.params); // Логирование params до await

    // Дожидаемся `params`, если они асинхронны
    const { ticker } = await context.params;

    console.log('Resolved params:', context.params); // Логирование params после await
    console.log('Resolved ticker:', ticker); // Логирование значения ticker

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

// Используем Node.js Runtime
export const runtime = 'nodejs';
