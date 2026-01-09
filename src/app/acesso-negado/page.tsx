'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
} from 'lucide-react'

const moduleNames: Record<string, string> = {
  admin: 'Administração',
  consultoria: 'Consultoria',
  contabil: 'Contábil',
  processos: 'Processos (OKR)',
}

function AcessoNegadoContent() {
  const searchParams = useSearchParams()
  const motivo = searchParams.get('motivo')
  const modulo = searchParams.get('modulo')
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null)

  const moduloNome = modulo ? moduleNames[modulo] || modulo : 'solicitado'

  useEffect(() => {
    async function fetchTrialInfo() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.user?.tenant?.trialExpira) {
            const expira = new Date(data.user.tenant.trialExpira)
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            const diff = Math.ceil((expira.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
            setDiasRestantes(diff > 0 ? diff : 0)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar info do trial:', error)
      }
    }

    if (motivo === 'trial') {
      fetchTrialInfo()
    }
  }, [motivo])

  const trialFeatures = [
    { name: 'Dashboard', included: true },
    { name: 'Financeiro', included: true },
    { name: 'Cadastros (Clientes/Fornecedores)', included: true },
    { name: 'Configurações', included: true },
    { name: 'Administração', included: false },
    { name: 'Consultoria', included: false },
    { name: 'Contábil', included: false },
    { name: 'Processos (OKR)', included: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bmv-primary rounded-lg flex items-center justify-center shadow-md">
              <Image
                src="/logo.png"
                alt="BM&V Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl text-bmv-primary">BM&V</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <Lock className="h-10 w-10 text-slate-500 dark:text-slate-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Módulo não disponível no plano gratuito
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-4">
            O módulo <span className="font-semibold text-bmv-primary">{moduloNome}</span> está
            disponível apenas nos planos pagos do BM&V.
          </p>

          {/* Trial Days Remaining */}
          {diasRestantes !== null && diasRestantes > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <Clock className="h-4 w-4" />
              {diasRestantes} {diasRestantes === 1 ? 'dia restante' : 'dias restantes'} no seu período de teste
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/planos">
              <Button
                size="lg"
                className="bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 px-8 h-14 text-lg shadow-lg hover:shadow-xl"
              >
                Ver Planos
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/financeiro">
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-14 text-lg border-2"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Financeiro
              </Button>
            </Link>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
            Comparação: Trial vs Plano Completo
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Trial Column */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                Período de Teste (Gratuito)
              </h3>
              <ul className="space-y-3">
                {trialFeatures.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    )}
                    <span className={feature.included
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                    }>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid Column */}
            <div className="bg-bmv-primary/5 dark:bg-bmv-primary/10 rounded-xl p-6 border-2 border-bmv-primary/20">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-bmv-primary rounded-full"></span>
                Plano Completo
              </h3>
              <ul className="space-y-3">
                {trialFeatures.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-bmv-primary/20">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  + Suporte prioritário<br />
                  + Usuários ilimitados<br />
                  + Relatórios avançados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Precisa de ajuda para escolher o melhor plano?{' '}
            <a
              href="mailto:contato@bmvconsultoria.com.br"
              className="text-bmv-primary hover:underline"
            >
              Fale com nosso time
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AcessoNegadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bmv-primary"></div>
      </div>
    }>
      <AcessoNegadoContent />
    </Suspense>
  )
}
