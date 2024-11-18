import { createServerSupabaseClient } from './supabase/server'
import { portfolioService } from './portfolio'
import type { User, UserCreateProps, UserUpdateProps } from '@/src/types/user.types'

export const userService = {
  async createUser({
    email,
    first_name,
    last_name,
    profile_image_url,
    user_id,
  }: UserCreateProps) {
    console.log('Starting user creation process for:', { user_id, email });
    
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("user")
        .insert([{
          email,
          first_name,
          last_name,
          profile_image_url,
          user_id,
        }])
        .select()
        .single()

      if (error) throw error
      console.log("User creation result:", data);

      console.log('Creating default portfolio for user:', user_id);
      await portfolioService.createPortfolio(
        user_id,
        "Default Portfolio",
        "SPOT",
        "Default portfolio created automatically"
      )
      console.log('Default portfolio created successfully');

      return data as User
    } catch (error: any) {
      console.error('Failed to create user:', error)
      throw new Error(error.message)
    }
  },

  async getUser(userId: string): Promise<User> {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) throw error
      return data as User
    } catch (error: any) {
      console.error('Failed to get user:', error)
      throw new Error(error.message)
    }
  },

  async updateUser(userId: string, updates: UserUpdateProps) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("user")
        .update(updates)
        .eq("user_id", userId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to update user:', error)
      throw new Error(error.message)
    }
  },

  async deleteUser(userId: string) {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { error } = await supabase
        .from("user")
        .delete()
        .eq("user_id", userId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to delete user:', error)
      throw new Error(error.message)
    }
  }
}
