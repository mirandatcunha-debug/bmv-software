'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { OnboardingStep } from './OnboardingStep'
import type { OnboardingStepData } from '@/lib/onboarding-steps'

interface OnboardingTourProps {
  steps: OnboardingStepData[]
  onComplete: () => void
  onSkip: () => void
  storageKey: string
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  storageKey
}: OnboardingTourProps) {
  const [passoAtual, setPassoAtual] = useState(1)
  const [isVisible, setIsVisible] = useState(true)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentStep = steps[passoAtual - 1]

  // Atualiza o destaque do elemento alvo
  useEffect(() => {
    if (!currentStep) return

    const targetElement = document.getElementById(currentStep.targetId)
    if (!targetElement) {
      setHighlightRect(null)
      return
    }

    const updateHighlight = () => {
      const rect = targetElement.getBoundingClientRect()
      setHighlightRect(rect)
    }

    updateHighlight()

    // Scroll suave até o elemento se não estiver visível
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

    window.addEventListener('resize', updateHighlight)
    window.addEventListener('scroll', updateHighlight, true)

    return () => {
      window.removeEventListener('resize', updateHighlight)
      window.removeEventListener('scroll', updateHighlight, true)
    }
  }, [currentStep])

  const salvarProgresso = useCallback((completou: boolean) => {
    if (typeof window !== 'undefined') {
      const onboardingData = JSON.parse(
        localStorage.getItem('bmv_onboarding') || '{}'
      )
      onboardingData[storageKey] = {
        completou,
        dataHora: new Date().toISOString()
      }
      localStorage.setItem('bmv_onboarding', JSON.stringify(onboardingData))
    }
  }, [storageKey])

  const handleProximo = useCallback(() => {
    if (passoAtual >= steps.length) {
      salvarProgresso(true)
      setIsVisible(false)
      onComplete()
    } else {
      setPassoAtual(passoAtual + 1)
    }
  }, [passoAtual, steps.length, salvarProgresso, onComplete])

  const handleAnterior = useCallback(() => {
    if (passoAtual > 1) {
      setPassoAtual(passoAtual - 1)
    }
  }, [passoAtual])

  const handlePular = useCallback(() => {
    salvarProgresso(false)
    setIsVisible(false)
    onSkip()
  }, [salvarProgresso, onSkip])

  if (!mounted || !isVisible || !currentStep) return null

  const overlayContent = (
    <>
      {/* Overlay escuro com buraco para o elemento destacado */}
      <div className="fixed inset-0 z-[10000] pointer-events-none">
        {/* Camadas do overlay para criar o "buraco" */}
        {highlightRect && (
          <>
            {/* Top */}
            <div
              className="absolute bg-black/60 pointer-events-auto"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: Math.max(0, highlightRect.top - 8)
              }}
              onClick={handlePular}
            />
            {/* Bottom */}
            <div
              className="absolute bg-black/60 pointer-events-auto"
              style={{
                top: highlightRect.bottom + 8,
                left: 0,
                right: 0,
                bottom: 0
              }}
              onClick={handlePular}
            />
            {/* Left */}
            <div
              className="absolute bg-black/60 pointer-events-auto"
              style={{
                top: highlightRect.top - 8,
                left: 0,
                width: Math.max(0, highlightRect.left - 8),
                height: highlightRect.height + 16
              }}
              onClick={handlePular}
            />
            {/* Right */}
            <div
              className="absolute bg-black/60 pointer-events-auto"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.right + 8,
                right: 0,
                height: highlightRect.height + 16
              }}
              onClick={handlePular}
            />
            {/* Borda de destaque ao redor do elemento */}
            <div
              className="absolute rounded-lg ring-4 ring-[#1E3A5F] ring-offset-2"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16
              }}
            />
          </>
        )}

        {/* Fallback quando não há elemento destacado */}
        {!highlightRect && (
          <div
            className="absolute inset-0 bg-black/60 pointer-events-auto"
            onClick={handlePular}
          />
        )}
      </div>

      {/* Tooltip do passo atual */}
      <OnboardingStep
        titulo={currentStep.titulo}
        descricao={currentStep.descricao}
        posicao={currentStep.posicao}
        targetId={currentStep.targetId}
        passoAtual={passoAtual}
        totalPassos={steps.length}
        onProximo={handleProximo}
        onAnterior={handleAnterior}
        onPular={handlePular}
        isFirst={passoAtual === 1}
        isLast={passoAtual === steps.length}
      />
    </>
  )

  return createPortal(overlayContent, document.body)
}
