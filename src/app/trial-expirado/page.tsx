'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  BarChart3,
  Users,
  Shield,
  Zap,
} from 'lucide-react'

export default function TrialExpiradoPage() {
  const benefits = [
    {
      icon: BarChart3,
      title: 'Relatórios Completos',
      description: 'Acesso a todos os relatórios e análises financeiras',
    },
    {
      icon: Users,
      title: 'Usuários Ilimitados',
      description: 'Adicione toda sua equipe sem custo adicional',
    },
    {
      icon: Shield,
      title: 'Módulos Premium',
      description: 'Consultoria, Contábil, Processos e muito mais',
    },
    {
      icon: Zap,
      title: 'Suporte Prioritário',
      description: 'Atendimento rápido e dedicado para sua empresa',
    },
  ]

  const whatsappNumber = '5511999999999'
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre os planos do BM&V.')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
            <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Seu período de teste terminou
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8">
            Os 7 dias de avaliação gratuita chegaram ao fim. Para continuar
            utilizando todas as funcionalidades do BM&V, escolha um dos nossos planos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/planos">
              <Button
                size="lg"
                className="bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 px-8 h-14 text-lg shadow-lg hover:shadow-xl"
              >
                Assinar Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-14 text-lg border-2"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Falar com Comercial
              </Button>
            </a>
          </div>

          <Link
            href="/"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-bmv-primary transition-colors"
          >
            Voltar para a página inicial
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
            O que você terá ao assinar
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-bmv-primary/10 rounded-xl flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-bmv-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Garantia de 30 dias - Cancele quando quiser</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Dúvidas? Entre em contato pelo email{' '}
            <a
              href="mailto:contato@bmvconsultoria.com.br"
              className="text-bmv-primary hover:underline"
            >
              contato@bmvconsultoria.com.br
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
