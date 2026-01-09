export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Buscar dados do usuário atual
export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição interna do middleware
    const isInternalRequest = request.headers.get('x-internal-request') === 'true'
    const internalAuthId = request.headers.get('x-auth-id')

    let authId: string | null = null

    if (isInternalRequest && internalAuthId) {
      // Requisição interna do middleware - usar authId do header
      authId = internalAuthId
    } else {
      // Requisição normal - verificar sessão
      const supabase = await createServerComponentClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }

      authId = session.user.id
    }

    if (!authId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            plano: true,
            trialExpira: true,
            assinaturaAtiva: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        avatarUrl: user.avatarUrl,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
