// Servico para o modulo Contabil

import { api } from './api'

// Tipos para o modulo contabil
export interface ContaContabil {
  id: string
  codigo: string
  nome: string
  tipo: 'ATIVO' | 'PASSIVO' | 'RECEITA' | 'DESPESA' | 'PATRIMONIO'
  natureza: 'DEVEDORA' | 'CREDORA'
  nivel: number
  contaPaiId?: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface CentroCusto {
  id: string
  codigo: string
  nome: string
  descricao?: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface Lancamento {
  id: string
  data: string
  contaDebitoId: string
  contaDebito?: ContaContabil
  contaCreditoId: string
  contaCredito?: ContaContabil
  valor: number
  historico: string
  documento?: string
  centroCustoId?: string
  centroCusto?: CentroCusto
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO'
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateLancamentoData {
  data: string
  contaDebitoId: string
  contaCreditoId: string
  valor: number
  historico: string
  documento?: string
  centroCustoId?: string
}

export interface FiltrosLancamento {
  dataInicio?: string
  dataFim?: string
  contaId?: string
  centroCustoId?: string
  status?: string
  busca?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Servico de Contas Contabeis
export const contaContabilService = {
  async getPlanoContas(): Promise<ContaContabil[]> {
    return api.get<ContaContabil[]>('/contabil/plano-contas')
  },

  async getConta(id: string): Promise<ContaContabil> {
    return api.get<ContaContabil>(`/contabil/plano-contas/${id}`)
  },

  async createConta(data: Partial<ContaContabil>): Promise<ContaContabil> {
    return api.post<ContaContabil>('/contabil/plano-contas', data)
  },

  async updateConta(id: string, data: Partial<ContaContabil>): Promise<ContaContabil> {
    return api.patch<ContaContabil>(`/contabil/plano-contas/${id}`, data)
  },

  async deleteConta(id: string): Promise<void> {
    return api.delete<void>(`/contabil/plano-contas/${id}`)
  },
}

// Servico de Centros de Custo
export const centroCustoService = {
  async getCentrosCusto(): Promise<CentroCusto[]> {
    return api.get<CentroCusto[]>('/contabil/centros-custo')
  },

  async getCentroCusto(id: string): Promise<CentroCusto> {
    return api.get<CentroCusto>(`/contabil/centros-custo/${id}`)
  },

  async createCentroCusto(data: Partial<CentroCusto>): Promise<CentroCusto> {
    return api.post<CentroCusto>('/contabil/centros-custo', data)
  },

  async updateCentroCusto(id: string, data: Partial<CentroCusto>): Promise<CentroCusto> {
    return api.patch<CentroCusto>(`/contabil/centros-custo/${id}`, data)
  },

  async deleteCentroCusto(id: string): Promise<void> {
    return api.delete<void>(`/contabil/centros-custo/${id}`)
  },
}

// Servico de Lancamentos
export const lancamentoService = {
  async getLancamentos(filtros?: FiltrosLancamento): Promise<PaginatedResponse<Lancamento>> {
    const params: Record<string, string | number | boolean | undefined> = {}

    if (filtros) {
      if (filtros.dataInicio) params.dataInicio = filtros.dataInicio
      if (filtros.dataFim) params.dataFim = filtros.dataFim
      if (filtros.contaId) params.contaId = filtros.contaId
      if (filtros.centroCustoId) params.centroCustoId = filtros.centroCustoId
      if (filtros.status) params.status = filtros.status
      if (filtros.busca) params.busca = filtros.busca
      if (filtros.page) params.page = filtros.page
      if (filtros.limit) params.limit = filtros.limit
    }

    return api.get<PaginatedResponse<Lancamento>>('/contabil/lancamentos', params)
  },

  async getLancamento(id: string): Promise<Lancamento> {
    return api.get<Lancamento>(`/contabil/lancamentos/${id}`)
  },

  async createLancamento(data: CreateLancamentoData): Promise<Lancamento> {
    return api.post<Lancamento>('/contabil/lancamentos', data)
  },

  async updateLancamento(id: string, data: Partial<CreateLancamentoData>): Promise<Lancamento> {
    return api.patch<Lancamento>(`/contabil/lancamentos/${id}`, data)
  },

  async deleteLancamento(id: string): Promise<void> {
    return api.delete<void>(`/contabil/lancamentos/${id}`)
  },

  async confirmarLancamento(id: string): Promise<Lancamento> {
    return api.patch<Lancamento>(`/contabil/lancamentos/${id}/confirmar`, {})
  },

  async cancelarLancamento(id: string): Promise<Lancamento> {
    return api.patch<Lancamento>(`/contabil/lancamentos/${id}/cancelar`, {})
  },
}

// Export agrupado para facilitar importacao
export const contabilService = {
  planoContas: contaContabilService,
  centrosCusto: centroCustoService,
  lancamentos: lancamentoService,
  // Metodos de atalho para compatibilidade
  getPlanoContas: contaContabilService.getPlanoContas,
  getCentrosCusto: centroCustoService.getCentrosCusto,
  createLancamento: lancamentoService.createLancamento,
}

export default contabilService
