// Serviço para o módulo OKR

import { api } from './api'
import type { Objetivo, KeyResult, StatusOKR, PeriodoTipo } from '@/types/okr'

// Tipos para filtros e criação
export interface FiltrosObjetivo {
  status?: StatusOKR
  donoId?: string
  trimestre?: string
  ano?: number
  periodoTipo?: PeriodoTipo
  busca?: string
  page?: number
  limit?: number
}

export interface CreateObjetivoData {
  titulo: string
  descricao: string
  donoId: string
  periodoTipo: PeriodoTipo
  trimestre?: string
  ano?: number
  dataInicio?: string
  dataFim?: string
}

export interface UpdateObjetivoData extends Partial<CreateObjetivoData> {
  status?: StatusOKR
}

export interface CreateKeyResultData {
  objetivoId: string
  titulo: string
  metrica: string
  baseline: number
  meta: number
  atual?: number
  peso?: number
}

export interface UpdateKeyResultData extends Partial<CreateKeyResultData> {
  atual?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Serviço de Objetivos
export const objetivoService = {
  async getObjetivos(filtros?: FiltrosObjetivo): Promise<PaginatedResponse<Objetivo>> {
    const params: Record<string, string | number | boolean | undefined> = {}

    if (filtros) {
      if (filtros.status) params.status = filtros.status
      if (filtros.donoId) params.donoId = filtros.donoId
      if (filtros.trimestre) params.trimestre = filtros.trimestre
      if (filtros.ano) params.ano = filtros.ano
      if (filtros.periodoTipo) params.periodoTipo = filtros.periodoTipo
      if (filtros.busca) params.busca = filtros.busca
      if (filtros.page) params.page = filtros.page
      if (filtros.limit) params.limit = filtros.limit
    }

    return api.get<PaginatedResponse<Objetivo>>('/okr/objetivos', params)
  },

  async getObjetivo(id: string): Promise<Objetivo> {
    return api.get<Objetivo>(`/okr/objetivos/${id}`)
  },

  async createObjetivo(data: CreateObjetivoData): Promise<Objetivo> {
    return api.post<Objetivo>('/okr/objetivos', data)
  },

  async updateObjetivo(id: string, data: UpdateObjetivoData): Promise<Objetivo> {
    return api.patch<Objetivo>(`/okr/objetivos/${id}`, data)
  },

  async deleteObjetivo(id: string): Promise<void> {
    return api.delete<void>(`/okr/objetivos/${id}`)
  },
}

// Serviço de Key Results
export const keyResultService = {
  async getKeyResults(objetivoId: string): Promise<KeyResult[]> {
    return api.get<KeyResult[]>(`/okr/objetivos/${objetivoId}/key-results`)
  },

  async getKeyResult(id: string): Promise<KeyResult> {
    return api.get<KeyResult>(`/okr/key-results/${id}`)
  },

  async createKeyResult(data: CreateKeyResultData): Promise<KeyResult> {
    return api.post<KeyResult>('/okr/key-results', data)
  },

  async updateKeyResult(id: string, data: UpdateKeyResultData): Promise<KeyResult> {
    return api.patch<KeyResult>(`/okr/key-results/${id}`, data)
  },

  async deleteKeyResult(id: string): Promise<void> {
    return api.delete<void>(`/okr/key-results/${id}`)
  },

  async atualizarProgresso(id: string, valor: number): Promise<KeyResult> {
    return api.patch<KeyResult>(`/okr/key-results/${id}/progresso`, { atual: valor })
  },
}

// Export agrupado para facilitar importação
export const okrService = {
  objetivos: objetivoService,
  keyResults: keyResultService,
}

export default okrService
