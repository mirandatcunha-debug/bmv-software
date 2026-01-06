import { createServerComponentClient as createSupabaseServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createSupabaseServerClient({
    cookies: () => cookieStore,
  })
}

// Alias para compatibilidade com imports existentes
export const createServerComponentClient = createServerSupabaseClient