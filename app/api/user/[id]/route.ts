import { NextResponse } from 'next/server'
import { userService } from '@/src/services/user'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await userService.getUser(params.id)
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await req.json()
    await userService.updateUser(params.id, updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await userService.deleteUser(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}