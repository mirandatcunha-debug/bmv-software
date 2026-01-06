// Tipos para o módulo Financeiro

export type TipoTransacao = 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
export type TipoConta = 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'CAIXA'
export type TipoCategoria = 'RECEITA' | 'DESPESA'
export type Frequencia = 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'ANUAL'

export interface ContaBancaria {
  id: string
  tenantId: string
  nome: string
  banco?: string
  agencia?: string
  conta?: string
  tipo: TipoConta
  saldoInicial: number
  saldoAtual: number
  cor?: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface CategoriaFinanceira {
  id: string
  tenantId: string
  nome: string
  tipo: TipoCategoria
  cor?: string
  icone?: string
  criadoEm: Date
}

export interface Movimentacao {
  id: string
  tenantId: string
  contaId: string
  conta?: ContaBancaria
  tipo: TipoTransacao
  categoria: string
  subcategoria?: string
  descricao: string
  valor: number
  dataMovimento: Date | string
  dataCompetencia?: Date | string
  recorrente: boolean
  frequencia?: Frequencia
  observacoes?: string
  tags?: string[]
  criadoEm: Date
  atualizadoEm: Date
}

export interface FluxoCaixaItem {
  data: Date | string
  descricao: string
  tipo: TipoTransacao
  entrada: number
  saida: number
  saldo: number
}

export interface ResumoFinanceiro {
  saldoTotal: number
  receitasMes: number
  despesasMes: number
  resultadoMes: number
  contasPagar: number
  contasReceber: number
}

// Labels para exibição
export const tipoTransacaoLabels: Record<TipoTransacao, string> = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa',
  TRANSFERENCIA: 'Transferência',
}

export const tipoContaLabels: Record<TipoConta, string> = {
  CORRENTE: 'Conta Corrente',
  POUPANCA: 'Poupança',
  INVESTIMENTO: 'Investimento',
  CAIXA: 'Caixa',
}

export const frequenciaLabels: Record<Frequencia, string> = {
  DIARIA: 'Diária',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  ANUAL: 'Anual',
}

// Cores para tipos
export const tipoTransacaoCores: Record<TipoTransacao, string> = {
  RECEITA: 'text-green-600 bg-green-100',
  DESPESA: 'text-red-600 bg-red-100',
  TRANSFERENCIA: 'text-blue-600 bg-blue-100',
}

// Categorias padrão
export const categoriasReceita = [
  'Vendas',
  'Serviços',
  'Comissões',
  'Rendimentos',
  'Empréstimos',
  'Outras Receitas',
]

export const categoriasDespesa = [
  'Pessoal',
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Telefone',
  'Marketing',
  'Impostos',
  'Fornecedores',
  'Manutenção',
  'Transporte',
  'Material de Escritório',
  'Outras Despesas',
]

// Utilitários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}
