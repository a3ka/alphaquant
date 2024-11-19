import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/src/services/market';

export async function GET(request: NextRequest, context: { params: { ticker: string } }) {
  try {
    // Дожидаемся `params`, если они асинхронны
    const { ticker } = await context.params;

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      );
    }

    // Получаем данные из базы
    const metadata = await marketService.getCoinMetadata(ticker);

    if (!metadata) {
      return NextResponse.json(
        { error: 'No metadata found for the given ticker' },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Используем Node.js Runtime
export const runtime = 'nodejs';