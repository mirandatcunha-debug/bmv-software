'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  CheckCircle2,
  Building2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleLogin = () => {
    setIsRedirecting(true)
    router.push('/login')
  }

  const features = [
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Dados protegidos com criptografia de ponta',
    },
    {
      icon: Users,
      title: 'Colaboração',
      description: 'Gestão de equipes e permissões avançadas',
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Análises em tempo real para decisões estratégicas',
    },
    {
      icon: Building2,
      title: 'Multi-empresa',
      description: 'Gerencie múltiplas empresas em um só lugar',
    },
  ]

  const stats = [
    { value: '500+', label: 'Empresas' },
    { value: '10k+', label: 'Usuários' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Suporte' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogin}
              variant="ghost"
              className="text-slate-700 dark:text-slate-300 hover:text-bmv-primary"
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </Button>
            <Link href="/cadastro">
              <Button className="bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300">
                Criar Conta Grátis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bmv-primary/10 rounded-full text-bmv-primary text-sm font-medium mb-8">
              <CheckCircle2 className="h-4 w-4" />
              Plataforma líder em gestão empresarial
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Transforme sua gestão com
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bmv-primary to-bmv-accent"> BM&V</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up-delay">
              Plataforma completa para controle de processos, gestão de equipes
              e análise de performance empresarial.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-2">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 px-8 h-14 text-lg shadow-lg hover:shadow-xl"
                >
                  Começar Grátis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button
                onClick={handleLogin}
                variant="outline"
                size="lg"
                className="px-8 h-14 text-lg border-2"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Fale Conosco'
                )}
              </Button>
            </div>

            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 animate-fade-in-up-delay-3">
              7 dias grátis • Sem cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-bmv-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "text-center text-white animate-fade-in-up",
                  index === 1 && "animate-fade-in-up-delay",
                  index === 2 && "animate-fade-in-up-delay-2",
                  index === 3 && "animate-fade-in-up-delay-3"
                )}
              >
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Ferramentas poderosas para impulsionar a produtividade da sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 animate-fade-in-up",
                  index === 1 && "animate-fade-in-up-delay",
                  index === 2 && "animate-fade-in-up-delay-2",
                  index === 3 && "animate-fade-in-up-delay-3"
                )}
              >
                <div className="w-14 h-14 bg-bmv-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-bmv-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-bmv-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-bmv-primary to-bmv-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar sua gestão?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Junte-se a mais de 500 empresas que já confiam na BM&V para impulsionar seus resultados.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-8">
            <CheckCircle2 className="h-4 w-4" />
            Teste grátis por 7 dias • Sem cartão de crédito
          </div>
          <div>
            <Link href="/cadastro">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-bmv-primary hover:bg-slate-100 px-10 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Começar Grátis Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="BM&V Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-lg">BM&V Consultoria</span>
                <p className="text-white/60 text-sm">Gestão empresarial inteligente</p>
              </div>
            </div>
            <div className="text-white/60 text-sm">
              &copy; 2026 BM&V Consultoria. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
