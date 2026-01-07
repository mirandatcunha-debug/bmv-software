// Serviço para o módulo Financeiro

import { api } from './api'
import type { Movimentacao, ContaBancaria, TipoTransacao } from '@/types/financeiro'

// Tipos para filtros e criação
export interface FiltrosMovimentacao {
  contaId?: string
  tipo?: TipoTransacao
  categoria?: string
  dataInicio?: string
  dataFim?: string
  busca?: string
  page?: number
  limit?: number
}

export interface CreateMovimentacaoData {
  contaId: string
  tipo: TipoTransacao
  categoria: string
  subcategoria?: string
  descricao: string
  valor: number
  dataMovimento: string
  dataCompetencia?: string
  recorrente?: boolean
  frequencia?: string
  observacoes?: string
  tags?: string[]
}

export interface UpdateMovimentacaoData extends Partial<CreateMovimentacaoData> {}

export interface CreateContaData {
  nome: string
  banco?: string
  agencia?: string
  conta?: string
  tipo: string
  saldoInicial: number
  cor?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Serviço de Movimentações
export const movimentacaoService = {
  async getMovimentacoes(filtros?: FiltrosMovimentacao): Promise<PaginatedResponse<Movimentacao>> {
    const params: Record<string, string | number | boolean | undefined> = {}

    if (filtros) {
      if (filtros.contaId) params.contaId = filtros.contaId
      if (filtros.tipo) params.tipo = filtros.tipo
      if (filtros.categoria) params.categoria = filtros.categoria
      if (filtros.dataInicio) params.dataInicio = filtros.dataInicio
      if (filtros.dataFim) params.dataFim = filtros.dataFim
      if (filtros.busca) params.busca = filtros.busca
      if (filtros.page) params.page = filtros.page
      if (filtros.limit) params.limit = filtros.limit
    }

    return api.get<PaginatedResponse<Movimentacao>>('/financeiro/movimentacoes', params)
  },

  async createMovimentacao(data: CreateMovimentacaoData): Promise<Movimentacao> {
    return api.post<Movimentacao>('/financeiro/movimentacoes', data)
  },

  async updateMovimentacao(id: string, data: UpdateMovimentacaoData): Promise<Movimentacao> {
    return api.patch<Movimentacao>(`/financeiro/movimentacoes/${id}`, data)
  },

  async deleteMovimentacao(id: string): Promise<void> {
    return api.delete<void>(`/financeiro/movimentacoes/${id}`)
  },
}

// Serviço de Contas Bancárias
export const contaService = {
  async getContas(): Promise<ContaBancaria[]> {
    return api.get<ContaBancaria[]>('/financeiro/contas')
  },

  async getConta(id: string): Promise<ContaBancaria> {
    return api.get<ContaBancaria>(`/financeiro/contas/${id}`)
  },

  async createConta(data: CreateContaData): Promise<ContaBancaria> {
    return api.post<ContaBancaria>('/financeiro/contas', data)
  },

  async updateConta(id: string, data: Partial<CreateContaData>): Promise<ContaBancaria> {
    return api.patch<ContaBancaria>(`/financeiro/contas/${id}`, data)
  },

  async deleteConta(id: string): Promise<void> {
    return api.delete<void>(`/financeiro/contas/${id}`)
  },
}

// Export agrupado para facilitar importação
export const financeiroService = {
  movimentacoes: movimentacaoService,
  contas: contaService,
}

export default financeiroService
