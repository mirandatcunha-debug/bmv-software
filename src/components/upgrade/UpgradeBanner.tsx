'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Users, Brain, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type MotivoUpgrade = 'limite_usuarios' | 'limite_ia' | 'modulo_bloqueado'

interface UpgradeBannerProps {
  planoPara: string
  motivo: MotivoUpgrade
  diasRestantes?: number
}

const DISMISS_DURATION = 24 * 60 * 60 * 1000 // 24 horas em ms

const motivoConfig: Record<MotivoUpgrade, { icon: typeof Sparkles; titulo: string; descricao: string }> = {
  limite_usuarios: {
    icon: Users,
    titulo: 'Limite de Usuários Atingido',
    descricao: 'Adicione mais colaboradores à sua equipe fazendo upgrade do seu plano.',
  },
  limite_ia: {
    icon: Brain,
    titulo: 'Análises de IA Esgotadas',
    descricao: 'Desbloqueie análises ilimitadas de IA para insights mais poderosos.',
  },
  modulo_bloqueado: {
    icon: Lock,
    titulo: 'Funcionalidade Premium',
    descricao: 'Este módulo está disponível em planos superiores. Faça upgrade para acessar.',
  },
}

export function UpgradeBanner({ planoPara, motivo, diasRestantes }: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true) // Começa oculto até verificar localStorage
  const storageKey = `upgrade_banner_dismissed_${motivo}`

  useEffect(() => {
    const dismissedAt = localStorage.getItem(storageKey)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const now = Date.now()
      if (now - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true)
        return
      }
    }
    setIsDismissed(false)
  }, [storageKey])

  const handleDismiss = () => {
    localStorage.setItem(storageKey, Date.now().toString())
    setIsDismissed(true)
  }

  if (isDismissed) {
    return null
  }

  const config = motivoConfig[motivo]
  const Icon = config.icon

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-4 text-white shadow-lg">
      {/* Decoração de fundo */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <Icon className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{config.titulo}</h3>
              {diasRestantes !== undefined && diasRestantes <= 7 && (
                <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-medium text-yellow-900">
                  {diasRestantes} dias restantes
                </span>
              )}
            </div>
            <p className="text-sm text-white/90">{config.descricao}</p>

            <div className="flex items-center gap-2 pt-2">
              <Button
                asChild
                size="sm"
                className="bg-white text-purple-700 hover:bg-white/90"
              >
                <Link href="/planos">
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Ver Planos
                </Link>
              </Button>
              <span className="text-sm text-white/70">
                Recomendado: <strong>{planoPara}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Fechar banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
