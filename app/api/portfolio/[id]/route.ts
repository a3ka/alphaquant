import { NextRequest, NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'

export async function DELETE(
  request: NextRequest,
  context: { params: any }
) {
  try {
    await portfolioService.disablePortfolio(context.params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error disabling portfolio:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}