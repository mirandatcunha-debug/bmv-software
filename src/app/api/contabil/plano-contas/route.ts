export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar plano de contas
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
    const apenasAtivas = searchParams.get('ativas') === 'true'
    const tipo = searchParams.get('tipo')
    const natureza = searchParams.get('natureza')

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (apenasAtivas) {
      whereClause.ativo = true
    }

    if (tipo) {
      whereClause.tipo = tipo
    }

    if (natureza) {
      whereClause.natureza = natureza
    }

    const contas = await prisma.chartOfAccount.findMany({
      where: whereClause,
      include: {
        contaPai: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        contasFilhas: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        _count: {
          select: { lancamentos: true },
        },
      },
      orderBy: { codigo: 'asc' },
    })

    const contasFormatadas = contas.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      codigo: c.codigo,
      nome: c.nome,
      tipo: c.tipo,
      natureza: c.natureza,
      contaPaiId: c.contaPaiId,
      nivel: c.nivel,
      ativo: c.ativo,
      contaPai: c.contaPai,
      contasFilhas: c.contasFilhas,
      totalLancamentos: c._count.lancamentos,
      criadoEm: c.criadoEm,
      atualizadoEm: c.atualizadoEm,
    }))

    return NextResponse.json(contasFormatadas)
  } catch (error) {
    console.error('Erro ao listar plano de contas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar plano de contas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova conta contabil
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

    // Apenas ADMIN_BMV, CONSULTOR_BMV e GESTOR podem criar contas
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const body = await request.json()
    const { codigo, nome, tipo, natureza, contaPaiId } = body

    if (!codigo || !nome || !tipo || !natureza) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: codigo, nome, tipo, natureza' },
        { status: 400 }
      )
    }

    const tiposValidos = ['ATIVO', 'PASSIVO', 'PATRIMONIO_LIQUIDO', 'RECEITA', 'DESPESA', 'CUSTO']
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo invalido. Valores aceitos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }

    const naturezasValidas = ['DEVEDORA', 'CREDORA']
    if (!naturezasValidas.includes(natureza)) {
      return NextResponse.json(
        { error: `Natureza invalida. Valores aceitos: ${naturezasValidas.join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar se o codigo ja existe no tenant
    const contaExistente = await prisma.chartOfAccount.findFirst({
      where: {
        tenantId: user.tenantId,
        codigo,
      },
    })

    if (contaExistente) {
      return NextResponse.json(
        { error: 'Ja existe uma conta com este codigo' },
        { status: 409 }
      )
    }

    let nivel = 1
    if (contaPaiId) {
      const contaPai = await prisma.chartOfAccount.findFirst({
        where: {
          id: contaPaiId,
          tenantId: user.tenantId,
        },
      })

      if (!contaPai) {
        return NextResponse.json(
          { error: 'Conta pai nao encontrada' },
          { status: 404 }
        )
      }

      nivel = contaPai.nivel + 1
    }

    const novaConta = await prisma.chartOfAccount.create({
      data: {
        tenantId: user.tenantId,
        codigo,
        nome,
        tipo,
        natureza,
        contaPaiId: contaPaiId || null,
        nivel,
        ativo: true,
      },
      include: {
        contaPai: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: novaConta.id,
      tenantId: novaConta.tenantId,
      codigo: novaConta.codigo,
      nome: novaConta.nome,
      tipo: novaConta.tipo,
      natureza: novaConta.natureza,
      contaPaiId: novaConta.contaPaiId,
      nivel: novaConta.nivel,
      ativo: novaConta.ativo,
      contaPai: novaConta.contaPai,
      criadoEm: novaConta.criadoEm,
      atualizadoEm: novaConta.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta contabil:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta contabil' },
      { status: 500 }
    )
  }
}
