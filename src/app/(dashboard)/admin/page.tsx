'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  Shield,
  Settings,
  ArrowRight,
  TrendingUp,
  Calendar,
  UserPlus,
  Activity,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Dados mockados para estatísticas
const estatisticasMock = {
  totalEmpresas: 24,
  empresasAtivas: 22,
  totalUsuarios: 156,
  usuariosAtivos: 142,
  novosEsteMes: 8,
  crescimento: 15.3,
}

// Empresas recentes mockadas
const empresasRecentesMock = [
  { id: '1', nome: 'Tech Solutions S.A.', usuarios: 12, criadoEm: '2026-01-03', ativo: true },
  { id: '2', nome: 'Empresa ABC Ltda', usuarios: 5, criadoEm: '2026-01-02', ativo: true },
  { id: '3', nome: 'Inovacao Digital', usuarios: 8, criadoEm: '2025-12-28', ativo: true },
  { id: '4', nome: 'Consultoria XYZ', usuarios: 3, criadoEm: '2025-12-20', ativo: false },
]

const adminCards = [
  {
    title: 'Empresas',
    description: 'Gerenciar empresas cadastradas',
    href: '/admin/empresas',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/25',
    count: estatisticasMock.totalEmpresas,
  },
  {
    title: 'Usuarios',
    description: 'Todos os usuarios do sistema',
    href: '/admin/usuarios',
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/25',
    count: estatisticasMock.totalUsuarios,
  },
  {
    title: 'Permissoes',
    description: 'Configurar permissoes e perfis',
    href: '/admin/permissoes',
    icon: Shield,
    color: 'from-purple-500 to-violet-600',
    shadowColor: 'shadow-purple-500/25',
    count: 4,
  },
  {
    title: 'Configuracoes',
    description: 'Configuracoes do sistema',
    href: '/admin/configuracoes',
    icon: Settings,
    color: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/25',
    count: null,
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header com gradiente azul escuro BMV */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-bmv-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-bmv-primary/20 rounded-xl backdrop-blur-sm border border-bmv-primary/30">
                <Shield className="h-8 w-8 text-bmv-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Administracao BM&V</h1>
                <p className="text-slate-300 text-sm md:text-base">
                  Painel de gerenciamento do sistema
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/empresas/nova">
                <Button
                  className="bg-bmv-primary hover:bg-bmv-primary/90 text-white shadow-lg shadow-bmv-primary/30 transition-all hover:scale-105"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini cards de estatísticas no header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-slate-300" />
                <span className="text-xs text-slate-300">Total Empresas</span>
              </div>
              <p className="text-2xl font-bold">{estatisticasMock.totalEmpresas}</p>
              <p className="text-xs text-slate-400">{estatisticasMock.empresasAtivas} ativas</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-slate-300" />
                <span className="text-xs text-slate-300">Total Usuarios</span>
              </div>
              <p className="text-2xl font-bold">{estatisticasMock.totalUsuarios}</p>
              <p className="text-xs text-slate-400">{estatisticasMock.usuariosAtivos} ativos</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="h-4 w-4 text-slate-300" />
                <span className="text-xs text-slate-300">Novos (Mes)</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">+{estatisticasMock.novosEsteMes}</p>
              <p className="text-xs text-slate-400">empresas/usuarios</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-slate-300" />
                <span className="text-xs text-slate-300">Crescimento</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">+{estatisticasMock.crescimento}%</p>
              <p className="text-xs text-slate-400">vs mes anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Atalho */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminCards.map((card, index) => (
          <Link key={card.href} href={card.href} className="group">
            <Card
              className="relative overflow-hidden border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up h-full"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                    card.color,
                    card.shadowColor
                  )}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  {card.count !== null && (
                    <Badge variant="secondary" className="text-lg font-bold">
                      {card.count}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-bmv-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-bmv-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Acessar</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empresas Recentes e Ações Rápidas */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Empresas Recentes */}
        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Empresas Recentes
              </CardTitle>
              <CardDescription>
                Ultimas empresas cadastradas no sistema
              </CardDescription>
            </div>
            <Link href="/admin/empresas">
              <Button variant="outline" size="sm" className="group">
                Ver Todas
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {empresasRecentesMock.map((empresa, index) => (
                <Link
                  key={empresa.id}
                  href={`/admin/empresas/${empresa.id}`}
                  className="block"
                >
                  <div
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    {/* Avatar/Logo */}
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-bmv-primary/10 to-bmv-primary/20 flex items-center justify-center border border-bmv-primary/20 group-hover:scale-105 transition-transform">
                      <span className="text-lg font-bold text-bmv-primary">
                        {empresa.nome.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate group-hover:text-bmv-primary transition-colors">
                          {empresa.nome}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            empresa.ativo
                              ? "border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30"
                              : "border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30"
                          )}
                        >
                          {empresa.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {empresa.usuarios} usuarios
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              Acoes Rapidas
            </CardTitle>
            <CardDescription>
              Atalhos para tarefas comuns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/empresas/nova">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 group">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Nova Empresa</p>
                  <p className="text-xs text-muted-foreground">Cadastrar empresa</p>
                </div>
              </Button>
            </Link>

            <Link href="/admin/usuarios">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 group">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/30 transition-colors">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Gerenciar Usuarios</p>
                  <p className="text-xs text-muted-foreground">Ver todos os usuarios</p>
                </div>
              </Button>
            </Link>

            <Link href="/admin/permissoes">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 group">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Permissoes</p>
                  <p className="text-xs text-muted-foreground">Configurar perfis</p>
                </div>
              </Button>
            </Link>

            <Link href="/admin/configuracoes">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 group">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/30 transition-colors">
                  <Settings className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Configuracoes</p>
                  <p className="text-xs text-muted-foreground">Sistema global</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-dashed border-2 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-bmv-primary" />
            <CardTitle className="text-lg">Area Administrativa</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Esta area e restrita a administradores do sistema BM&V. Aqui voce pode gerenciar empresas,
            usuarios, permissoes e configuracoes globais do sistema. Todas as acoes sao registradas
            para auditoria.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
