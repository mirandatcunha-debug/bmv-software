export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar contas bancarias
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

    const whereClause: any = {
      tenantId: user.tenantId,
    }

    if (apenasAtivas) {
      whereClause.ativo = true
    }

    const contas = await prisma.bankAccount.findMany({
      where: whereClause,
      orderBy: { nome: 'asc' },
    })

    const contasFormatadas = contas.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      nome: c.nome,
      banco: c.banco,
      agencia: c.agencia,
      conta: c.conta,
      tipo: c.tipo,
      saldoInicial: Number(c.saldoInicial),
      saldoAtual: Number(c.saldoAtual),
      cor: c.cor,
      ativo: c.ativo,
      criadoEm: c.criadoEm,
      atualizadoEm: c.atualizadoEm,
    }))

    return NextResponse.json(contasFormatadas)
  } catch (error) {
    console.error('Erro ao listar contas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar contas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova conta bancaria
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
    const { nome, banco, agencia, conta, tipo, saldoInicial, cor } = body

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome da conta e obrigatorio' },
        { status: 400 }
      )
    }

    const novaConta = await prisma.bankAccount.create({
      data: {
        tenantId: user.tenantId,
        nome,
        banco,
        agencia,
        conta,
        tipo: tipo || 'CORRENTE',
        saldoInicial: saldoInicial || 0,
        saldoAtual: saldoInicial || 0,
        cor: cor || '#1a365d',
        ativo: true,
      },
    })

    return NextResponse.json({
      id: novaConta.id,
      tenantId: novaConta.tenantId,
      nome: novaConta.nome,
      banco: novaConta.banco,
      agencia: novaConta.agencia,
      conta: novaConta.conta,
      tipo: novaConta.tipo,
      saldoInicial: Number(novaConta.saldoInicial),
      saldoAtual: Number(novaConta.saldoAtual),
      cor: novaConta.cor,
      ativo: novaConta.ativo,
      criadoEm: novaConta.criadoEm,
      atualizadoEm: novaConta.atualizadoEm,
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
