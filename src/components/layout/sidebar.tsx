'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ChevronDown,
  HelpCircle,
  Building2,
  Shield,
  ExternalLink,
  Menu,
  X,
  Users,
  Truck,
  Database,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  CalendarDays,
  Target,
  Landmark,
  Receipt,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canManageTenants } from '@/lib/permissions'

interface SubMenuItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  iconColor: string
  badge?: number
  adminOnly?: boolean
  consultorOnly?: boolean
  subItems?: SubMenuItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    iconColor: 'text-blue-500',
  },
  {
    title: 'Financeiro',
    href: '/financeiro',
    icon: <Wallet className="h-5 w-5" />,
    iconColor: 'text-emerald-500',
    subItems: [
      { title: 'Visao Geral', href: '/financeiro', icon: <BarChart3 className="h-4 w-4" /> },
      { title: 'Contas Bancarias', href: '/financeiro/contas', icon: <Landmark className="h-4 w-4" /> },
      { title: 'Movimentacoes', href: '/financeiro/movimentacoes', icon: <Receipt className="h-4 w-4" /> },
      { title: 'Contas a Receber', href: '/financeiro/contas-receber', icon: <ArrowDownCircle className="h-4 w-4" /> },
      { title: 'Contas a Pagar', href: '/financeiro/contas-pagar', icon: <ArrowUpCircle className="h-4 w-4" /> },
      { title: 'Transferencias', href: '/financeiro/transferencias', icon: <ArrowLeftRight className="h-4 w-4" /> },
      { title: 'Fluxo de Caixa', href: '/financeiro/fluxo-caixa', icon: <BarChart3 className="h-4 w-4" /> },
      { title: 'Fluxo Diario', href: '/financeiro/fluxo-caixa-diario', icon: <CalendarDays className="h-4 w-4" /> },
      { title: 'Orcamento', href: '/financeiro/orcamento', icon: <Target className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Cadastros',
    href: '/cadastros',
    icon: <Database className="h-5 w-5" />,
    iconColor: 'text-indigo-500',
    subItems: [
      { title: 'Clientes', href: '/cadastros/clientes', icon: <Users className="h-4 w-4" /> },
      { title: 'Fornecedores', href: '/cadastros/fornecedores', icon: <Truck className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Contabil',
    href: '/contabil',
    icon: <Calculator className="h-5 w-5" />,
    iconColor: 'text-purple-500',
  },
  {
    title: 'Processos',
    href: '/processos',
    icon: <GitBranch className="h-5 w-5" />,
    iconColor: 'text-orange-500',
    badge: 3,
  },
  {
    title: 'Consultoria',
    href: '/consultoria',
    icon: <Briefcase className="h-5 w-5" />,
    iconColor: 'text-rose-500',
    consultorOnly: true,
  },
]

const adminItems: SidebarItem[] = [
  {
    title: 'Empresas',
    href: '/admin/empresas',
    icon: <Building2 className="h-5 w-5" />,
    iconColor: 'text-cyan-500',
    adminOnly: true,
  },
]

const bottomItems: SidebarItem[] = [
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: <Settings className="h-5 w-5" />,
    iconColor: 'text-slate-500',
  },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()

  // Expandir automaticamente o menu que contém a rota atual
  useEffect(() => {
    sidebarItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(
          (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
        )
        if (hasActiveSubItem) {
          setExpandedMenus((prev) =>
            prev.includes(item.href) ? prev : [...prev, item.href]
          )
        }
      }
    })
  }, [pathname])

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  useEffect(() => {
    setMounted(true)
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

  // Fechar sidebar mobile ao clicar em um item
  const handleItemClick = useCallback(() => {
    if (onMobileClose) {
      onMobileClose()
    }
  }, [onMobileClose])

  // Fechar ao pressionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMobileOpen, onMobileClose])

  const showAdminMenu = canManageTenants(userRole)
  const isConsultorBMV = ['ADMIN_BMV', 'CONSULTOR_BMV'].includes(userRole || '')

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (item.consultorOnly && !isConsultorBMV) {
      return false
    }
    return true
  })

  const sidebarContent = (
    <>
      {/* Logo BMV */}
      <div className={cn(
        'flex items-center border-b border-slate-200 dark:border-slate-800 h-16',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'justify-center px-2' : 'px-4'
      )}>
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={handleItemClick}>
          <div className={cn(
            'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-bmv-primary to-bmv-blue shadow-lg',
            'transition-all duration-300 ease-in-out group-hover:shadow-bmv-primary/30 group-hover:scale-105',
            isCollapsed ? 'w-10 h-10' : 'w-10 h-10'
          )}>
            <span className="text-white font-bold text-lg">B</span>
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className={cn(
            'flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-0 opacity-0 lg:w-0' : 'w-auto opacity-100'
          )}>
            <span className="font-bold text-lg text-bmv-primary leading-tight">BM&V</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Consultoria</span>
          </div>
        </Link>

        {/* Botão fechar mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto"
          onClick={onMobileClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Toggle Button - apenas desktop */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'absolute -right-3 top-[70px] h-6 w-6 rounded-full border bg-white dark:bg-slate-800 shadow-md z-50',
          'transition-all duration-300 ease-in-out hover:bg-slate-50 dark:hover:bg-slate-700',
          'hover:scale-110',
          'hidden lg:flex'
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="transition-transform duration-300 ease-in-out">
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </div>
      </Button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {filteredSidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isExpanded = expandedMenus.includes(item.href)

            // Se tem subitens, renderiza como menu expansível
            if (hasSubItems) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full',
                      'transition-all duration-200 ease-in-out',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      isCollapsed && 'lg:justify-center lg:px-2'
                    )}
                  >
                    <span className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-emerald-600' : item.iconColor
                    )}>
                      {item.icon}
                    </span>

                    <span className={cn(
                      'transition-all duration-300 ease-in-out whitespace-nowrap flex-1 text-left',
                      isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'
                    )}>
                      {item.title}
                    </span>

                    {!isCollapsed && (
                      <ChevronDown className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )} />
                    )}

                    {/* Tooltip when collapsed - apenas desktop */}
                    {isCollapsed && mounted && (
                      <div className={cn(
                        'absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg',
                        'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                        'transition-all duration-200 ease-in-out whitespace-nowrap z-50',
                        'shadow-lg hidden lg:block'
                      )}>
                        {item.title}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                      </div>
                    )}
                  </button>

                  {/* SubItems */}
                  {!isCollapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = pathname === subItem.href ||
                          (subItem.href !== '/financeiro' && pathname.startsWith(subItem.href + '/'))
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={handleItemClick}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                              'transition-all duration-200 ease-in-out',
                              isSubActive
                                ? 'bg-bmv-primary text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            )}
                          >
                            <span className={isSubActive ? 'text-white' : 'text-slate-400'}>
                              {subItem.icon}
                            </span>
                            <span>{subItem.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Se não tem subitens, renderiza como link normal
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  'transition-all duration-200 ease-in-out',
                  isActive
                    ? 'bg-bmv-primary text-white shadow-lg shadow-bmv-primary/25'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  isCollapsed && 'lg:justify-center lg:px-2'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full -ml-3" />
                )}

                <span className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-white' : item.iconColor
                )}>
                  {item.icon}
                </span>

                <span className={cn(
                  'transition-all duration-300 ease-in-out whitespace-nowrap',
                  isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'
                )}>
                  {item.title}
                </span>

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <span className={cn(
                    'flex items-center justify-center min-w-[20px] h-5 text-xs font-semibold rounded-full',
                    'transition-all duration-300 ease-in-out',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white',
                    isCollapsed
                      ? 'lg:absolute lg:-top-1 lg:-right-1 lg:min-w-[18px] lg:h-[18px] lg:text-[10px]'
                      : 'ml-auto px-1.5'
                  )}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed - apenas desktop */}
                {isCollapsed && mounted && (
                  <div className={cn(
                    'absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg',
                    'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                    'transition-all duration-200 ease-in-out whitespace-nowrap z-50',
                    'shadow-lg hidden lg:block'
                  )}>
                    {item.title}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                )}
              </Link>
            )
          })}

          {/* Admin Section */}
          {showAdminMenu && (
            <>
              <div className={cn(
                'mt-6 mb-2 flex items-center gap-2',
                'transition-all duration-300 ease-in-out',
                isCollapsed ? 'lg:justify-center' : 'px-3'
              )}>
                {!isCollapsed && (
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Administração
                  </span>
                )}
                <Shield className={cn(
                  'h-3 w-3 text-slate-400',
                  'transition-all duration-300'
                )} />
              </div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleItemClick}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                      'transition-all duration-200 ease-in-out',
                      isActive
                        ? 'bg-bmv-primary text-white shadow-lg shadow-bmv-primary/25'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      isCollapsed && 'lg:justify-center lg:px-2'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full -ml-3" />
                    )}
                    <span className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-white' : item.iconColor
                    )}>
                      {item.icon}
                    </span>
                    <span className={cn(
                      'transition-all duration-300 ease-in-out whitespace-nowrap',
                      isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'
                    )}>
                      {item.title}
                    </span>

                    {isCollapsed && mounted && (
                      <div className={cn(
                        'absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg',
                        'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                        'transition-all duration-200 ease-in-out whitespace-nowrap z-50',
                        'shadow-lg hidden lg:block'
                      )}>
                        {item.title}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleItemClick}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-all duration-200 ease-in-out',
                isActive
                  ? 'bg-bmv-primary text-white shadow-lg shadow-bmv-primary/25'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                isCollapsed && 'lg:justify-center lg:px-2'
              )}
            >
              <span className={cn(
                'transition-colors duration-200',
                isActive ? 'text-white' : item.iconColor
              )}>
                {item.icon}
              </span>
              <span className={cn(
                'transition-all duration-300 ease-in-out whitespace-nowrap',
                isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'
              )}>
                {item.title}
              </span>

              {isCollapsed && mounted && (
                <div className={cn(
                  'absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg',
                  'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                  'transition-all duration-200 ease-in-out whitespace-nowrap z-50',
                  'shadow-lg hidden lg:block'
                )}>
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </Link>
          )
        })}

        {/* Help Link */}
        <a
          href="https://bmvconsultoria.com.br/ajuda"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleItemClick}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
            'transition-all duration-200 ease-in-out',
            'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
            isCollapsed && 'lg:justify-center lg:px-2'
          )}
        >
          <HelpCircle className="h-5 w-5 text-slate-500" />
          <span className={cn(
            'transition-all duration-300 ease-in-out whitespace-nowrap flex items-center gap-1',
            isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'
          )}>
            Ajuda
            <ExternalLink className="h-3 w-3 opacity-50" />
          </span>

          {isCollapsed && mounted && (
            <div className={cn(
              'absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg',
              'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
              'transition-all duration-200 ease-in-out whitespace-nowrap z-50',
              'shadow-lg hidden lg:block'
            )}>
              Ajuda
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          )}
        </a>
      </div>

      {/* Footer */}
      <div className={cn(
        'border-t border-slate-200 dark:border-slate-800 py-3 px-3',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'lg:text-center' : ''
      )}>
        <div className={cn(
          'text-[10px] text-slate-400',
          'transition-all duration-300 ease-in-out'
        )}>
          {isCollapsed ? (
            <span className="hidden lg:block">v1.0</span>
          ) : (
            <div className="flex items-center justify-between">
              <span>BMV Software v1.0.0</span>
              <span className="text-slate-300">2026</span>
            </div>
          )}
          {/* Mobile sempre mostra versão completa */}
          <div className="lg:hidden flex items-center justify-between">
            <span>BMV Software v1.0.0</span>
            <span className="text-slate-300">2026</span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col',
          'transition-all duration-300 ease-in-out',
          'hidden lg:flex',
          isCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile (Drawer) */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col',
          'transition-all duration-300 ease-in-out',
          'lg:hidden w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

// Componente do botão hamburguer para usar no header
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Abrir menu</span>
    </Button>
  )
}
