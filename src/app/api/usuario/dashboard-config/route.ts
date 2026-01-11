export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

interface DashboardConfig {
  widgets: string[]
  layout: {
    id: string
    x: number
    y: number
    w: number
    h: number
  }[]
}

// GET: Retornar configuração salva do usuário
export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nao autorizado' },
        { status: 401 }
      )
    }

    const usuario = await prisma.user.findUnique({
      where: { authId: session.user.id },
      select: {
        dashboardConfig: true,
      },
    })

    if (!usuario?.dashboardConfig) {
      // Retorna configuração padrão
      const configPadrao: DashboardConfig = {
        widgets: [
          'insights-ia',
          'indicadores-financeiros',
          'grafico-receitas-despesas',
          'atividades-equipe',
          'objetivos-okr',
          'projeto-consultoria',
        ],
        layout: [
          { id: 'insights-ia', x: 0, y: 0, w: 2, h: 1 },
          { id: 'indicadores-financeiros', x: 0, y: 1, w: 2, h: 1 },
          { id: 'grafico-receitas-despesas', x: 0, y: 2, w: 2, h: 1 },
          { id: 'atividades-equipe', x: 0, y: 3, w: 2, h: 1 },
          { id: 'objetivos-okr', x: 0, y: 4, w: 1, h: 1 },
          { id: 'projeto-consultoria', x: 1, y: 4, w: 1, h: 1 },
        ],
      }
      return NextResponse.json(configPadrao)
    }

    // Parse the stored config
    const config = typeof usuario.dashboardConfig === 'string'
      ? JSON.parse(usuario.dashboardConfig)
      : usuario.dashboardConfig

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao buscar configuracao do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST: Salvar nova configuração
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nao autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { widgets, layout } = body as DashboardConfig

    // Validação básica
    if (!widgets || !Array.isArray(widgets)) {
      return NextResponse.json(
        { error: 'Widgets invalidos' },
        { status: 400 }
      )
    }

    if (!layout || !Array.isArray(layout)) {
      return NextResponse.json(
        { error: 'Layout invalido' },
        { status: 400 }
      )
    }

    const config: DashboardConfig = {
      widgets,
      layout,
    }

    await prisma.user.update({
      where: { authId: session.user.id },
      data: {
        dashboardConfig: JSON.stringify(config),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Configuracao salva com sucesso',
      config,
    })
  } catch (error) {
    console.error('Erro ao salvar configuracao do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
