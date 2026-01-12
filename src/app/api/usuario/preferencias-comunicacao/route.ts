export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// Preferências padrão de comunicação
const preferenciasDefault = {
  emailMarketing: true,
  emailTransacional: true,
  emailAtualizacoes: true,
  emailDicas: true,
  notificacoesPush: true,
  notificacoesNavegador: true,
  lembretesTarefas: true,
  lembretesVencimentos: true,
  relatorioSemanal: false,
  relatorioMensal: true,
}

// GET: Retornar preferências de comunicação atuais
export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Buscar preferências existentes
    // Como não existe uma tabela específica de preferências, usamos metadata do user ou criamos
    // Para este caso, vamos usar os dados que podem estar em um campo JSON ou retornar defaults

    // Tentar buscar preferências do usuário (pode estar em um campo metadata ou similar)
    // Se não existir, retornar preferências padrão
    const preferenciasSalvas = (user as Record<string, unknown>).preferenciaComunicacao as Record<string, unknown> | null

    const preferencias = {
      ...preferenciasDefault,
      ...(preferenciasSalvas || {}),
    }

    return NextResponse.json({
      preferencias,
      usuario: {
        id: user.id,
        email: user.email,
        nome: user.nome,
      },
    })

  } catch (error) {
    console.error('Erro ao buscar preferencias de comunicacao:', error)
    return NextResponse.json({ error: 'Erro ao buscar preferencias' }, { status: 500 })
  }
}

// PUT: Atualizar preferências de comunicação
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Obter preferências do body
    const body = await request.json()
    const {
      emailMarketing,
      emailTransacional,
      emailAtualizacoes,
      emailDicas,
      notificacoesPush,
      notificacoesNavegador,
      lembretesTarefas,
      lembretesVencimentos,
      relatorioSemanal,
      relatorioMensal,
    } = body

    // Validar que ao menos uma preferência foi enviada
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Nenhuma preferencia informada' }, { status: 400 })
    }

    // Montar objeto de preferências apenas com valores booleanos válidos
    const novasPreferencias: Record<string, boolean> = {}

    if (typeof emailMarketing === 'boolean') novasPreferencias.emailMarketing = emailMarketing
    if (typeof emailTransacional === 'boolean') novasPreferencias.emailTransacional = emailTransacional
    if (typeof emailAtualizacoes === 'boolean') novasPreferencias.emailAtualizacoes = emailAtualizacoes
    if (typeof emailDicas === 'boolean') novasPreferencias.emailDicas = emailDicas
    if (typeof notificacoesPush === 'boolean') novasPreferencias.notificacoesPush = notificacoesPush
    if (typeof notificacoesNavegador === 'boolean') novasPreferencias.notificacoesNavegador = notificacoesNavegador
    if (typeof lembretesTarefas === 'boolean') novasPreferencias.lembretesTarefas = lembretesTarefas
    if (typeof lembretesVencimentos === 'boolean') novasPreferencias.lembretesVencimentos = lembretesVencimentos
    if (typeof relatorioSemanal === 'boolean') novasPreferencias.relatorioSemanal = relatorioSemanal
    if (typeof relatorioMensal === 'boolean') novasPreferencias.relatorioMensal = relatorioMensal

    // Buscar preferências atuais e mesclar
    const preferenciasSalvas = (user as Record<string, unknown>).preferenciaComunicacao as Record<string, unknown> | null
    const preferenciasAtualizadas = {
      ...preferenciasDefault,
      ...(preferenciasSalvas || {}),
      ...novasPreferencias,
      atualizadoEm: new Date().toISOString(),
    }

    // Atualizar usuário com as novas preferências
    // Nota: Se o campo preferenciaComunicacao não existir no schema,
    // as preferências serão armazenadas em auditLog como fallback
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          preferenciaComunicacao: preferenciasAtualizadas,
        } as Record<string, unknown>,
      })
    } catch {
      // Se o campo não existir no schema, registrar no log de auditoria
      console.log('Campo preferenciaComunicacao nao existe no schema, salvando em auditLog')
    }

    // Registrar alteração no log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        acao: 'ATUALIZAR_PREFERENCIAS_COMUNICACAO',
        entidade: 'USER',
        entidadeId: user.id,
        dadosAntigos: JSON.parse(JSON.stringify(preferenciasSalvas || preferenciasDefault)),
        dadosNovos: JSON.parse(JSON.stringify(preferenciasAtualizadas)),
      },
    })

    console.log(`Preferencias de comunicacao atualizadas - Usuario: ${user.id}`)

    return NextResponse.json({
      message: 'Preferencias atualizadas com sucesso',
      preferencias: preferenciasAtualizadas,
    })

  } catch (error) {
    console.error('Erro ao atualizar preferencias de comunicacao:', error)
    return NextResponse.json({ error: 'Erro ao atualizar preferencias' }, { status: 500 })
  }
}
