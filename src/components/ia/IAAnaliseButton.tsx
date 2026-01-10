'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, Loader2, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type TipoAnalise = 'financeiro' | 'fluxo_caixa' | 'orcamento' | 'previsao' | 'geral'

interface IAStatus {
  analisesHoje: number
  limite: number
  ilimitado: boolean
  percentual: number
  atingiuLimite: boolean
  resetaEm: string
  plano: string
}

interface IAAnaliseButtonProps {
  tipo?: TipoAnalise
  onAnaliseCompleta?: (analise: unknown) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function IAAnaliseButton({
  tipo = 'geral',
  onAnaliseCompleta,
  className,
  variant = 'default',
  size = 'default'
}: IAAnaliseButtonProps) {
  const [status, setStatus] = useState<IAStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar status de uso
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true)
      const response = await fetch('/api/ia/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch {
      console.error('Erro ao buscar status IA')
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleClick = async () => {
    // Verificar se atingiu limite antes de tentar
    if (status?.atingiuLimite) {
      setShowUpgradeModal(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ia/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      })

      const data = await response.json()

      if (response.status === 429) {
        // Limite atingido
        setShowUpgradeModal(true)
        setStatus(prev => prev ? { ...prev, atingiuLimite: true } : null)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar análise')
      }

      // Atualizar status local
      if (data.uso) {
        setStatus(prev => prev ? {
          ...prev,
          analisesHoje: data.uso.analisesHoje,
          percentual: prev.ilimitado ? 0 : Math.round((data.uso.analisesHoje / prev.limite) * 100)
        } : null)
      }

      // Callback com resultado
      onAnaliseCompleta?.(data.analise)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar análise')
    } finally {
      setLoading(false)
    }
  }

  const getContadorTexto = () => {
    if (loadingStatus || !status) return ''
    if (status.ilimitado) return 'Ilimitado'
    return `${status.analisesHoje}/${status.limite}`
  }

  const getContadorCor = () => {
    if (!status || status.ilimitado) return 'text-muted-foreground'
    if (status.percentual >= 100) return 'text-red-500'
    if (status.percentual >= 80) return 'text-yellow-500'
    return 'text-muted-foreground'
  }

  return (
    <>
      <div className={cn('inline-flex flex-col items-end gap-1', className)}>
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={loading || loadingStatus}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar Análise IA
            </>
          )}
        </Button>

        {!loadingStatus && status && (
          <span className={cn('text-xs', getContadorCor())}>
            {getContadorTexto()} análises hoje
          </span>
        )}

        {error && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </span>
        )}
      </div>

      {/* Modal de Upgrade */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Limite de Análises Atingido
            </DialogTitle>
            <DialogDescription>
              Você utilizou todas as {status?.limite} análises IA disponíveis no seu plano {status?.plano} hoje.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <p className="text-sm">
                Faça upgrade do seu plano para ter acesso a mais análises diárias:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-medium">Básico:</span>
                  <span className="text-muted-foreground">10 análises/dia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Profissional:</span>
                  <span className="text-muted-foreground">50 análises/dia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Enterprise:</span>
                  <span className="text-muted-foreground">Ilimitado</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Seu limite será resetado à meia-noite.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Fechar
            </Button>
            <Button onClick={() => window.location.href = '/configuracoes/plano'}>
              <Zap className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
