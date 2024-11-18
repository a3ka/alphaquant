import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'

export async function GET(request: NextRequest) {
  try {
    await portfolioService.cleanupOldHistory()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cleanup job failed:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}