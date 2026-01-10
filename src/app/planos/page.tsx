'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Check,
  X,
  ArrowRight,
  Star,
  Users,
  Building2,
  Zap,
  Shield,
  Headphones,
  BarChart3,
  Clock,
  Quote,
} from 'lucide-react'

type PlanType = 'TRIAL' | 'BASICO' | 'PROFISSIONAL' | 'ENTERPRISE'

interface UserInfo {
  id: string
  email: string
  tenant?: {
    id: string
    plano: PlanType
    nome: string
  }
}

const planos = [
  {
    id: 'BASICO',
    nome: 'Básico',
    preco: 97,
    precoAnual: 970,
    descricao: 'Ideal para pequenas empresas iniciando sua gestão financeira',
    destaque: false,
    recursos: {
      usuarios: 5,
      contasBancarias: 5,
      projetos: 3,
      analisesIA: 10,
    },
    funcionalidades: [
      { nome: 'Dashboard financeiro', incluido: true },
      { nome: 'Contas a pagar e receber', incluido: true },
      { nome: 'Fluxo de caixa', incluido: true },
      { nome: 'Cadastro de clientes/fornecedores', incluido: true },
      { nome: 'Relatórios básicos', incluido: true },
      { nome: 'Suporte por e-mail', incluido: true },
      { nome: 'Análises com IA', incluido: true, limite: '10/mês' },
      { nome: 'Módulo contábil', incluido: false },
      { nome: 'Módulo de consultoria', incluido: false },
      { nome: 'OKRs e processos', incluido: false },
      { nome: 'API de integração', incluido: false },
      { nome: 'Suporte prioritário', incluido: false },
    ],
  },
  {
    id: 'PROFISSIONAL',
    nome: 'Profissional',
    preco: 197,
    precoAnual: 1970,
    descricao: 'Para empresas em crescimento que precisam de mais recursos',
    destaque: true,
    recursos: {
      usuarios: 15,
      contasBancarias: 10,
      projetos: 10,
      analisesIA: 50,
    },
    funcionalidades: [
      { nome: 'Dashboard financeiro', incluido: true },
      { nome: 'Contas a pagar e receber', incluido: true },
      { nome: 'Fluxo de caixa', incluido: true },
      { nome: 'Cadastro de clientes/fornecedores', incluido: true },
      { nome: 'Relatórios avançados', incluido: true },
      { nome: 'Suporte por e-mail e chat', incluido: true },
      { nome: 'Análises com IA', incluido: true, limite: '50/mês' },
      { nome: 'Módulo contábil', incluido: true },
      { nome: 'Módulo de consultoria', incluido: true },
      { nome: 'OKRs e processos', incluido: true },
      { nome: 'API de integração', incluido: false },
      { nome: 'Suporte prioritário', incluido: false },
    ],
  },
  {
    id: 'ENTERPRISE',
    nome: 'Enterprise',
    preco: null,
    precoAnual: null,
    descricao: 'Solução completa para grandes empresas com necessidades específicas',
    destaque: false,
    recursos: {
      usuarios: -1,
      contasBancarias: -1,
      projetos: -1,
      analisesIA: -1,
    },
    funcionalidades: [
      { nome: 'Dashboard financeiro', incluido: true },
      { nome: 'Contas a pagar e receber', incluido: true },
      { nome: 'Fluxo de caixa', incluido: true },
      { nome: 'Cadastro de clientes/fornecedores', incluido: true },
      { nome: 'Relatórios personalizados', incluido: true },
      { nome: 'Suporte dedicado 24/7', incluido: true },
      { nome: 'Análises com IA', incluido: true, limite: 'Ilimitado' },
      { nome: 'Módulo contábil', incluido: true },
      { nome: 'Módulo de consultoria', incluido: true },
      { nome: 'OKRs e processos', incluido: true },
      { nome: 'API de integração', incluido: true },
      { nome: 'Suporte prioritário', incluido: true },
    ],
  },
]

