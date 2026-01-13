import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getTenantFromSession() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'NOT_AUTHENTICATED', tenant: null, user: null }
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { authId: session.user.id },
        { email: session.user.email }
      ]
    },
    include: { tenant: true }
  })

  if (!user) {
    return { error: 'USER_NOT_FOUND', tenant: null, user: null }
  }

  if (!user.tenant) {
    return { error: 'TENANT_NOT_FOUND', tenant: null, user }
  }

  return { error: null, tenant: user.tenant, user }
}
