export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getPlanLimit } from '@/lib/plan-limits'

interface TenantConfiguracoes {
  analisesIAHoje?: number
  ultimaAnaliseIA?: string
}

// Tipos de análise suportados
type TipoAnalise = 'financeiro' | 'fluxo_caixa' | 'orcamento' | 'previsao' | 'geral'

// Análises mockadas por tipo
const ANALISES_MOCKADAS: Record<TipoAnalise, { insights: Array<{
  tipo: 'alerta' | 'sugestao' | 'previsao'
  titulo: string
  descricao: string
  impacto: 'positivo' | 'negativo' | 'neutro'
  acao?: string
}> }> = {
  financeiro: {
    insights: [
      {
        tipo: 'alerta',
        titulo: 'Despesas acima da média',
        descricao: 'Suas despesas este mês estão 15% acima da média dos últimos 3 meses. Considere revisar os gastos variáveis.',
        impacto: 'negativo',
        acao: 'Revisar categorias de despesas'
      },
      {
        tipo: 'sugestao',
        titulo: 'Oportunidade de economia',
        descricao: 'Identificamos que a categoria "Serviços" representa 35% das despesas. Negociar contratos pode gerar economia.',
        impacto: 'neutro',
        acao: 'Analisar contratos de serviços'
      }
    ]
  },
  fluxo_caixa: {
    insights: [
      {
        tipo: 'previsao',
        titulo: 'Projeção de fluxo positivo',
        descricao: 'Com base no histórico, o próximo mês deve ter saldo positivo de aproximadamente R$ 15.000.',
        impacto: 'positivo'
      },
      {
        tipo: 'alerta',
        titulo: 'Pico de despesas previsto',
        descricao: 'Entre os dias 5-10 do próximo mês, há concentração de contas a pagar. Garanta liquidez.',
        impacto: 'negativo',
        acao: 'Verificar disponibilidade de caixa'
      }
    ]
  },
  orcamento: {
    insights: [
      {
        tipo: 'alerta',
        titulo: 'Orçamento estourado',
        descricao: 'A categoria "Marketing" já consumiu 120% do orçamento mensal previsto.',
        impacto: 'negativo',
        acao: 'Revisar gastos de marketing'
      },
      {
        tipo: 'sugestao',
        titulo: 'Realocar recursos',
        descricao: 'A categoria "Viagens" está com apenas 40% de uso. Considere realocar para áreas prioritárias.',
        impacto: 'neutro',
        acao: 'Rebalancear orçamento'
      }
    ]
  },
  previsao: {
    insights: [
      {
        tipo: 'previsao',
        titulo: 'Tendência de crescimento',
        descricao: 'Baseado nos últimos 6 meses, suas receitas têm tendência de crescimento de 8% ao mês.',
        impacto: 'positivo'
      },
      {
        tipo: 'previsao',
        titulo: 'Sazonalidade identificada',
        descricao: 'Identificamos que janeiro e fevereiro são meses de menor faturamento. Planeje reservas.',
        impacto: 'neutro',
        acao: 'Criar reserva de emergência'
      }
    ]
  },
  geral: {
    insights: [
      {
        tipo: 'sugestao',
        titulo: 'Saúde financeira boa',
        descricao: 'Sua empresa mantém um índice de liquidez saudável. Continue monitorando o fluxo de caixa.',
        impacto: 'positivo'
      },
      {
        tipo: 'alerta',
        titulo: 'Contas a receber atrasadas',
        descricao: 'Você tem R$ 5.000 em contas a receber com mais de 30 dias de atraso.',
        impacto: 'negativo',
        acao: 'Cobrar clientes inadimplentes'
      }
    ]
  }
}

// POST - Gerar análise IA com controle de limite
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
      include: { tenant: true }
    })

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const tenant = user.tenant
    const configuracoes = (tenant.configuracoes as TenantConfiguracoes) || {}

    // Verificar se passou da meia-noite (resetar contador)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const ultimaAnalise = configuracoes.ultimaAnaliseIA
      ? new Date(configuracoes.ultimaAnaliseIA)
      : null

    let analisesHoje = configuracoes.analisesIAHoje || 0

    // Se a última análise foi em um dia anterior, resetar contador
    if (ultimaAnalise) {
      const ultimaAnaliseDia = new Date(ultimaAnalise)
      ultimaAnaliseDia.setHours(0, 0, 0, 0)

      if (ultimaAnaliseDia.getTime() < hoje.getTime()) {
        analisesHoje = 0
      }
    }

    // Obter limite do plano
    const limiteAnalisesIA = getPlanLimit(tenant.plano, 'analisesIA')

    // Verificar se atingiu o limite (se não for ilimitado)
    if (limiteAnalisesIA !== -1 && analisesHoje >= limiteAnalisesIA) {
      return NextResponse.json({
        error: 'Limite de análises IA atingido',
        message: 'Você atingiu o limite diário de análises IA do seu plano. Faça upgrade para continuar usando.',
        limite: limiteAnalisesIA,
        usado: analisesHoje,
        planoAtual: tenant.plano,
        upgrade: true
      }, { status: 429 })
    }

    // Processar requisição
    const body = await request.json()
    const tipoAnalise = (body.tipo as TipoAnalise) || 'geral'

    // Validar tipo de análise
    if (!ANALISES_MOCKADAS[tipoAnalise]) {
      return NextResponse.json({ error: 'Tipo de análise inválido' }, { status: 400 })
    }

    // TODO: Implementar IA real aqui
    // Por enquanto, retornar análise mockada
    const analise = ANALISES_MOCKADAS[tipoAnalise]

    // Incrementar contador de análises
    const novasConfiguracoes = {
      ...configuracoes,
      analisesIAHoje: analisesHoje + 1,
      ultimaAnaliseIA: new Date().toISOString()
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { configuracoes: novasConfiguracoes }
    })

    return NextResponse.json({
      sucesso: true,
      tipo: tipoAnalise,
      analise,
      uso: {
        analisesHoje: analisesHoje + 1,
        limite: limiteAnalisesIA,
        ilimitado: limiteAnalisesIA === -1
      }
    })
  } catch (error) {
    console.error('Erro ao gerar análise IA:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar análise IA' },
      { status: 500 }
    )
  }
}
