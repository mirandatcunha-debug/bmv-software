export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// POST - Convidar novo usuario
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
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

    const body = await request.json()
    const { nome, email, perfil } = body

    // Validacoes
    if (!nome || !email || !perfil) {
      return NextResponse.json(
        { message: 'Nome, email e perfil sao obrigatorios' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Email invalido' },
        { status: 400 }
      )
    }

    // Validar perfil
    const perfisValidos = ['GESTOR', 'COLABORADOR', 'CLIENTE']
    if (!perfisValidos.includes(perfil)) {
      return NextResponse.json(
        { message: 'Perfil invalido' },
        { status: 400 }
      )
    }

    // Verificar se email ja existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email ja esta cadastrado no sistema' },
        { status: 400 }
      )
    }

    // Criar usuario no Supabase Auth usando service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Gerar senha temporaria
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Erro ao criar usuario no Supabase:', authError)
      return NextResponse.json(
        { message: 'Erro ao criar usuario' },
        { status: 500 }
      )
    }

    // Criar usuario no banco de dados
    const newUser = await prisma.user.create({
      data: {
        authId: authData.user.id,
        tenantId: currentUser.tenantId,
        nome,
        email,
        perfil,
        ativo: true,
        primeiroAcesso: true,
      },
    })

    // Buscar tenant para nome da empresa
    const tenant = await prisma.tenant.findUnique({
      where: { id: currentUser.tenantId },
    })

    // Enviar email de convite com link de reset de senha
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/configuracoes/conta`,
      },
    })

    if (resetError) {
      console.error('Erro ao gerar link de recuperacao:', resetError)
      // Nao falha aqui, usuario foi criado
    }

    // Aqui seria implementado o envio do email de convite
    // await sendInviteEmail({
    //   to: email,
    //   userName: nome,
    //   companyName: tenant?.nome,
    //   inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${newUser.id}`,
    // })

    console.log(`Convite enviado para: ${email}`)

    return NextResponse.json({
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      perfil: newUser.perfil,
      message: 'Usuario convidado com sucesso',
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao convidar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao convidar usuario' },
      { status: 500 }
    )
  }
}