const comparativoDetalhado = [
  {
    categoria: 'Gestão Financeira',
    itens: [
      { nome: 'Dashboard financeiro', basico: true, profissional: true, enterprise: true },
      { nome: 'Contas a pagar', basico: true, profissional: true, enterprise: true },
      { nome: 'Contas a receber', basico: true, profissional: true, enterprise: true },
      { nome: 'Fluxo de caixa diário', basico: true, profissional: true, enterprise: true },
      { nome: 'Conciliação bancária', basico: false, profissional: true, enterprise: true },
      { nome: 'Multi-moedas', basico: false, profissional: false, enterprise: true },
    ],
  },
  {
    categoria: 'Relatórios',
    itens: [
      { nome: 'Relatórios básicos', basico: true, profissional: true, enterprise: true },
      { nome: 'Relatórios avançados', basico: false, profissional: true, enterprise: true },
      { nome: 'Relatórios personalizados', basico: false, profissional: false, enterprise: true },
      { nome: 'Exportação PDF/Excel', basico: true, profissional: true, enterprise: true },
      { nome: 'Agendamento de relatórios', basico: false, profissional: true, enterprise: true },
    ],
  },
  {
    categoria: 'Inteligência Artificial',
    itens: [
      { nome: 'Análises financeiras com IA', basico: '10/mês', profissional: '50/mês', enterprise: 'Ilimitado' },
      { nome: 'Previsões de fluxo de caixa', basico: false, profissional: true, enterprise: true },
      { nome: 'Alertas inteligentes', basico: false, profissional: true, enterprise: true },
      { nome: 'Recomendações personalizadas', basico: false, profissional: false, enterprise: true },
    ],
  },
  {
    categoria: 'Módulos Adicionais',
    itens: [
      { nome: 'Módulo contábil', basico: false, profissional: true, enterprise: true },
      { nome: 'Módulo de consultoria', basico: false, profissional: true, enterprise: true },
      { nome: 'OKRs e processos', basico: false, profissional: true, enterprise: true },
      { nome: 'Gestão de colaboradores', basico: '5 max', profissional: '15 max', enterprise: 'Ilimitado' },
    ],
  },
  {
    categoria: 'Suporte e Integrações',
    itens: [
      { nome: 'Suporte por e-mail', basico: true, profissional: true, enterprise: true },
      { nome: 'Suporte por chat', basico: false, profissional: true, enterprise: true },
      { nome: 'Suporte telefônico', basico: false, profissional: false, enterprise: true },
      { nome: 'Gerente de conta dedicado', basico: false, profissional: false, enterprise: true },
      { nome: 'API de integração', basico: false, profissional: false, enterprise: true },
      { nome: 'Webhooks', basico: false, profissional: false, enterprise: true },
    ],
  },
]

