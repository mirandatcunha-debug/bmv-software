'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  User,
  Building2,
  Users,
  Bell,
  Palette,
  ChevronRight,
  Shield,
  Sparkles,
  Lock,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  titulo: string
  descricao: string
  href: string
  icon: React.ElementType
  cor: string
  bgGradient: string
  requerGestor?: boolean
  requerAdmin?: boolean
  badge?: string
}

const menuItems: MenuItem[] = [
  {
    titulo: 'Minha Conta',
    descricao: 'Gerencie suas informações pessoais, avatar e senha',
    href: '/configuracoes/conta',
    icon: User,
    cor: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    titulo: 'Minha Empresa',
    descricao: 'Configure os dados cadastrais e logo da empresa',
    href: '/configuracoes/empresa',
    icon: Building2,
    cor: 'text-blue-600',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    requerGestor: true,
  },
  {
    titulo: 'Usuários',
    descricao: 'Gerencie os usuários, convites e permissões',
    href: '/configuracoes/usuarios',
    icon: Users,
    cor: 'text-purple-600',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    requerGestor: true,
  },
  {
    titulo: 'Notificações',
    descricao: 'Configure suas preferências de notificação',
    href: '/configuracoes/notificacoes',
    icon: Bell,
    cor: 'text-amber-600',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    titulo: 'Aparência',
    descricao: 'Personalize o tema, cores e visual do sistema',
    href: '/configuracoes/aparencia',
    icon: Palette,
    cor: 'text-pink-600',
    bgGradient: 'from-pink-500/10 to-rose-500/10',
    badge: 'Novo',
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
      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Settings className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-white/80">
              Gerencie suas preferências e configurações do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Info sobre permissões */}
      {canManage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Você tem acesso de administrador
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Pode gerenciar usuários e configurações da empresa
            </p>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="group cursor-pointer h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className={cn(
                  "p-6 bg-gradient-to-br",
                  item.bgGradient,
                  "group-hover:scale-[1.02] transition-transform duration-300"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm",
                        "group-hover:shadow-md transition-shadow"
                      )}>
                        <item.icon className={cn("h-6 w-6", item.cor)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                            {item.titulo}
                          </h3>
                          {item.badge && (
                            <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.descricao}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Seções Adicionais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Segurança</p>
              <p className="text-xs text-muted-foreground">Em breve</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Globe className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Integrações</p>
              <p className="text-xs text-muted-foreground">Em breve</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Sparkles className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Automações</p>
              <p className="text-xs text-muted-foreground">Em breve</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
