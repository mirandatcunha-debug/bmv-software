'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  Settings,
  User,
  Building2,
  Users,
  Bell,
  Palette,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  titulo: string
  descricao: string
  href: string
  icon: React.ElementType
  cor: string
  requerGestor?: boolean
  requerAdmin?: boolean
}

const menuItems: MenuItem[] = [
  {
    titulo: 'Minha Conta',
    descricao: 'Gerencie suas informacoes pessoais e senha',
    href: '/configuracoes/conta',
    icon: User,
    cor: 'bg-bmv-primary/10 text-bmv-primary',
  },
  {
    titulo: 'Minha Empresa',
    descricao: 'Configure os dados da sua empresa',
    href: '/configuracoes/empresa',
    icon: Building2,
    cor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    requerGestor: true,
  },
  {
    titulo: 'Usuarios',
    descricao: 'Gerencie os usuarios da empresa',
    href: '/configuracoes/usuarios',
    icon: Users,
    cor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    requerGestor: true,
  },
  {
    titulo: 'Notificacoes',
    descricao: 'Configure suas preferencias de notificacao',
    href: '/configuracoes/notificacoes',
    icon: Bell,
    cor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    titulo: 'Aparencia',
    descricao: 'Personalize o tema e visual do sistema',
    href: '/configuracoes/aparencia',
    icon: Palette,
    cor: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  },
]

export default function ConfiguracoesPage() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.perfil)
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
      }
    }
    fetchUserRole()
  }, [])

  const canManage = ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(userRole || '')

  const visibleItems = menuItems.filter((item) => {
    if (item.requerGestor && !canManage) return false
    if (item.requerAdmin && !['ADMIN_BMV'].includes(userRole || '')) return false
    return true
  })

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-7 w-7 text-bmv-primary" />
          Configuracoes
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas preferencias e configuracoes do sistema
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="card-hover cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-3 rounded-lg', item.cor)}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.descricao}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info sobre permissoes */}
      {canManage && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Voce tem acesso de administrador
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Pode gerenciar usuarios e configuracoes da empresa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