const depoimentos = [
  {
    nome: 'Carlos Silva',
    cargo: 'CEO',
    empresa: 'TechSmart Soluções',
    foto: '/avatars/avatar-1.jpg',
    depoimento: 'O BM&V transformou completamente nossa gestão financeira. Em 3 meses, reduzimos 40% do tempo gasto com controle financeiro.',
    plano: 'Profissional',
  },
  {
    nome: 'Ana Rodrigues',
    cargo: 'Diretora Financeira',
    empresa: 'Grupo Excelência',
    foto: '/avatars/avatar-2.jpg',
    depoimento: 'A análise com IA nos ajudou a identificar oportunidades de economia que não víamos antes. Excelente investimento!',
    plano: 'Enterprise',
  },
  {
    nome: 'Roberto Mendes',
    cargo: 'Contador',
    empresa: 'Mendes Contabilidade',
    foto: '/avatars/avatar-3.jpg',
    depoimento: 'Recomendo para todos os meus clientes. A integração contábil e os relatórios são impecáveis.',
    plano: 'Profissional',
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal')

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const planoAtual = user?.tenant?.plano || null

  const handleSelectPlan = (planoId: string) => {
    if (!user) {
      // Usuário não logado, redirecionar para cadastro
      router.push(`/cadastro?plano=${planoId.toLowerCase()}`)
    } else {
      // Usuário logado, redirecionar para checkout
      router.push(`/checkout/${planoId.toLowerCase()}`)
    }
  }

  const isCurrentPlan = (planoId: string) => {
    return planoAtual === planoId
  }

  const formatarLimite = (valor: number) => {
    if (valor === -1) return 'Ilimitado'
    return valor.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
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
            </Link>
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
              ) : user ? (
                <Link href="/dashboard">
                  <Button variant="outline">Voltar ao Dashboard</Button>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost">Entrar</Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button>Criar Conta Grátis</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bmv-primary/10 rounded-full text-bmv-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Escolha o plano ideal para sua empresa
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Planos que crescem com você
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Do pequeno empreendedor à grande empresa, temos o plano perfeito para
            transformar sua gestão financeira.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setBillingCycle('mensal')}
              className={cn(
                'px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                billingCycle === 'mensal'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              className={cn(
                'px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                billingCycle === 'anual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Anual
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planos.map((plano) => {
              const isCurrent = isCurrentPlan(plano.id)
              const preco = billingCycle === 'anual' ? plano.precoAnual : plano.preco

              return (
                <div
                  key={plano.id}
                  className={cn(
                    'relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl',
                    plano.destaque
                      ? 'border-bmv-primary scale-105 z-10'
                      : 'border-slate-200 dark:border-slate-700',
                    isCurrent && 'ring-4 ring-bmv-primary/30'
                  )}
                >
                  {/* Badge de Destaque */}
                  {plano.destaque && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1.5 bg-bmv-primary text-white text-sm font-semibold rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star className="h-4 w-4 fill-current" />
                        Mais Popular
                      </div>
                    </div>
                  )}

                  {/* Badge Plano Atual */}
                  {isCurrent && (
                    <div className="absolute -top-4 right-4">
                      <div className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Seu Plano
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {plano.nome}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {plano.descricao}
                      </p>
                    </div>

                    {/* Preço */}
                    <div className="text-center mb-8">
                      {preco !== null ? (
                        <>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-slate-500 text-lg">R$</span>
                            <span className="text-5xl font-bold text-slate-900 dark:text-white">
                              {preco}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm mt-1">
                            /{billingCycle === 'anual' ? 'ano' : 'mês'}
                          </p>
                          {billingCycle === 'anual' && plano.preco && (
                            <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                              Economia de R$ {(plano.preco * 12) - plano.precoAnual!}/ano
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-slate-900 dark:text-white">
                            Personalizado
                          </span>
                          <p className="text-slate-500 text-sm mt-1">
                            Fale com nosso time
                          </p>
                        </>
                      )}
                    </div>

                    {/* Recursos */}
                    <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <div className="text-center">
                        <Users className="h-5 w-5 mx-auto text-bmv-primary mb-1" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatarLimite(plano.recursos.usuarios)}
                        </p>
                        <p className="text-xs text-slate-500">Usuários</p>
                      </div>
                      <div className="text-center">
                        <Building2 className="h-5 w-5 mx-auto text-bmv-primary mb-1" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatarLimite(plano.recursos.contasBancarias)}
                        </p>
                        <p className="text-xs text-slate-500">Contas</p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="h-5 w-5 mx-auto text-bmv-primary mb-1" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatarLimite(plano.recursos.projetos)}
                        </p>
                        <p className="text-xs text-slate-500">Projetos</p>
                      </div>
                      <div className="text-center">
                        <Zap className="h-5 w-5 mx-auto text-bmv-primary mb-1" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatarLimite(plano.recursos.analisesIA)}
                        </p>
                        <p className="text-xs text-slate-500">Análises IA</p>
                      </div>
                    </div>

                    {/* Funcionalidades */}
                    <ul className="space-y-3 mb-8">
                      {plano.funcionalidades.map((func) => (
                        <li
                          key={func.nome}
                          className={cn(
                            'flex items-center gap-3 text-sm',
                            func.incluido
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-500'
                          )}
                        >
                          {func.incluido ? (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                          )}
                          <span>
                            {func.nome}
                            {func.limite && (
                              <span className="ml-1 text-xs text-slate-500">
                                ({func.limite})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(plano.id)}
                      disabled={isCurrent}
                      className={cn(
                        'w-full h-12 text-base font-semibold transition-all',
                        plano.destaque
                          ? 'bg-bmv-primary hover:bg-bmv-secondary'
                          : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100',
                        isCurrent && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isCurrent ? (
                        'Plano Atual'
                      ) : plano.preco === null ? (
                        'Falar com Vendas'
                      ) : (
                        <>
                          {user ? 'Fazer Upgrade' : 'Começar Agora'}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparativo Detalhado */}
      <section className="py-16 bg-white dark:bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Compare todos os recursos
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Veja em detalhes o que cada plano oferece para sua empresa
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-6 text-left text-slate-600 dark:text-slate-400 font-medium">
                    Recurso
                  </th>
                  <th className="py-4 px-6 text-center text-slate-900 dark:text-white font-semibold">
                    Básico
                  </th>
                  <th className="py-4 px-6 text-center text-bmv-primary font-semibold bg-bmv-primary/5">
                    Profissional
                  </th>
                  <th className="py-4 px-6 text-center text-slate-900 dark:text-white font-semibold">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparativoDetalhado.map((categoria) => (
                  <>
                    <tr key={categoria.categoria} className="bg-slate-50 dark:bg-slate-900/50">
                      <td
                        colSpan={4}
                        className="py-3 px-6 font-semibold text-slate-900 dark:text-white"
                      >
                        {categoria.categoria}
                      </td>
                    </tr>
                    {categoria.itens.map((item) => (
                      <tr
                        key={item.nome}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-6 text-slate-700 dark:text-slate-300">
                          {item.nome}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {typeof item.basico === 'boolean' ? (
                            item.basico ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {item.basico}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center bg-bmv-primary/5">
                          {typeof item.profissional === 'boolean' ? (
                            item.profissional ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {item.profissional}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {typeof item.enterprise === 'boolean' ? (
                            item.enterprise ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {item.enterprise}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Mais de 500 empresas já transformaram sua gestão com o BM&V
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {depoimentos.map((depoimento) => (
              <div
                key={depoimento.nome}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 relative"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-bmv-primary/20" />
                <p className="text-slate-700 dark:text-slate-300 mb-6 relative z-10">
                  &ldquo;{depoimento.depoimento}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-bmv-primary to-bmv-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {depoimento.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {depoimento.nome}
                    </p>
                    <p className="text-sm text-slate-500">
                      {depoimento.cargo} - {depoimento.empresa}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-bmv-primary font-medium">
                    Plano {depoimento.plano}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Garantias */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="p-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-bmv-primary" />
              <h3 className="text-xl font-semibold mb-2">Garantia de 7 dias</h3>
              <p className="text-slate-400 text-sm">
                Teste sem compromisso. Se não gostar, devolvemos seu dinheiro.
              </p>
            </div>
            <div className="p-6">
              <Clock className="h-12 w-12 mx-auto mb-4 text-bmv-primary" />
              <h3 className="text-xl font-semibold mb-2">Cancele quando quiser</h3>
              <p className="text-slate-400 text-sm">
                Sem multas ou taxas de cancelamento. Você tem total liberdade.
              </p>
            </div>
            <div className="p-6">
              <Headphones className="h-12 w-12 mx-auto mb-4 text-bmv-primary" />
              <h3 className="text-xl font-semibold mb-2">Suporte especializado</h3>
              <p className="text-slate-400 text-sm">
                Nossa equipe está pronta para ajudar você a ter sucesso.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 mb-6">
              Ainda tem dúvidas? Fale com nosso time de vendas
            </p>
            <a
              href="mailto:vendas@bmvconsultoria.com.br"
              className="inline-flex items-center gap-2 text-bmv-primary hover:text-bmv-secondary transition-colors"
            >
              <Headphones className="h-5 w-5" />
              vendas@bmvconsultoria.com.br
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6 text-center text-sm text-slate-500">
          <p>&copy; 2026 BM&V Consultoria Empresarial. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
