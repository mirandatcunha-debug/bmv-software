'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Building2,
  Calendar,
  UserPlus,
  ArrowRight,
  ClipboardList,
} from 'lucide-react'

const cadastrosItems = [
  {
    title: 'Clientes',
    description: 'Gerencie seus clientes e contatos',
    href: '/cadastros/clientes',
    icon: Users,
    iconColor: 'from-blue-500 to-blue-600',
    hoverBorder: 'hover:border-blue-500/50',
    hoverShadow: 'hover:shadow-blue-500/10',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    badge: 'Ativo',
  },
  {
    title: 'Fornecedores',
    description: 'Cadastro de fornecedores e parceiros',
    href: '/cadastros/fornecedores',
    icon: Building2,
    iconColor: 'from-purple-500 to-purple-600',
    hoverBorder: 'hover:border-purple-500/50',
    hoverShadow: 'hover:shadow-purple-500/10',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    badge: 'Em breve',
    disabled: true,
  },
]

export default function CadastrosPage() {
  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Titulo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Cadastros</h1>
                <p className="text-indigo-100 text-sm md:text-base">
                  Gerencie clientes, fornecedores e outros cadastros
                </p>
              </div>
            </div>
          </div>

          {/* Mini cards de resumo no header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-indigo-200" />
                <span className="text-xs text-indigo-200">Clientes</span>
              </div>
              <p className="text-base sm:text-lg font-bold">Cadastrados</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-indigo-200" />
                <span className="text-xs text-indigo-200">Fornecedores</span>
              </div>
              <p className="text-base sm:text-lg font-bold">Em breve</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-indigo-200" />
                <span className="text-xs text-indigo-200">Ultimo cadastro</span>
              </div>
              <p className="text-base sm:text-lg font-bold">Hoje</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Cadastros */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {cadastrosItems.map((item, index) => {
          const Icon = item.icon
          const cardContent = (
            <Card
              className={`relative overflow-hidden border-2 border-transparent ${item.hoverBorder} transition-all duration-300 hover:shadow-lg ${item.hoverShadow} ${!item.disabled ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-60'} animate-fade-in-up`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.iconColor.replace('from-', 'from-').replace('to-', 'to-')}/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.iconColor} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className={item.badgeClass}>
                    {item.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl mb-2 flex items-center gap-2">
                  {item.title}
                  {!item.disabled && <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />}
                </CardTitle>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          )

          if (item.disabled) {
            return (
              <div key={item.href} className="group">
                {cardContent}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="group">
              {cardContent}
            </Link>
          )
        })}
      </div>

      {/* Acoes Rapidas */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            Acoes Rapidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/cadastros/clientes/novo">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer group">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                  <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">Novo Cliente</p>
                  <p className="text-xs text-muted-foreground">Cadastrar cliente</p>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Novo Fornecedor</p>
                <p className="text-xs text-muted-foreground">Em breve</p>
              </div>
            </div>

            <Link href="/cadastros/clientes">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm group-hover:text-emerald-600 transition-colors">Listar Clientes</p>
                  <p className="text-xs text-muted-foreground">Ver todos os clientes</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
