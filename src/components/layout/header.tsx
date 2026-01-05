'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { useTheme } from 'next-themes'

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

export function Header({ user, tenant }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast({
      title: 'Até logo!',
      description: 'Você saiu do sistema.',
    })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60 px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="w-64 pl-9 bg-slate-50 dark:bg-slate-800 border-0"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Tenant indicator */}
        {tenant && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{tenant.nome}</span>
          </div>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          <span className="sr-only">Notificações</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bmv-primary text-white">
                {user?.nome ? (
                  <span className="text-sm font-medium">
                    {user.nome.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.nome || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'email@exemplo.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
