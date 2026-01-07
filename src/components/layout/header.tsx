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
  Check,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  CheckSquare,
  DollarSign,
  Briefcase,
  Target,
  Menu,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useNotificacoes } from '@/hooks/use-notificacoes'
import { TipoNotificacao } from '@/types/notificacoes'

interface HeaderProps {
  user?: {
    nome: string
    email: string
    avatarUrl?: string
  }
  tenant?: {
    nome: string
  }
  onMobileMenuToggle?: () => void
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

// Mapeamento de ícones por tipo de notificação
const iconesPorTipo: Record<TipoNotificacao, React.ComponentType<{ className?: string }>> = {
  info: Info,
  sucesso: CheckCircle,
  alerta: AlertTriangle,
  erro: XCircle,
  tarefa: CheckSquare,
  financeiro: DollarSign,
  consultoria: Briefcase,
  okr: Target,
  sistema: Settings
}

// Cores do badge por tipo
const coresBadgePorTipo: Record<TipoNotificacao, string> = {
  info: 'bg-blue-500',
  sucesso: 'bg-emerald-500',
  alerta: 'bg-amber-500',
  erro: 'bg-red-500',
  tarefa: 'bg-purple-500',
  financeiro: 'bg-emerald-500',
  consultoria: 'bg-indigo-500',
  okr: 'bg-orange-500',
  sistema: 'bg-slate-400'
}

// Função para formatar tempo relativo
function formatarTempoRelativo(data: Date | string): string {
  const agora = new Date()
  const dataNotificacao = new Date(data)
  const diffMs = agora.getTime() - dataNotificacao.getTime()
  const diffMinutos = Math.floor(diffMs / (1000 * 60))
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutos < 1) return 'agora'
  if (diffMinutos < 60) return `${diffMinutos}min`
  if (diffHoras < 24) return `${diffHoras}h`
  if (diffDias === 1) return '1d'
  if (diffDias < 7) return `${diffDias}d`
  return dataNotificacao.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function Header({ user, tenant, onMobileMenuToggle }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const supabase = createClient()

  // Hook de notificações
  const {
    notificacoes,
    naoLidas,
    loading: loadingNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    excluir
  } = useNotificacoes()

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
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60 px-3 sm:px-4 lg:px-6">
      {/* Left side - Menu button (mobile) + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Menu hamburguer - apenas mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden flex-shrink-0"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>

        {/* Breadcrumb - oculto no mobile pequeno */}
        <nav className="hidden sm:flex items-center gap-1 text-sm overflow-hidden">
          <Link
            href="/dashboard"
            className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb) => (
            <div key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              {crumb.isLast ? (
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[100px] md:max-w-[150px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors truncate max-w-[80px] md:max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Título da página no mobile pequeno */}
        <span className="sm:hidden font-medium text-slate-900 dark:text-slate-100 truncate">
          {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
        </span>
      </div>

      {/* Center - Search (desktop) / Search button (mobile) */}
      <div className="flex-shrink-0 mx-2 sm:mx-4">
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoFocus
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 md:w-80 pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-bmv-primary/20"
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
          <>
            {/* Botão de busca compacto para mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="sr-only">Buscar</span>
            </Button>

            {/* Botão de busca expandido para desktop */}
            <Button
              variant="outline"
              className="hidden md:flex w-48 lg:w-64 justify-between text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Buscar...</span>
              </div>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 dark:bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 lg:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Tenant indicator - apenas desktop grande */}
        {tenant && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
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
            className="relative hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 sm:h-10 sm:w-10"
          >
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
              {naoLidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[10px] font-bold text-white">
                    {naoLidas > 9 ? '9+' : naoLidas}
                  </span>
                </span>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 sm:w-80" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-sm">Notificações {naoLidas > 0 && `(${naoLidas})`}</span>
              {naoLidas > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-bmv-primary hover:text-bmv-blue"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    await marcarTodasComoLidas()
                    toast({
                      title: 'Notificações',
                      description: 'Todas as notificações foram marcadas como lidas.',
                    })
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Marcar todas como lidas</span>
                  <span className="sm:hidden">Marcar lidas</span>
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 sm:max-h-80 overflow-y-auto">
              {loadingNotificacoes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-bmv-primary border-t-transparent" />
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notificacoes.slice(0, 5).map((notificacao) => {
                  const IconeNotificacao = iconesPorTipo[notificacao.tipo] || Info
                  const corBadge = coresBadgePorTipo[notificacao.tipo] || 'bg-slate-400'

                  return (
                    <div
                      key={notificacao.id}
                      className={cn(
                        "flex flex-col items-start gap-1 py-2.5 sm:py-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md mx-1 my-0.5 group",
                        !notificacao.lida && "bg-blue-50/50 dark:bg-blue-950/20"
                      )}
                      onClick={async () => {
                        if (!notificacao.lida) {
                          await marcarComoLida(notificacao.id)
                        }
                        if (notificacao.link) {
                          router.push(notificacao.link)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={cn("h-2 w-2 rounded-full flex-shrink-0", corBadge, notificacao.lida && "opacity-40")} />
                        <IconeNotificacao className={cn("h-4 w-4 flex-shrink-0", notificacao.lida ? "text-slate-400" : "text-slate-600 dark:text-slate-300")} />
                        <span className={cn("font-medium text-xs sm:text-sm flex-1 truncate", notificacao.lida && "text-slate-500 font-normal")}>
                          {notificacao.titulo}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400">{formatarTempoRelativo(notificacao.criadoEm)}</span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          onClick={async (e) => {
                            e.stopPropagation()
                            await excluir(notificacao.id)
                            toast({
                              title: 'Notificação excluída',
                              description: 'A notificação foi removida.',
                            })
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                      <p className={cn("text-[10px] sm:text-xs pl-8 line-clamp-2", notificacao.lida ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                        {notificacao.mensagem}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
            {notificacoes.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-bmv-primary font-medium cursor-pointer text-sm"
                  onClick={() => router.push('/configuracoes/notificacoes')}
                >
                  Ver todas ({notificacoes.length})
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 sm:h-10 gap-1 sm:gap-2 px-1.5 sm:px-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-bmv-primary to-bmv-blue text-white shadow-md">
                {user?.nome ? (
                  <span className="text-xs sm:text-sm font-semibold">
                    {user.nome.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 sm:w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-bmv-primary to-bmv-blue text-white shadow-md flex-shrink-0">
                  {user?.nome ? (
                    <span className="text-base sm:text-lg font-semibold">
                      {user.nome.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>
                <div className="flex flex-col space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100 truncate">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/configuracoes/conta')}
              className="gap-2 sm:gap-3 py-2 sm:py-2.5 cursor-pointer"
            >
              <UserCircle className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/configuracoes')}
              className="gap-2 sm:gap-3 py-2 sm:py-2.5 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {}}
              className="gap-2 sm:gap-3 py-2 sm:py-2.5 cursor-pointer hidden sm:flex"
            >
              <Keyboard className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Atalhos de teclado</span>
              <kbd className="ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-slate-100 dark:bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 flex">
                ?
              </kbd>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open('https://bmvconsultoria.com.br/ajuda', '_blank')}
              className="gap-2 sm:gap-3 py-2 sm:py-2.5 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Ajuda e Suporte</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 sm:gap-3 py-2 sm:py-2.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
