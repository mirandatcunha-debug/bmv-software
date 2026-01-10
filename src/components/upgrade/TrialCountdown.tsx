'use client'

import { Clock, AlertTriangle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TrialCountdownProps {
  dataExpiracao: Date | string
  className?: string
  compact?: boolean
}

function calcularDiasRestantes(dataExpiracao: Date | string): number {
  const expiracao = new Date(dataExpiracao)
  const agora = new Date()
  const diffTime = expiracao.getTime() - agora.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export function TrialCountdown({ dataExpiracao, className, compact = false }: TrialCountdownProps) {
  const diasRestantes = calcularDiasRestantes(dataExpiracao)
  const isUrgente = diasRestantes <= 3
  const isExpirado = diasRestantes === 0

  if (isExpirado) {
    return (
      <div
        className={cn(
          'rounded-lg border border-red-200 bg-red-50 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-800">Trial Expirado</h4>
            <p className="mt-1 text-sm text-red-700">
              Seu período de teste terminou. Assine agora para continuar usando.
            </p>
            <Button asChild size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
              <Link href="/planos">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Assinar Agora
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2',
          isUrgente ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
          className
        )}
      >
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'} restantes
        </span>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className={cn(
            'ml-auto h-7 px-2 text-xs',
            isUrgente ? 'text-red-700 hover:bg-red-200' : 'text-blue-700 hover:bg-blue-200'
          )}
        >
          <Link href="/planos">Assinar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isUrgente
          ? 'border-red-200 bg-gradient-to-r from-red-50 to-orange-50'
          : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'rounded-full p-2',
            isUrgente ? 'bg-red-100' : 'bg-blue-100'
          )}
        >
          {isUrgente ? (
            <AlertTriangle className={cn('h-5 w-5', 'text-red-600')} />
          ) : (
            <Clock className={cn('h-5 w-5', 'text-blue-600')} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'font-semibold',
                isUrgente ? 'text-red-800' : 'text-blue-800'
              )}
            >
              Trial Gratuito
            </h4>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-bold',
                isUrgente
                  ? 'bg-red-200 text-red-800'
                  : 'bg-blue-200 text-blue-800'
              )}
            >
              {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          <p
            className={cn(
              'mt-1 text-sm',
              isUrgente ? 'text-red-700' : 'text-blue-700'
            )}
          >
            {isUrgente
              ? 'Seu período de teste está acabando! Assine para não perder acesso.'
              : 'Aproveite todos os recursos durante o período de teste.'}
          </p>

          <Button
            asChild
            size="sm"
            className={cn(
              'mt-3',
              isUrgente
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            <Link href="/planos">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Assinar Agora
            </Link>
          </Button>
        </div>

        {isUrgente && (
          <div className="hidden sm:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl font-bold text-red-600">{diasRestantes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
