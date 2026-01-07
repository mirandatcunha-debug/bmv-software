'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'

export default function NotFound() {
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

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-slate-200 dark:text-slate-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-bmv-primary/10 rounded-full flex items-center justify-center animate-pulse-soft">
              <Search className="w-16 h-16 text-bmv-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Página não encontrada
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          Ops! A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 px-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir para o Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="px-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Help link */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Precisa de ajuda?{' '}
            <Link href="/suporte" className="text-bmv-secondary hover:text-bmv-primary font-medium transition-colors">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
