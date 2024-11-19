import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/src/services/user'

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const user = await userService.getUser(context.params.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error in user route:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const updates = await request.json()
    await userService.updateUser(context.params.id, updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: any }
) {
  try {
    await userService.deleteUser(context.params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}