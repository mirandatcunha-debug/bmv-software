'use client'

import { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import {
  Feature,
  Plano,
  hasFeature,
  getPlanoMinimo,
  NOMES_PLANOS,
  NOMES_FEATURES,
} from '@/lib/feature-flags'

interface FeatureGateProps {
  feature: Feature
  planoAtual: Plano
  children: ReactNode
  planoMinimo?: Plano
  fallback?: ReactNode
  showOverlay?: boolean
}

export function FeatureGate({
  feature,
  planoAtual,
  children,
  planoMinimo,
  fallback,
  showOverlay = true,
}: FeatureGateProps) {
  const planoNecessario = planoMinimo || getPlanoMinimo(feature)
  const temAcesso = hasFeature(planoAtual, feature)

  if (temAcesso) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showOverlay) {
    return null
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30 blur-[2px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-[1px] rounded-lg">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-4 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recurso Bloqueado
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            <strong>{NOMES_FEATURES[feature]}</strong> está disponível a partir do plano{' '}
            <strong>{NOMES_PLANOS[planoNecessario]}</strong>.
          </p>
          <Link
            href="/planos"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors text-sm font-medium"
          >
            Fazer Upgrade
          </Link>
        </div>
      </div>
    </div>
  )
}

interface FeatureButtonProps {
  feature: Feature
  planoAtual: Plano
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function FeatureButton({
  feature,
  planoAtual,
  children,
  onClick,
  className = '',
  disabled = false,
}: FeatureButtonProps) {
  const temAcesso = hasFeature(planoAtual, feature)
  const planoNecessario = getPlanoMinimo(feature)

  if (!temAcesso) {
    return (
      <Link
        href="/planos"
        className={`inline-flex items-center gap-2 opacity-60 cursor-pointer ${className}`}
        title={`Disponível no plano ${NOMES_PLANOS[planoNecessario]}`}
      >
        <Lock className="w-4 h-4" />
        {children}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

interface FeatureBadgeProps {
  feature: Feature
  planoAtual: Plano
}

export function FeatureBadge({ feature, planoAtual }: FeatureBadgeProps) {
  const temAcesso = hasFeature(planoAtual, feature)
  const planoNecessario = getPlanoMinimo(feature)

  if (temAcesso) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
      <Lock className="w-3 h-3" />
      {NOMES_PLANOS[planoNecessario]}
    </span>
  )
}
