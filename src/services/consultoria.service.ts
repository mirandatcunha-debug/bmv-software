// Serviço para o módulo de Consultoria

import { api } from './api'
import type { Projeto, TarefaProjeto, StatusProjeto, StatusTarefa, Prioridade } from '@/types/consultoria'

// Tipos para filtros e criação
export interface FiltrosProjeto {
  status?: StatusProjeto
  clienteId?: string
  busca?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}

export interface CreateProjetoData {
  nome: string
  descricao?: string
  clienteId?: string
  dataInicio: string
  dataFim?: string
  status?: StatusProjeto
}

export interface UpdateProjetoData extends Partial<CreateProjetoData> {}

export interface FiltrosTarefa {
  status?: StatusTarefa
  responsavelId?: string
  prioridade?: Prioridade
  busca?: string
}

export interface CreateTarefaData {
  projetoId: string
  etapaId?: string
  responsavelId: string
  titulo: string
  descricao?: string
  status?: StatusTarefa
  prioridade?: Prioridade
  prazo?: string
  requerEvidencia?: boolean
  ordem?: number
}

export interface UpdateTarefaData extends Partial<Omit<CreateTarefaData, 'projetoId'>> {}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Serviço de Projetos
export const projetoService = {
  async getProjetos(filtros?: FiltrosProjeto): Promise<PaginatedResponse<Projeto>> {
    const params: Record<string, string | number | boolean | undefined> = {}

    if (filtros) {
      if (filtros.status) params.status = filtros.status
      if (filtros.clienteId) params.clienteId = filtros.clienteId
      if (filtros.busca) params.busca = filtros.busca
      if (filtros.dataInicio) params.dataInicio = filtros.dataInicio
      if (filtros.dataFim) params.dataFim = filtros.dataFim
      if (filtros.page) params.page = filtros.page
      if (filtros.limit) params.limit = filtros.limit
    }

    return api.get<PaginatedResponse<Projeto>>('/consultoria/projetos', params)
  },

  async getProjeto(id: string): Promise<Projeto> {
    return api.get<Projeto>(`/consultoria/projetos/${id}`)
  },

  async createProjeto(data: CreateProjetoData): Promise<Projeto> {
    return api.post<Projeto>('/consultoria/projetos', data)
  },

  async updateProjeto(id: string, data: UpdateProjetoData): Promise<Projeto> {
    return api.patch<Projeto>(`/consultoria/projetos/${id}`, data)
  },

  async deleteProjeto(id: string): Promise<void> {
    return api.delete<void>(`/consultoria/projetos/${id}`)
  },
}

// Serviço de Tarefas de Projeto
export const tarefaProjetoService = {
  async getTarefas(projetoId: string, filtros?: FiltrosTarefa): Promise<TarefaProjeto[]> {
    const params: Record<string, string | number | boolean | undefined> = {}

    if (filtros) {
      if (filtros.status) params.status = filtros.status
      if (filtros.responsavelId) params.responsavelId = filtros.responsavelId
      if (filtros.prioridade) params.prioridade = filtros.prioridade
      if (filtros.busca) params.busca = filtros.busca
    }

    return api.get<TarefaProjeto[]>(`/consultoria/projetos/${projetoId}/tarefas`, params)
  },

  async getTarefa(id: string): Promise<TarefaProjeto> {
    return api.get<TarefaProjeto>(`/consultoria/tarefas/${id}`)
  },

  async createTarefa(data: CreateTarefaData): Promise<TarefaProjeto> {
    return api.post<TarefaProjeto>('/consultoria/tarefas', data)
  },

  async updateTarefa(id: string, data: UpdateTarefaData): Promise<TarefaProjeto> {
    return api.patch<TarefaProjeto>(`/consultoria/tarefas/${id}`, data)
  },

  async deleteTarefa(id: string): Promise<void> {
    return api.delete<void>(`/consultoria/tarefas/${id}`)
  },

  async moverTarefa(id: string, novoStatus: StatusTarefa): Promise<TarefaProjeto> {
    return api.patch<TarefaProjeto>(`/consultoria/tarefas/${id}/status`, { status: novoStatus })
  },

  async reordenarTarefas(projetoId: string, tarefasOrdenadas: { id: string; ordem: number }[]): Promise<void> {
    return api.patch<void>(`/consultoria/projetos/${projetoId}/tarefas/reordenar`, { tarefas: tarefasOrdenadas })
  },
}

// Export agrupado para facilitar importação
export const consultoriaService = {
  projetos: projetoService,
  tarefas: tarefaProjetoService,
}

export default consultoriaService
