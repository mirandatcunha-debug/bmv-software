export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getPlanLimit } from '@/lib/plan-limits'
import { verificarLimiteIA, registrarUsoIA } from '@/lib/trial'

interface TenantConfiguracoes {
  analisesIAHoje?: number
  ultimaAnaliseIA?: string
}

type RiscoAtraso = 'ALTO' | 'MEDIO' | 'BAIXO'

interface AnaliseIA {
  riscoAtraso: RiscoAtraso
  motivo: string
  sugestoes: string[]
}

// Análises mockadas baseadas em diferentes cenários
function gerarAnaliseMockada(tarefa: {
  status: string
  prioridade: string
  dataFim: Date | null
  titulo: string
}): AnaliseIA {
  const hoje = new Date()
  const prazo = tarefa.dataFim ? new Date(tarefa.dataFim) : null
  const diasRestantes = prazo ? Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null

  // Determinar risco baseado em prazo, status e prioridade
  let riscoAtraso: RiscoAtraso = 'BAIXO'
  let motivo = ''
  const sugestoes: string[] = []

  // Tarefa atrasada
  if (prazo && diasRestantes !== null && diasRestantes < 0) {
    riscoAtraso = 'ALTO'
    motivo = `Esta tarefa está atrasada há ${Math.abs(diasRestantes)} dia(s). O prazo era ${prazo.toLocaleDateString('pt-BR')} e ainda não foi concluída.`
    sugestoes.push('Redistribuir para colaborador com menos carga de trabalho')
    sugestoes.push('Dividir em subtarefas menores para facilitar a conclusão')
    sugestoes.push('Priorizar esta tarefa imediatamente')
    return { riscoAtraso, motivo, sugestoes }
  }

  // Tarefa com prazo muito próximo
  if (prazo && diasRestantes !== null && diasRestantes <= 2 && diasRestantes >= 0) {
    riscoAtraso = 'ALTO'
    motivo = diasRestantes === 0
      ? 'O prazo desta tarefa vence hoje. Ação imediata é necessária.'
      : `Restam apenas ${diasRestantes} dia(s) para o prazo. A tarefa ainda está com status "${tarefa.status === 'A_FAZER' ? 'Pendente' : 'Em Andamento'}".`
    sugestoes.push('Priorizar esta tarefa acima das demais')
    sugestoes.push('Considerar alocar mais recursos ou ajuda')
    if (tarefa.status === 'A_FAZER') {
      sugestoes.push('Iniciar a tarefa imediatamente')
    }
    return { riscoAtraso, motivo, sugestoes }
  }

  // Prazo em até uma semana e prioridade alta/urgente
  if (prazo && diasRestantes !== null && diasRestantes <= 7 && ['ALTA', 'URGENTE'].includes(tarefa.prioridade)) {
    riscoAtraso = 'MEDIO'
    motivo = `Tarefa com prioridade ${tarefa.prioridade === 'URGENTE' ? 'urgente' : 'alta'} vence em ${diasRestantes} dia(s). Recomenda-se monitoramento constante.`
    sugestoes.push('Acompanhar o progresso diariamente')
    sugestoes.push('Verificar se há bloqueios ou dependências')
    if (tarefa.status === 'A_FAZER') {
      sugestoes.push('Iniciar a execução o quanto antes')
    }
    return { riscoAtraso, motivo, sugestoes }
  }

  // Tarefa parada há muito tempo (status A_FAZER com prazo definido)
  if (tarefa.status === 'A_FAZER' && prazo && diasRestantes !== null && diasRestantes <= 14) {
    riscoAtraso = 'MEDIO'
    motivo = `Esta tarefa ainda não foi iniciada e o prazo está a ${diasRestantes} dia(s). Tarefas não iniciadas têm maior chance de atraso.`
    sugestoes.push('Iniciar a tarefa para identificar possíveis bloqueios')
    sugestoes.push('Dividir em subtarefas menores para facilitar o início')
    sugestoes.push('Verificar se o responsável tem disponibilidade')
    return { riscoAtraso, motivo, sugestoes }
  }

  // Tarefa urgente sem prazo definido
  if (tarefa.prioridade === 'URGENTE' && !prazo) {
    riscoAtraso = 'MEDIO'
    motivo = 'Tarefa marcada como urgente mas sem prazo definido. Isso dificulta o acompanhamento e priorização.'
    sugestoes.push('Definir um prazo para melhor gestão')
    sugestoes.push('Priorizar esta tarefa na execução diária')
    return { riscoAtraso, motivo, sugestoes }
  }

  // Cenário padrão - baixo risco
  riscoAtraso = 'BAIXO'
  if (prazo && diasRestantes !== null) {
    motivo = `Tarefa dentro do prazo com ${diasRestantes} dia(s) restantes. O andamento está adequado para a data de entrega.`
  } else if (!prazo) {
    motivo = 'Tarefa sem prazo definido. Não há indicadores de urgência no momento.'
  } else {
    motivo = 'A tarefa está progredindo normalmente sem indicadores de risco.'
  }

  sugestoes.push('Manter o ritmo atual de execução')
  sugestoes.push('Revisar periodicamente o progresso')

  return { riscoAtraso, motivo, sugestoes }
}

// POST - Analisar tarefa com IA
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

    // Verificar limite diário usando a nova função centralizada
    const { permitido, usados, limite } = await verificarLimiteIA(tenant.id)

    if (!permitido) {
      return NextResponse.json({
        error: 'Limite diário de análises IA atingido',
        usados,
        limite,
        mensagem: `Você atingiu o limite de ${limite} análises por dia. Faça upgrade para ter mais análises.`,
        planoAtual: tenant.plano,
        upgrade: true
      }, { status: 429 })
    }

    // Verificar se passou da meia-noite (resetar contador) - mantido para compatibilidade
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

    // Verificar se atingiu o limite (se não for ilimitado) - mantido para compatibilidade
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
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId é obrigatório' }, { status: 400 })
    }

    // Buscar tarefa (através do responsável para garantir acesso do tenant)
    const tarefa = await prisma.task.findFirst({
      where: {
        id: taskId,
        responsavel: {
          tenantId: tenant.id
        }
      },
      select: {
        id: true,
        titulo: true,
        status: true,
        prioridade: true,
        dataFim: true,
      }
    })

    if (!tarefa) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Gerar análise mockada
    const analise = gerarAnaliseMockada({
      status: tarefa.status,
      prioridade: tarefa.prioridade,
      dataFim: tarefa.dataFim,
      titulo: tarefa.titulo,
    })

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

    // Registrar uso de IA na tabela centralizada
    await registrarUsoIA(tenant.id)

    return NextResponse.json({
      sucesso: true,
      analise,
      tarefa: {
        id: tarefa.id,
        titulo: tarefa.titulo,
      },
      uso: {
        analisesHoje: analisesHoje + 1,
        limite: limiteAnalisesIA,
        ilimitado: limiteAnalisesIA === -1
      }
    })
  } catch (error) {
    console.error('Erro ao analisar tarefa com IA:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar tarefa' },
      { status: 500 }
    )
  }
}
