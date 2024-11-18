import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from '@/src/types/database.types'

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}