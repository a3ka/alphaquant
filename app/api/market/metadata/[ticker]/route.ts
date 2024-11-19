import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/src/services/market';

export async function GET(
  request: NextRequest,
  context: { params: { ticker: string } } // Используем контекст с параметрами.
) {
  try {
    const { params } = context; // Извлечение `params` из `context`.
    const metadata = await marketService.getCoinMetadata(params.ticker);
    return NextResponse.json(metadata);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
