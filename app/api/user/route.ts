import { NextResponse } from 'next/server'
import { userService } from '@/src/services/user'

export async function POST(req: Request) {
  try {
    const userData = await req.json()
    const user = await userService.createUser(userData)
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}