'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  Building2,
  ChevronRight,
  Home,
  X,
  Keyboard,
  HelpCircle,
  UserCircle,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user?: {
    nome: string
    email: string
    avatarUrl?: string
  }
  tenant?: {
    nome: string
  }
}

// Mapeamento de rotas para breadcrumbs
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  financeiro: 'Financeiro',
  contabil: 'Contábil',
  processos: 'Processos',
  consultoria: 'Consultoria',
  configuracoes: 'Configurações',
  admin: 'Administração',
  empresas: 'Empresas',
  usuarios: 'Usuários',
  contas: 'Contas',
  movimentacoes: 'Movimentações',
  categorias: 'Categorias',
  'fluxo-caixa': 'Fluxo de Caixa',
  okr: 'OKRs',
  projetos: 'Projetos',
  novo: 'Novo',
  nova: 'Nova',
  'nova-tarefa': 'Nova Tarefa',
  'novo-kr': 'Novo KR',
  aparencia: 'Aparência',
  conta: 'Conta',
  empresa: 'Empresa',
  notificacoes: 'Notificações',
  convidar: 'Convidar',
  'plano-contas': 'Plano de Contas',
  'centros-custo': 'Centros de Custo',
  lancamentos: 'Lançamentos',
}

export function Header({ user, tenant }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount] = useState(5) // Simulado - depois virá da API
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Generate breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs: { label: string; href: string; isLast: boolean }[] = []

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      const label = isUUID ? 'Detalhes' : (routeLabels[segment] || segment)
      crumbs.push({
        label,
        href: currentPath,
        isLast: index === segments.length - 1,
      })
    })

    return crumbs
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast({
      title: 'Até logo!',
      description: 'Você saiu do sistema.',
    })
    router.push('/login')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast({
        title: 'Busca',
        description: `Buscando por "${searchQuery}"...`,
      })
      // TODO: Implementar busca global
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60 px-6">
      {/* Left side - Breadcrumb */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm overflow-hidden">
          <Link
            href="/dashboard"
            className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              {crumb.isLast ? (
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors truncate max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Center - Search */}
      <div className="flex-shrink-0 mx-4">
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoFocus
              placeholder="Buscar em todo o sistema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-bmv-primary/20"
            />
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <Button
            variant="outline"
            className="w-64 justify-between text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Buscar...</span>
            </div>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 dark:bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Tenant indicator */}
        {tenant && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <Building2 className="h-4 w-4 text-bmv-primary" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
              {tenant.nome}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                </span>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-bmv-primary hover:text-bmv-blue">
                Marcar todas como lidas
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {/* Notification items - simulados */}
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">Inadimplência alta</span>
                  <span className="text-xs text-slate-400">2h</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">12 clientes com atraso superior a 30 dias</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">Despesas de Marketing</span>
                  <span className="text-xs text-slate-400">5h</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">Aumento de 45% este mês</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">Meta atingida!</span>
                  <span className="text-xs text-slate-400">1d</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">Receita de serviços cresceu 23%</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">Nova tarefa atribuída</span>
                  <span className="text-xs text-slate-400">2d</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">Revisar fluxo de caixa - Projeto BMV</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-slate-300 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">Relatório disponível</span>
                  <span className="text-xs text-slate-400">3d</span>
                </div>
                <p className="text-xs text-slate-500 pl-4">Relatório mensal de dezembro gerado</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-bmv-primary font-medium cursor-pointer">
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 gap-2 px-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-bmv-primary to-bmv-blue text-white shadow-md">
                {user?.nome ? (
                  <span className="text-sm font-semibold">
                    {user.nome.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-bmv-primary to-bmv-blue text-white shadow-md">
                  {user?.nome ? (
                    <span className="text-lg font-semibold">
                      {user.nome.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/configuracoes/conta')}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <UserCircle className="h-4 w-4 text-slate-500" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/configuracoes')}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {}}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <Keyboard className="h-4 w-4 text-slate-500" />
              <span>Atalhos de teclado</span>
              <kbd className="ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-slate-100 dark:bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 flex">
                ?
              </kbd>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open('https://bmvconsultoria.com.br/ajuda', '_blank')}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>Ajuda e Suporte</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-3 py-2.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
