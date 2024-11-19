import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { portfolioService } from '@/src/services/portfolio'

export async function GET(request: NextRequest) {
  console.log('Starting cleanup cron job:', new Date().toISOString());
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('Unauthorized cleanup attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await portfolioService.cleanupOldHistory()
    return NextResponse.json({ 
      success: true,
      message: 'Portfolio history cleanup completed'
    })
  } catch (error: any) {
    console.error('Cleanup job failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}