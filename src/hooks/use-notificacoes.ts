'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Notificacao, NotificacoesResponse } from '@/types/notificacoes'

interface UseNotificacoesReturn {
  notificacoes: Notificacao[]
  naoLidas: number
  total: number
  loading: boolean
  error: string | null
  recarregar: () => Promise<void>
  marcarComoLida: (id: string) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  excluir: (id: string) => Promise<void>
}

export function useNotificacoes(): UseNotificacoesReturn {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar notificações
  const recarregar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notificacoes')

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }

      const data: NotificacoesResponse = await response.json()
      setNotificacoes(data.notificacoes)
    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar uma notificação como lida
  const marcarComoLida = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lida: true })
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida')
      }

      // Atualizar estado local
      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      )
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
      throw err
    }
  }, [])

  // Marcar todas como lidas
  const marcarTodasComoLidas = useCallback(async () => {
    try {
      const response = await fetch('/api/notificacoes', {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar notificações como lidas')
      }

      // Atualizar estado local
      setNotificacoes(prev =>
        prev.map(n => ({ ...n, lida: true }))
      )
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err)
      throw err
    }
  }, [])

  // Excluir notificação
  const excluir = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir notificação')
      }

      // Remover do estado local
      setNotificacoes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Erro ao excluir notificação:', err)
      throw err
    }
  }, [])

  // Contador de não lidas
  const naoLidas = useMemo(() =>
    notificacoes.filter(n => !n.lida).length,
    [notificacoes]
  )

  // Total de notificações
  const total = useMemo(() => notificacoes.length, [notificacoes])

  // Carregar notificações ao montar
  useEffect(() => {
    recarregar()
  }, [recarregar])

  // Configurar polling para atualizar periodicamente (a cada 60 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      recarregar()
    }, 60000) // 60 segundos

    return () => clearInterval(interval)
  }, [recarregar])

  return {
    notificacoes,
    naoLidas,
    total,
    loading,
    error,
    recarregar,
    marcarComoLida,
    marcarTodasComoLidas,
    excluir
  }
}
