'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw, AlertTriangle, MessageCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="text-center max-w-lg animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-bmv-primary rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Image
              src="/logo.png"
              alt="BM&V Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        </div>

        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-check-bounce">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Algo deu errado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-left">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={reset}
            className="bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 px-6"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Tentar novamente
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="px-6">
              <Home className="w-5 h-5 mr-2" />
              Ir para o Dashboard
            </Button>
          </Link>
        </div>

        {/* Report problem */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <MessageCircle className="w-5 h-5 text-bmv-primary" />
              <span className="font-semibold text-slate-900 dark:text-white">
                O problema persiste?
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Ajude-nos a melhorar reportando este erro.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const subject = encodeURIComponent('Erro no Sistema BM&V')
                const body = encodeURIComponent(
                  `Olá,\n\nEncontrei um erro no sistema.\n\nDetalhes do erro:\n${error.message || 'Não disponível'}\n\nDigest: ${error.digest || 'Não disponível'}\n\nDescrição do que estava fazendo:\n[Descreva aqui o que você estava fazendo quando o erro ocorreu]`
                )
                window.location.href = `mailto:suporte@bmvconsultoria.com.br?subject=${subject}&body=${body}`
              }}
            >
              Reportar problema
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
