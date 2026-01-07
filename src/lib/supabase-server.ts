import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente Supabase para Server Components e API Routes
export async function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O método `setAll` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver middleware atualizando
            // as sessões do usuário.
          }
        },
      },
    }
  )
}

// Alias para compatibilidade com imports existentes
export const createServerComponentClient = createSupabaseServerClient
