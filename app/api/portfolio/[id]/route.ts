import { NextResponse } from 'next/server'
import { portfolioService } from '@/src/services/portfolio'

export async function PUT(
  request: Request,
  { params }: { params: { id: Promise<string> } }
) {
  const id = await params.id
  
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    await portfolioService.updatePortfolioName(id, name)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id
  
  try {
    await portfolioService.deletePortfolio(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}