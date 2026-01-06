'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Wallet,
  Calculator,
  GitBranch,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  HelpCircle,
  Building2,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canManageTenants } from '@/lib/permissions'

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  adminOnly?: boolean
  consultorOnly?: boolean // Apenas para ADMIN_BMV e CONSULTOR_BMV
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Financeiro',
    href: '/financeiro',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: 'Contábil',
    href: '/contabil',
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    title: 'Processos',
    href: '/processos',
    icon: <GitBranch className="h-5 w-5" />,
  },
  {
    title: 'Consultoria',
    href: '/consultoria',
    icon: <Briefcase className="h-5 w-5" />,
    consultorOnly: true, // Apenas ADMIN_BMV e CONSULTOR_BMV veem no menu
  },
]

const adminItems: SidebarItem[] = [
  {
    title: 'Empresas',
    href: '/admin/empresas',
    icon: <Building2 className="h-5 w-5" />,
    adminOnly: true,
  },
]

const bottomItems: SidebarItem[] = [
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: 'Ajuda',
    href: '/ajuda',
    icon: <HelpCircle className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Buscar perfil do usuário atual
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.perfil)
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error)
      }
    }
    fetchUserRole()
  }, [])

  const showAdminMenu = canManageTenants(userRole)
  const isConsultorBMV = ['ADMIN_BMV', 'CONSULTOR_BMV'].includes(userRole || '')

  // Filtrar itens do menu baseado no perfil
  const filteredSidebarItems = sidebarItems.filter((item) => {
    // Se é consultorOnly, só mostra para ADMIN_BMV e CONSULTOR_BMV
    if (item.consultorOnly && !isConsultorBMV) {
      return false
    }
    return true
  })

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-bmv-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-lg text-bmv-primary">BM&V</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-bmv-primary rounded flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">B</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white dark:bg-slate-900 shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex flex-col h-[calc(100vh-4rem)] justify-between p-3">
        <div className="space-y-1">
          {filteredSidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-bmv-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto bg-bmv-accent text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Admin Section - Apenas para ADMIN_BMV e CONSULTOR_BMV */}
          {showAdminMenu && (
            <>
              <div className={cn(
                'mt-4 mb-2 flex items-center gap-2',
                isCollapsed ? 'justify-center' : 'px-3'
              )}>
                {!isCollapsed && (
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Admin
                  </span>
                )}
                <Shield className="h-3 w-3 text-slate-400" />
              </div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-bmv-primary text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </div>

        <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-bmv-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
