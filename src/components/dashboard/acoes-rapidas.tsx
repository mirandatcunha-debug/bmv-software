'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Plus,
  DollarSign,
  Receipt,
  CheckSquare,
  BarChart3,
  Calendar,
  Bell,
  FileText,
  Zap,
} from 'lucide-react'

interface AcoesRapidasProps {
  perfil?: string
}

interface AcaoRapida {
  id: string
  titulo: string
  descricao: string
  href: string
  icon: typeof Plus
  iconColor: string
  bgColor: string
  borderColor: string
  hoverColor: string
  restrito?: boolean
}

const acoes: AcaoRapida[] = [
  {
    id: 'nova-receita',
    titulo: 'Nova Receita',
    descricao: 'Registrar entrada',
    href: '/financeiro/movimentacoes/nova?tipo=RECEITA',
    icon: DollarSign,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-300',
    restrito: true,
  },
  {
    id: 'nova-despesa',
    titulo: 'Nova Despesa',
    descricao: 'Registrar saida',
    href: '/financeiro/movimentacoes/nova?tipo=DESPESA',
    icon: Receipt,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300',
    restrito: true,
  },
  {
    id: 'nova-tarefa',
    titulo: 'Nova Tarefa',
    descricao: 'Criar atividade',
    href: '/processos/okr',
    icon: CheckSquare,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300',
  },
  {
    id: 'ver-relatorios',
    titulo: 'Relatorios',
    descricao: 'Analise completa',
    href: '/financeiro',
    icon: BarChart3,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300',
    restrito: true,
  },
  {
    id: 'agenda',
    titulo: 'Agenda',
    descricao: 'Ver compromissos',
    href: '/processos/okr',
    icon: Calendar,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300',
  },
  {
    id: 'fluxo-caixa',
    titulo: 'Fluxo de Caixa',
    descricao: 'Visao detalhada',
    href: '/financeiro/fluxo-caixa',
    icon: FileText,
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-300',
    restrito: true,
  },
]

export function AcoesRapidas({ perfil }: AcoesRapidasProps) {
  const isRestrito = perfil === 'COLABORADOR' || perfil === 'CLIENTE'

  const acoesFiltradas = isRestrito
    ? acoes.filter(acao => !acao.restrito)
    : acoes

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-bmv-primary/10">
            <Zap className="h-4 w-4 text-bmv-primary" />
          </div>
          <span>Acoes Rapidas</span>
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            Acesse funcionalidades com um clique
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {acoesFiltradas.map((acao, index) => {
            const Icon = acao.icon
            return (
              <Link
                key={acao.id}
                href={acao.href}
                className="block"
              >
                <div
                  className={cn(
                    'group p-4 rounded-xl border-2 transition-all duration-300',
                    'hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]',
                    'animate-fade-in-up cursor-pointer',
                    acao.bgColor,
                    acao.borderColor,
                    acao.hoverColor
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Icone grande */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                    'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                    'bg-white dark:bg-slate-800 shadow-sm'
                  )}>
                    <Icon className={cn('h-5 w-5', acao.iconColor)} />
                  </div>

                  {/* Titulo e descricao */}
                  <h3 className={cn(
                    'font-semibold text-sm mb-0.5 transition-colors',
                    'text-slate-900 dark:text-slate-100',
                    'group-hover:text-bmv-primary'
                  )}>
                    {acao.titulo}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {acao.descricao}
                  </p>

                  {/* Indicador de acao */}
                  <div className={cn(
                    'mt-3 flex items-center gap-1 text-xs font-medium',
                    acao.iconColor,
                    'opacity-0 group-hover:opacity-100 transition-opacity'
                  )}>
                    <Plus className="h-3 w-3" />
                    <span>Acessar</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
