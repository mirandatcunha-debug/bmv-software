import { Insight, InsightTipo, InsightCategoria } from '@/types/insights'

// Tipos para dados de entrada
interface DadosFinanceiros {
  saldoTotal: number
  receitasMes: number
  despesasMes: number
  mediaReceitasUltimos3Meses: number
  mediaDespesasUltimos3Meses: number
  contasReceberVencidas: number
  resultadoUltimos3Meses: number[] // [mesAtual, mesAnterior, mes2Anterior]
}

interface DadosOKR {
  id: string
  titulo: string
  progresso: number
  dataFim: Date
  tarefasAtrasadas: number
  totalTarefas: number
}

interface DadosColaborador {
  id: string
  nome: string
  tarefasAtrasadas: number
}

interface DadosProjeto {
  id: string
  nome: string
  status: string
  progresso: number
  dataFim?: Date
}

// Função para gerar ID único
function gerarId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função para criar insight
function criarInsight(
  tipo: InsightTipo,
  categoria: InsightCategoria,
  titulo: string,
  descricao: string,
  prioridade: number,
  acao?: { texto: string; link: string }
): Insight {
  const icones: Record<InsightTipo, string> = {
    CRITICO: '🚨',
    ALERTA: '⚠️',
    SUGESTAO: '💡',
    POSITIVO: '✅',
  }

  return {
    id: gerarId(),
    tipo,
    categoria,
    titulo,
    descricao,
    icone: icones[tipo],
    prioridade,
    acao,
    criadoEm: new Date(),
  }
}

// ============ REGRAS FINANCEIRAS ============

export function analisarFinanceiro(dados: DadosFinanceiros): Insight[] {
  const insights: Insight[] = []

  // Despesas acima do normal (> 120% da média)
  if (dados.mediaDespesasUltimos3Meses > 0) {
    const percentualDespesas = (dados.despesasMes / dados.mediaDespesasUltimos3Meses) * 100
    if (percentualDespesas > 120) {
      insights.push(
        criarInsight(
          'ALERTA',
          'FINANCEIRO',
          'Despesas acima do normal',
          `Suas despesas este mês estão ${Math.round(percentualDespesas - 100)}% acima da média dos últimos 3 meses.`,
          2,
          { texto: 'Ver despesas', link: '/financeiro/movimentacoes?tipo=DESPESA' }
        )
      )
    }
  }

  // Receitas abaixo do esperado (< 80% da média)
  if (dados.mediaReceitasUltimos3Meses > 0) {
    const percentualReceitas = (dados.receitasMes / dados.mediaReceitasUltimos3Meses) * 100
    if (percentualReceitas < 80) {
      insights.push(
        criarInsight(
          'ALERTA',
          'FINANCEIRO',
          'Receitas abaixo do esperado',
          `Suas receitas este mês estão ${Math.round(100 - percentualReceitas)}% abaixo da média.`,
          2,
          { texto: 'Ver receitas', link: '/financeiro/movimentacoes?tipo=RECEITA' }
        )
      )
    } else if (percentualReceitas > 120) {
      // Receitas acima da média (positivo)
      insights.push(
        criarInsight(
          'POSITIVO',
          'FINANCEIRO',
          'Receitas acima da média! 🎉',
          `Suas receitas este mês estão ${Math.round(percentualReceitas - 100)}% acima da média. Continue assim!`,
          5
        )
      )
    }
  }

  // Reserva financeira baixa
  if (dados.mediaDespesasUltimos3Meses > 0 && dados.saldoTotal < dados.mediaDespesasUltimos3Meses) {
    insights.push(
      criarInsight(
        'ALERTA',
        'FINANCEIRO',
        'Reserva financeira baixa',
        `Seu saldo atual é menor que a média mensal de despesas. Considere aumentar sua reserva.`,
        2,
        { texto: 'Ver fluxo de caixa', link: '/financeiro/fluxo-caixa' }
        )
    )
  }

  // Inadimplência (contas a receber vencidas)
  if (dados.contasReceberVencidas > 0) {
    insights.push(
      criarInsight(
        'ALERTA',
        'FINANCEIRO',
        'Valores a receber em atraso',
        `Você tem R$ ${dados.contasReceberVencidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em contas vencidas há mais de 30 dias.`,
        2,
        { texto: 'Ver contas a receber', link: '/financeiro/movimentacoes?status=PENDENTE' }
      )
    )
  }

  // Resultado negativo por 2 meses seguidos
  const mesesNegativos = dados.resultadoUltimos3Meses.filter((r) => r < 0).length
  if (dados.resultadoUltimos3Meses[0] < 0 && dados.resultadoUltimos3Meses[1] < 0) {
    insights.push(
      criarInsight(
        'CRITICO',
        'FINANCEIRO',
        'Atenção: Resultado negativo consecutivo',
        `Seus resultados estão negativos há 2 meses consecutivos. É importante revisar suas finanças.`,
        1,
        { texto: 'Ver fluxo de caixa', link: '/financeiro/fluxo-caixa' }
      )
    )
  }

  // Saúde financeira estável (3 meses positivos)
  if (mesesNegativos === 0 && dados.resultadoUltimos3Meses.length === 3) {
    insights.push(
      criarInsight(
        'POSITIVO',
        'FINANCEIRO',
        'Saúde financeira estável ✅',
        `Parabéns! Seus resultados estão positivos há 3 meses consecutivos.`,
        6
      )
    )
  }

  return insights
}

