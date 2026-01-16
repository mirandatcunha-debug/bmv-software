'use client'
import { useState, useEffect } from 'react'
import { Clock, X, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export function TrialBanner() {
  const [status, setStatus] = useState<any>(null)
  const [fechado, setFechado] = useState(false)

  useEffect(() => {
    const fechadoHoje = sessionStorage.getItem('trialBannerFechado')
    if (fechadoHoje === new Date().toDateString()) {
      setFechado(true)
      return
    }

    fetch('/api/trial/status')
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(() => {})
  }, [])

  const fechar = () => {
    sessionStorage.setItem('trialBannerFechado', new Date().toDateString())
    setFechado(true)
  }

  if (fechado || !status?.emTrial) return null

  const urgente = status.diasRestantes <= 3
  const alerta = status.diasRestantes <= 7

  if (status.expirado) {
    return (
      <div className="bg-red-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span>
              <strong>Seu período de teste expirou!</strong> Escolha um plano para continuar.
            </span>
          </div>
          <Link
            href="/planos"
            className="px-4 py-1 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50"
          >
            Ver Planos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`px-4 py-2 ${
      urgente ? 'bg-red-500' : alerta ? 'bg-orange-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'
    } text-white`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>
              <strong>Trial:</strong> {status.diasRestantes} dias restantes
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              IA: {status.uso?.ia?.restantes}/{status.uso?.ia?.limite} hoje
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/planos"
            className="px-4 py-1 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 text-sm"
          >
            Fazer Upgrade
          </Link>
          <button onClick={fechar} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
