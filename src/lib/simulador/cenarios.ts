export interface Cenario {
  nome: string
  receitas: number // percentual de variação (ex: 10 = +10%)
  despesas: number // percentual de variação (ex: -5 = -5%)
  inadimplencia: number // percentual de inadimplência
  crescimento: number // percentual de crescimento mensal
}

export interface MesProjetado {
  mes: number
  nome: string
  receita: number
  despesa: number
  saldo: number
  saldoAcumulado: number
}

export interface Indicadores {
  saldoFinal: number
  variacaoTotal: number
  mediaReceitas: number
  mediaDespesas: number
  mediaSaldo: number
  mesesPositivos: number
  mesesNegativos: number
}

export interface ResultadoSimulacao {
  cenario: Cenario
  meses: MesProjetado[]
  indicadores: Indicadores
}

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const CENARIOS_PADRAO: Cenario[] = [
  {
    nome: 'Otimista',
    receitas: 15,
    despesas: -5,
    inadimplencia: 2,
    crescimento: 3,
  },
  {
    nome: 'Realista',
    receitas: 5,
    despesas: 5,
    inadimplencia: 5,
    crescimento: 1,
  },
  {
    nome: 'Pessimista',
    receitas: -10,
    despesas: 15,
    inadimplencia: 10,
    crescimento: -2,
  },
]

export function simularCenario(
  saldoAtual: number,
  receitaMedia: number,
  despesaMedia: number,
  cenario: Cenario
): ResultadoSimulacao {
  const meses: MesProjetado[] = []
  let saldoAcumulado = saldoAtual
  const mesAtual = new Date().getMonth()

  for (let i = 0; i < 12; i++) {
    const indiceMes = (mesAtual + i + 1) % 12
    const fatorCrescimento = Math.pow(1 + cenario.crescimento / 100, i)

    // Calcula receita com variação do cenário, crescimento e inadimplência
    const receitaBruta = receitaMedia * (1 + cenario.receitas / 100) * fatorCrescimento
    const receita = receitaBruta * (1 - cenario.inadimplencia / 100)

    // Calcula despesa com variação do cenário e crescimento
    const despesa = despesaMedia * (1 + cenario.despesas / 100) * fatorCrescimento

    const saldo = receita - despesa
    saldoAcumulado += saldo

    meses.push({
      mes: i + 1,
      nome: NOMES_MESES[indiceMes],
      receita: Math.round(receita * 100) / 100,
      despesa: Math.round(despesa * 100) / 100,
      saldo: Math.round(saldo * 100) / 100,
      saldoAcumulado: Math.round(saldoAcumulado * 100) / 100,
    })
  }

  const totalReceitas = meses.reduce((acc, m) => acc + m.receita, 0)
  const totalDespesas = meses.reduce((acc, m) => acc + m.despesa, 0)
  const mesesPositivos = meses.filter(m => m.saldo > 0).length
  const mesesNegativos = meses.filter(m => m.saldo < 0).length

  const indicadores: Indicadores = {
    saldoFinal: Math.round(saldoAcumulado * 100) / 100,
    variacaoTotal: Math.round((saldoAcumulado - saldoAtual) * 100) / 100,
    mediaReceitas: Math.round((totalReceitas / 12) * 100) / 100,
    mediaDespesas: Math.round((totalDespesas / 12) * 100) / 100,
    mediaSaldo: Math.round(((totalReceitas - totalDespesas) / 12) * 100) / 100,
    mesesPositivos,
    mesesNegativos,
  }

  return {
    cenario,
    meses,
    indicadores,
  }
}

export function simularTodosCenarios(
  saldoAtual: number,
  receitaMedia: number,
  despesaMedia: number
): ResultadoSimulacao[] {
  return CENARIOS_PADRAO.map(cenario =>
    simularCenario(saldoAtual, receitaMedia, despesaMedia, cenario)
  )
}