// ============ REGRAS DE OKR ============

export function analisarOKRs(okrs: DadosOKR[]): Insight[] {
  const insights: Insight[] = []
  const hoje = new Date()

  let okrsEmRisco = 0
  let okrsCriticos = 0
  let okrsNoTrilho = 0

  for (const okr of okrs) {
    const diasRestantes = Math.ceil(
      (new Date(okr.dataFim).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    )

    // OKR crítico: < 25% progresso e falta < 15 dias
    if (okr.progresso < 25 && diasRestantes > 0 && diasRestantes < 15) {
      okrsCriticos++
      insights.push(
        criarInsight(
          'CRITICO',
          'OKR',
          `OKR crítico: ${okr.titulo}`,
          `Apenas ${okr.progresso}% concluído com ${diasRestantes} dias restantes. Ação urgente necessária!`,
          1,
          { texto: 'Ver OKR', link: `/processos/okr/${okr.id}` }
        )
      )
    }
    // OKR em risco: < 50% progresso e falta < 30 dias
    else if (okr.progresso < 50 && diasRestantes > 0 && diasRestantes < 30) {
      okrsEmRisco++
      insights.push(
        criarInsight(
          'ALERTA',
          'OKR',
          `OKR em risco: ${okr.titulo}`,
          `Progresso de ${okr.progresso}% com ${diasRestantes} dias restantes. Considere acelerar as entregas.`,
          2,
          { texto: 'Ver OKR', link: `/processos/okr/${okr.id}` }
        )
      )
    }
    // OKR com todas tarefas atrasadas
    else if (okr.totalTarefas > 0 && okr.tarefasAtrasadas === okr.totalTarefas) {
      insights.push(
        criarInsight(
          'ALERTA',
          'OKR',
          `Tarefas atrasadas: ${okr.titulo}`,
          `Todas as ${okr.totalTarefas} tarefas deste OKR estão atrasadas.`,
          2,
          { texto: 'Ver tarefas', link: `/processos/okr/${okr.id}` }
        )
      )
    }

    // Contar OKRs no trilho
    if (okr.progresso >= 70) {
      okrsNoTrilho++
    }
  }

  // Todos OKRs > 70% (positivo)
  if (okrs.length > 0 && okrsNoTrilho === okrs.length) {
    insights.push(
      criarInsight(
        'POSITIVO',
        'OKR',
        'OKRs no caminho certo! 👏',
        `Todos os seus ${okrs.length} OKRs estão com mais de 70% de progresso. Excelente trabalho!`,
        6
      )
    )
  }

  return insights
}

// ============ REGRAS DE COLABORADOR ============

export function analisarColaboradores(colaboradores: DadosColaborador[]): Insight[] {
  const insights: Insight[] = []

  for (const colaborador of colaboradores) {
    if (colaborador.tarefasAtrasadas > 5) {
      insights.push(
        criarInsight(
          'ALERTA',
          'OKR',
          `Sobrecarga: ${colaborador.nome}`,
          `${colaborador.nome} tem ${colaborador.tarefasAtrasadas} tarefas atrasadas. Considere redistribuir.`,
          3
        )
      )
    }
  }

  return insights
}

// ============ MOTOR PRINCIPAL ============

export interface DadosParaAnalise {
  financeiro?: DadosFinanceiros
  okrs?: DadosOKR[]
  colaboradores?: DadosColaborador[]
  projeto?: DadosProjeto
}

export function gerarInsights(dados: DadosParaAnalise): Insight[] {
  let insights: Insight[] = []

  // Analisar financeiro
  if (dados.financeiro) {
    insights = [...insights, ...analisarFinanceiro(dados.financeiro)]
  }

  // Analisar OKRs
  if (dados.okrs && dados.okrs.length > 0) {
    insights = [...insights, ...analisarOKRs(dados.okrs)]
  }

  // Analisar colaboradores
  if (dados.colaboradores && dados.colaboradores.length > 0) {
    insights = [...insights, ...analisarColaboradores(dados.colaboradores)]
  }

  // Ordenar por prioridade (menor número = mais urgente)
  insights.sort((a, b) => a.prioridade - b.prioridade)

  // Retornar os 5 insights mais importantes
  return insights.slice(0, 5)
}

// Função para obter os top 3 insights para exibição no dashboard
export function getTopInsights(insights: Insight[]): Insight[] {
  return insights.slice(0, 3)
}
