import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Listar Key Results de um objetivo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const keyResults = await prisma.keyResult.findMany({
      where: { objetivoId: params.id },
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
      orderBy: { criadoEm: 'asc' },
    })

    const krsFormatados = keyResults.map((kr) => ({
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
    }))

    return NextResponse.json(krsFormatados)
  } catch (error) {
    console.error('Erro ao listar Key Results:', error)
    return NextResponse.json(
      { error: 'Erro ao listar Key Results' },
      { status: 500 }
    )
  }
}

// POST - Criar novo Key Result
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se o objetivo existe e pertence ao tenant
    const objetivo = await prisma.objective.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    })

    if (!objetivo) {
      return NextResponse.json({ error: 'Objetivo nao encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { titulo, metrica, baseline, meta, peso } = body

    if (!titulo || !metrica) {
      return NextResponse.json(
        { error: 'Titulo e metrica sao obrigatorios' },
        { status: 400 }
      )
    }

    const keyResult = await prisma.keyResult.create({
      data: {
        objetivoId: params.id,
        titulo,
        metrica,
        valorBaseline: baseline || 0,
        valorMeta: meta || 0,
        valorAtual: baseline || 0,
        peso: peso || 1,
        progresso: 0,
      },
    })

    return NextResponse.json({
      id: keyResult.id,
      objetivoId: keyResult.objetivoId,
      titulo: keyResult.titulo,
      metrica: keyResult.metrica,
      baseline: Number(keyResult.valorBaseline),
      meta: Number(keyResult.valorMeta),
      atual: Number(keyResult.valorAtual),
      peso: Number(keyResult.peso),
      progresso: Number(keyResult.progresso),
      tarefas: [],
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar Key Result:', error)
    return NextResponse.json(
      { error: 'Erro ao criar Key Result' },
      { status: 500 }
    )
  }
}
