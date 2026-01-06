import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// POST - Reenviar convite para usuario
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(currentUser.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Verificar se usuario pertence ao mesmo tenant
    const targetUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        tenantId: currentUser.tenantId,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Verificar se e primeiro acesso (convite pendente)
    if (!targetUser.primeiroAcesso) {
      return NextResponse.json(
        { message: 'Usuario ja ativou a conta' },
        { status: 400 }
      )
    }

    // Buscar tenant para nome da empresa
    const tenant = await prisma.tenant.findUnique({
      where: { id: currentUser.tenantId },
    })

    // Aqui seria implementado o envio do email de convite
    // Por exemplo, usando um servico de email como Resend, SendGrid, etc.
    // await sendInviteEmail({
    //   to: targetUser.email,
    //   userName: targetUser.nome,
    //   companyName: tenant?.nome,
    //   inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${targetUser.id}`,
    // })

    console.log(`Convite reenviado para: ${targetUser.email}`)

    return NextResponse.json({ message: 'Convite reenviado com sucesso' })
  } catch (error) {
    console.error('Erro ao reenviar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao reenviar convite' },
      { status: 500 }
    )
  }
}
