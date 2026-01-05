'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Shield, Settings } from 'lucide-react'

const adminCards = [
  {
    title: 'Empresas',
    description: 'Gerenciar empresas cadastradas',
    href: '/admin/empresas',
    icon: Building2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    title: 'Usuarios',
    description: 'Todos os usuarios do sistema',
    href: '/admin/usuarios',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    title: 'Permissoes',
    description: 'Configurar permissoes e perfis',
    href: '/admin/permissoes',
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    title: 'Configuracoes',
    description: 'Configuracoes do sistema',
    href: '/admin/configuracoes',
    icon: Settings,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield className="h-7 w-7 text-bmv-primary" />
          Administracao
        </h1>
        <p className="text-muted-foreground">
          Gerenciamento do sistema BM&V
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-2`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Esta area e restrita a administradores do sistema BM&V.
            Aqui voce pode gerenciar empresas, usuarios e configuracoes globais.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
