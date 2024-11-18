import { user } from '@prisma/client'

export interface User extends user {}

export interface UserCreateProps {
  email: string
  first_name?: string
  last_name?: string
  profile_image_url?: string
  user_id: string
}

export interface UserUpdateProps {
  first_name?: string
  last_name?: string
  gender?: string
  profile_image_url?: string
}

export interface UserWithPortfolios extends User {
  portfolios: {
    id: number
    name: string
    type: string
    description?: string
    is_active: boolean
    created_time: Date
  }[]
}