export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// POST - Vincular authId do Supabase ao usuario do Prisma
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Sessao nao encontrada. Faca login novamente.' },
        { status: 401 }
      )
    }

    const supabaseUserId = session.user.id
    const supabaseEmail = session.user.email

    if (!supabaseEmail) {
      return NextResponse.json(
        { error: 'Email nao encontrado na sessao.' },
        { status: 400 }
      )
    }

    // 1. Verificar se ja existe usuario com esse authId (ja vinculado)
    const usuarioJaVinculado = await prisma.user.findUnique({
      where: { authId: supabaseUserId },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            email: true,
          },
        },
      },
    })

    if (usuarioJaVinculado) {
      // Usuario ja esta vinculado, retornar dados
      return NextResponse.json({
        status: 'already_linked',
        message: 'Usuario ja vinculado.',
        user: {
          id: usuarioJaVinculado.id,
          nome: usuarioJaVinculado.nome,
          email: usuarioJaVinculado.email,
          perfil: usuarioJaVinculado.perfil,
          avatarUrl: usuarioJaVinculado.avatarUrl,
          tenantId: usuarioJaVinculado.tenantId,
          tenant: usuarioJaVinculado.tenant,
        },
      })
    }

    // 2. Buscar usuario pelo email (pode existir sem authId)
    const usuarioPorEmail = await prisma.user.findUnique({
      where: { email: supabaseEmail },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            email: true,
          },
        },
      },
    })

    if (usuarioPorEmail) {
      // Usuario existe mas nao tem authId, vincular
      const usuarioAtualizado = await prisma.user.update({
        where: { id: usuarioPorEmail.id },
        data: {
          authId: supabaseUserId,
          primeiroAcesso: false,
          ultimoAcesso: new Date(),
        },
        include: {
          tenant: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({
        status: 'linked',
        message: 'Usuario vinculado com sucesso.',
        user: {
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          email: usuarioAtualizado.email,
          perfil: usuarioAtualizado.perfil,
          avatarUrl: usuarioAtualizado.avatarUrl,
          tenantId: usuarioAtualizado.tenantId,
          tenant: usuarioAtualizado.tenant,
        },
      })
    }

    // 3. Usuario nao existe - criar novo tenant e usuario (primeiro acesso ao sistema)
    const nomeUsuario = session.user.user_metadata?.name ||
      session.user.user_metadata?.full_name ||
      supabaseEmail.split('@')[0]

    // Criar tenant padrao para o novo usuario
    const novoTenant = await prisma.tenant.create({
      data: {
        nome: `Empresa de ${nomeUsuario}`,
        email: supabaseEmail,
        ativo: true,
        configuracoes: {
          criadoViaAutoRegistro: true,
          dataRegistro: new Date().toISOString(),
        },
      },
    })

    // Criar usuario com perfil GESTOR (primeiro usuario do tenant)
    const novoUsuario = await prisma.user.create({
      data: {
        tenantId: novoTenant.id,
        authId: supabaseUserId,
        email: supabaseEmail,
        nome: nomeUsuario,
        perfil: 'GESTOR',
        ativo: true,
        primeiroAcesso: true,
        ultimoAcesso: new Date(),
      },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      status: 'created',
      message: 'Usuario e empresa criados com sucesso.',
      user: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        avatarUrl: novoUsuario.avatarUrl,
        tenantId: novoUsuario.tenantId,
        tenant: novoUsuario.tenant,
        primeiroAcesso: novoUsuario.primeiroAcesso,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao vincular usuario:', error)
    return NextResponse.json(
      { error: 'Erro ao vincular usuario. Tente novamente.' },
      { status: 500 }
    )
  }
}

// GET - Verificar status de vinculacao do usuario atual
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Sessao nao encontrada.' },
        { status: 401 }
      )
    }

    const supabaseUserId = session.user.id
    const supabaseEmail = session.user.email

    // Verificar se usuario esta vinculado
    const usuario = await prisma.user.findUnique({
      where: { authId: supabaseUserId },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    if (usuario) {
      return NextResponse.json({
        vinculado: true,
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          tenantId: usuario.tenantId,
          tenant: usuario.tenant,
        },
      })
    }

    // Verificar se existe usuario com mesmo email (pendente de vinculacao)
    const usuarioPendente = await prisma.user.findUnique({
      where: { email: supabaseEmail! },
    })

    return NextResponse.json({
      vinculado: false,
      pendente: !!usuarioPendente,
      message: usuarioPendente
        ? 'Usuario encontrado, aguardando vinculacao.'
        : 'Nenhum usuario encontrado. Sera criado no primeiro acesso.',
    })

  } catch (error) {
    console.error('Erro ao verificar vinculacao:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar vinculacao.' },
      { status: 500 }
    )
  }
}
