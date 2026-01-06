import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Obter configuracoes de notificacao do usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
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

    // Buscar ou criar configuracoes de notificacao
    let config = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    })

    if (!config) {
      // Criar configuracoes padrao
      config = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          emailTarefaAtribuida: true,
          emailPrazoProximo: true,
          emailResumoSemanal: false,
          notificacaoSistema: true,
        },
      })
    }

    return NextResponse.json({
      emailTarefaAtribuida: config.emailTarefaAtribuida,
      emailPrazoProximo: config.emailPrazoProximo,
      emailResumoSemanal: config.emailResumoSemanal,
      notificacaoSistema: config.notificacaoSistema,
    })
  } catch (error) {
    console.error('Erro ao buscar configuracoes de notificacao:', error)
    // Retornar valores padrao em caso de erro (ex: tabela nao existe ainda)
    return NextResponse.json({
      emailTarefaAtribuida: true,
      emailPrazoProximo: true,
      emailResumoSemanal: false,
      notificacaoSistema: true,
    })
  }
}

// PUT - Atualizar configuracoes de notificacao
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
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

    const body = await request.json()
    const {
      emailTarefaAtribuida,
      emailPrazoProximo,
      emailResumoSemanal,
      notificacaoSistema,
    } = body

    // Upsert configuracoes
    const config = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailTarefaAtribuida: emailTarefaAtribuida ?? true,
        emailPrazoProximo: emailPrazoProximo ?? true,
        emailResumoSemanal: emailResumoSemanal ?? false,
        notificacaoSistema: notificacaoSistema ?? true,
      },
      update: {
        emailTarefaAtribuida,
        emailPrazoProximo,
        emailResumoSemanal,
        notificacaoSistema,
      },
    })

    return NextResponse.json({
      emailTarefaAtribuida: config.emailTarefaAtribuida,
      emailPrazoProximo: config.emailPrazoProximo,
      emailResumoSemanal: config.emailResumoSemanal,
      notificacaoSistema: config.notificacaoSistema,
    })
  } catch (error) {
    console.error('Erro ao atualizar configuracoes de notificacao:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configuracoes' },
      { status: 500 }
    )
  }
}
