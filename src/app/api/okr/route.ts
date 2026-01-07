export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar objetivos
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

    const { searchParams } = new URL(request.url)
    const trimestre = searchParams.get('trimestre')
    const ano = searchParams.get('ano')
    const status = searchParams.get('status')

    const where: any = {
      tenantId: user.tenantId,
    }

    if (status && status !== 'TODOS') {
      where.status = status
    }

    // Filtro por periodo (trimestre/ano) seria implementado com datas
    // Por enquanto, busca todos os objetivos do tenant

    const objetivos = await prisma.objective.findMany({
      where,
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            avatarUrl: true,
          },
        },
        keyResults: {
          include: {
            tarefas: {
              include: {
                responsavel: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
                subtarefas: true,
              },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    // Mapear para o formato esperado pelo frontend
    const objetivosFormatados = objetivos.map((obj) => ({
      id: obj.id,
      titulo: obj.titulo,
      descricao: obj.descricao,
      donoId: obj.responsavelId,
      dono: {
        id: obj.responsavel.id,
        nome: obj.responsavel.nome,
        avatarUrl: obj.responsavel.avatarUrl,
      },
      periodoTipo: 'TRIMESTRE',
      periodoInicio: obj.periodoInicio,
      periodoFim: obj.periodoFim,
      status: obj.status,
      progresso: Number(obj.progresso),
      keyResults: obj.keyResults.map((kr) => ({
        id: kr.id,
        objetivoId: kr.objetivoId,
        titulo: kr.titulo,
        metrica: kr.metrica,
        baseline: Number(kr.valorBaseline),
        meta: Number(kr.valorMeta),
        atual: Number(kr.valorAtual),
        peso: Number(kr.peso),
        progresso: Number(kr.progresso),
        tarefas: kr.tarefas.map((t) => ({
          id: t.id,
          keyResultId: t.keyResultId,
          titulo: t.titulo,
          descricao: t.descricao,
          responsavelId: t.responsavelId,
          responsavel: t.responsavel,
          peso: Number(t.peso),
          concluida: t.status === 'CONCLUIDA',
          subtarefas: t.subtarefas.map((s) => ({
            id: s.id,
            tarefaId: s.tarefaId,
            titulo: s.titulo,
            concluida: s.concluida,
          })),
        })),
      })),
      criadoEm: obj.criadoEm,
      atualizadoEm: obj.atualizadoEm,
    }))

    return NextResponse.json(objetivosFormatados)
  } catch (error) {
    console.error('Erro ao listar objetivos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar objetivos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo objetivo
export async function POST(request: NextRequest) {
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

    // Verificar permissao (GESTOR ou ADMIN)
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { titulo, descricao, responsavelId, periodoTipo, trimestre, ano, dataInicio, dataFim } = body

    if (!titulo) {
      return NextResponse.json(
        { error: 'Titulo e obrigatorio' },
        { status: 400 }
      )
    }

    // Calcular datas baseado no periodo
    let periodoInicioDate: Date
    let periodoFimDate: Date

    if (periodoTipo === 'TRIMESTRE' && trimestre && ano) {
      const trimestres: Record<string, { inicio: number; fim: number }> = {
        Q1: { inicio: 0, fim: 2 },
        Q2: { inicio: 3, fim: 5 },
        Q3: { inicio: 6, fim: 8 },
        Q4: { inicio: 9, fim: 11 },
      }
      const t = trimestres[trimestre]
      periodoInicioDate = new Date(ano, t.inicio, 1)
      periodoFimDate = new Date(ano, t.fim + 1, 0) // Ultimo dia do mes
    } else if (dataInicio && dataFim) {
      periodoInicioDate = new Date(dataInicio)
      periodoFimDate = new Date(dataFim)
    } else {
      return NextResponse.json(
        { error: 'Periodo invalido' },
        { status: 400 }
      )
    }

    const objetivo = await prisma.objective.create({
      data: {
        tenantId: user.tenantId,
        titulo,
        descricao,
        responsavelId: responsavelId || user.id,
        periodoInicio: periodoInicioDate,
        periodoFim: periodoFimDate,
        status: 'NAO_INICIADO',
        progresso: 0,
      },
    })

    return NextResponse.json(objetivo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar objetivo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar objetivo' },
      { status: 500 }
    )
  }
}
