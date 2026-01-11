'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOnboardingSteps, type OnboardingStepData } from '@/lib/onboarding-steps'

interface OnboardingStatus {
  completou: boolean
  dataHora: string
}

interface OnboardingData {
  [moduloId: string]: OnboardingStatus
}

interface UseOnboardingReturn {
  steps: OnboardingStepData[]
  isAtivo: boolean
  jaViuTour: boolean
  completouTour: boolean
  iniciarTour: () => void
  resetarTour: () => void
  finalizarTour: (completou: boolean) => void
}

export function useOnboarding(moduloId: string): UseOnboardingReturn {
  const [isAtivo, setIsAtivo] = useState(false)
  const [jaViuTour, setJaViuTour] = useState(false)
  const [completouTour, setCompletouTour] = useState(false)
  const [mounted, setMounted] = useState(false)

  const storageKey = `tour_${moduloId}`
  const steps = getOnboardingSteps(moduloId)

  // Verificar estado do localStorage na montagem
  useEffect(() => {
    setMounted(true)

    if (typeof window === 'undefined') return

    const onboardingData: OnboardingData = JSON.parse(
      localStorage.getItem('bmv_onboarding') || '{}'
    )

    const statusModulo = onboardingData[storageKey]

    if (statusModulo) {
      setJaViuTour(true)
      setCompletouTour(statusModulo.completou)
    }
  }, [storageKey])

  const iniciarTour = useCallback(() => {
    setIsAtivo(true)
  }, [])

  const resetarTour = useCallback(() => {
    if (typeof window === 'undefined') return

    const onboardingData: OnboardingData = JSON.parse(
      localStorage.getItem('bmv_onboarding') || '{}'
    )

    delete onboardingData[storageKey]
    localStorage.setItem('bmv_onboarding', JSON.stringify(onboardingData))

    setJaViuTour(false)
    setCompletouTour(false)
    setIsAtivo(true)
  }, [storageKey])

  const finalizarTour = useCallback((completou: boolean) => {
    if (typeof window === 'undefined') return

    const onboardingData: OnboardingData = JSON.parse(
      localStorage.getItem('bmv_onboarding') || '{}'
    )

    onboardingData[storageKey] = {
      completou,
      dataHora: new Date().toISOString()
    }

    localStorage.setItem('bmv_onboarding', JSON.stringify(onboardingData))

    setJaViuTour(true)
    setCompletouTour(completou)
    setIsAtivo(false)
  }, [storageKey])

  return {
    steps,
    isAtivo: mounted && isAtivo,
    jaViuTour,
    completouTour,
    iniciarTour,
    resetarTour,
    finalizarTour
  }
}

// Hook para resetar todos os tours
export function useResetAllOnboarding() {
  const resetarTodos = useCallback(() => {
    if (typeof window === 'undefined') return

    localStorage.removeItem('bmv_onboarding')
    // Força reload para aplicar mudanças
    window.location.reload()
  }, [])

  return { resetarTodos }
}

// Hook para resetar tour de um módulo específico
export function useResetModuloOnboarding() {
  const resetarModulo = useCallback((moduloId: string) => {
    if (typeof window === 'undefined') return

    const storageKey = `tour_${moduloId}`
    const onboardingData: OnboardingData = JSON.parse(
      localStorage.getItem('bmv_onboarding') || '{}'
    )

    delete onboardingData[storageKey]
    localStorage.setItem('bmv_onboarding', JSON.stringify(onboardingData))
  }, [])

  return { resetarModulo }
}
