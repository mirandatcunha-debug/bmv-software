export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

// GET - Listar usuarios da empresa
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const usuarios = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        // Nao mostrar usuarios ADMIN_BMV e CONSULTOR_BMV para gestores
        ...(user.perfil === 'GESTOR' && {
          perfil: {
            notIn: ['ADMIN_BMV', 'CONSULTOR_BMV'],
          },
        }),
      },
      orderBy: { nome: 'asc' },
    })

    const usuariosFormatados = usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      ativo: u.ativo,
      primeiroAcesso: u.primeiroAcesso,
      ultimoAcesso: u.ultimoAcesso,
      criadoEm: u.criadoEm,
    }))

    return NextResponse.json(usuariosFormatados)
  } catch (error) {
    console.error('Erro ao listar usuarios:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuarios' },
      { status: 500 }
    )
  }
}

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

    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Nome e email sao obrigatorios' },
        { status: 400 }
      )
    }

    // Verificar se email ja existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ja cadastrado no sistema' },
        { status: 400 }
      )
    }

    // Validar perfil
    const perfisValidos = ['GESTOR', 'COLABORADOR', 'CLIENTE']
    const perfilFinal = perfil && perfisValidos.includes(perfil) ? perfil : 'COLABORADOR'

    // Gestor nao pode criar ADMIN_BMV ou CONSULTOR_BMV
    if (currentUser.perfil === 'GESTOR' && ['ADMIN_BMV', 'CONSULTOR_BMV'].includes(perfilFinal)) {
      return NextResponse.json(
        { error: 'Sem permissao para criar este perfil' },
        { status: 403 }
      )
    }

    // Gerar token de convite
    const tokenConvite = randomBytes(32).toString('hex')
    const tokenExpira = new Date()
    tokenExpira.setDate(tokenExpira.getDate() + 7) // Expira em 7 dias

    const novoUsuario = await prisma.user.create({
      data: {
        tenantId: currentUser.tenantId,
        nome,
        email,
        perfil: perfilFinal,
        tokenConvite,
        tokenExpira,
        ativo: true,
        primeiroAcesso: true,
      },
    })

    return NextResponse.json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      perfil: novoUsuario.perfil,
      tokenConvite: novoUsuario.tokenConvite,
      tokenExpira: novoUsuario.tokenExpira,
      criadoEm: novoUsuario.criadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao convidar usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao convidar usuario' },
      { status: 500 }
    )
  }
}
