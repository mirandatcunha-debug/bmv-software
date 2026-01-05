import { Objetivo, KeyResult, Tarefa, StatusOKR } from '@/types/okr'

/**
 * Calcula o progresso de uma tarefa
 * Tarefa concluida = 100%, nao concluida = 0%
 */
export function calcularProgressoTarefa(tarefa: Tarefa): number {
  return tarefa.concluida ? 100 : 0
}

/**
 * Calcula o progresso de um Key Result baseado nas tarefas
 * Usa media ponderada pelo peso de cada tarefa
 */
export function calcularProgressoKR(kr: KeyResult): number {
  // Se nao tem tarefas, calcula pelo valor atual vs meta
  if (!kr.tarefas || kr.tarefas.length === 0) {
    return calcularProgressoPorValor(kr.baseline, kr.meta, kr.atual)
  }

  // Calcula media ponderada das tarefas
  let somaPesos = 0
  let somaProgressoPonderado = 0

  for (const tarefa of kr.tarefas) {
    const progressoTarefa = calcularProgressoTarefa(tarefa)
    somaProgressoPonderado += progressoTarefa * tarefa.peso
    somaPesos += tarefa.peso
  }

  if (somaPesos === 0) return 0

  return Math.round(somaProgressoPonderado / somaPesos)
}

/**
 * Calcula o progresso baseado em valor atual vs meta
 * Considera o baseline como ponto de partida
 */
export function calcularProgressoPorValor(
  baseline: number,
  meta: number,
  atual: number
): number {
  const range = meta - baseline
  if (range === 0) return atual >= meta ? 100 : 0

  const progresso = ((atual - baseline) / range) * 100
  return Math.max(0, Math.min(100, Math.round(progresso)))
}

/**
 * Calcula o progresso de um Objetivo baseado nos Key Results
 * Usa media ponderada pelo peso de cada KR
 */
export function calcularProgressoObjetivo(objetivo: Objetivo): number {
  if (!objetivo.keyResults || objetivo.keyResults.length === 0) {
    return 0
  }

  let somaPesos = 0
  let somaProgressoPonderado = 0

  for (const kr of objetivo.keyResults) {
    const progressoKR = calcularProgressoKR(kr)
    somaProgressoPonderado += progressoKR * kr.peso
    somaPesos += kr.peso
  }

  if (somaPesos === 0) return 0

  return Math.round(somaProgressoPonderado / somaPesos)
}

/**
 * Determina o status automatico baseado no progresso e periodo
 */
export function determinarStatus(
  progresso: number,
  dataFim?: Date,
  statusAtual?: StatusOKR
): StatusOKR {
  // Se ja foi cancelado, mantem
  if (statusAtual === 'CANCELADO') return 'CANCELADO'

  // Se atingiu 100%, esta concluido
  if (progresso >= 100) return 'CONCLUIDO'

  // Se nao iniciou
  if (progresso === 0) return 'NAO_INICIADO'

  // Verifica se esta atrasado (passou da data fim)
  if (dataFim && new Date() > dataFim && progresso < 100) {
    return 'ATRASADO'
  }

  // Em andamento
  return 'EM_ANDAMENTO'
}

/**
 * Calcula quantos dias restam ate a data fim
 */
export function calcularDiasRestantes(dataFim: Date | string): number {
  const fim = new Date(dataFim)
  const hoje = new Date()
  const diffTime = fim.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Formata o periodo do objetivo
 */
export function formatarPeriodo(objetivo: Objetivo): string {
  if (objetivo.periodoTipo === 'TRIMESTRE' && objetivo.trimestre && objetivo.ano) {
    return `${objetivo.trimestre} ${objetivo.ano}`
  }

  if (objetivo.dataInicio && objetivo.dataFim) {
    const inicio = new Date(objetivo.dataInicio).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
    const fim = new Date(objetivo.dataFim).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    return `${inicio} - ${fim}`
  }

  return ''
}

/**
 * Calcula estatisticas resumidas de um objetivo
 */
export function calcularEstatisticas(objetivo: Objetivo) {
  const totalKRs = objetivo.keyResults.length
  const krsCompletos = objetivo.keyResults.filter(kr => calcularProgressoKR(kr) >= 100).length

  let totalTarefas = 0
  let tarefasCompletas = 0

  for (const kr of objetivo.keyResults) {
    totalTarefas += kr.tarefas?.length || 0
    tarefasCompletas += kr.tarefas?.filter(t => t.concluida).length || 0
  }

  return {
    totalKRs,
    krsCompletos,
    totalTarefas,
    tarefasCompletas,
    progressoGeral: calcularProgressoObjetivo(objetivo),
  }
}

/**
 * Agrupa objetivos por status
 */
export function agruparPorStatus(objetivos: Objetivo[]): Record<StatusOKR, Objetivo[]> {
  const grupos: Record<StatusOKR, Objetivo[]> = {
    NAO_INICIADO: [],
    EM_ANDAMENTO: [],
    ATRASADO: [],
    CONCLUIDO: [],
    CANCELADO: [],
  }

  for (const obj of objetivos) {
    grupos[obj.status].push(obj)
  }

  return grupos
}

/**
 * Calcula o progresso medio de uma lista de objetivos
 */
export function calcularProgressoMedio(objetivos: Objetivo[]): number {
  if (objetivos.length === 0) return 0

  const soma = objetivos.reduce((acc, obj) => acc + calcularProgressoObjetivo(obj), 0)
  return Math.round(soma / objetivos.length)
}
