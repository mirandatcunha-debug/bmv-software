'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Plus,
  Search,
  Users,
  Edit,
  Power,
  Loader2,
  ArrowLeft,
  Filter,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Mail,
  Phone,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface Empresa {
  id: string
  nome: string
  cnpj: string | null
  email: string
  telefone: string | null
  ativo: boolean
  criadoEm: string
  _count: {
    usuarios: number
  }
}

// Dados mockados expandidos
const empresasMock: Empresa[] = [
  {
    id: '1',
    nome: 'Tech Solutions S.A.',
    cnpj: '98.765.432/0001-10',
    email: 'admin@techsolutions.com',
    telefone: '(21) 98888-8888',
    ativo: true,
    criadoEm: '2024-02-20',
    _count: { usuarios: 12 },
  },
  {
    id: '2',
    nome: 'Empresa ABC Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@empresaabc.com.br',
    telefone: '(11) 99999-9999',
    ativo: true,
    criadoEm: '2024-01-15',
    _count: { usuarios: 5 },
  },
  {
    id: '3',
    nome: 'Inovacao Digital LTDA',
    cnpj: '45.678.901/0001-23',
    email: 'contato@inovacaodigital.com',
    telefone: '(31) 97777-7777',
    ativo: true,
    criadoEm: '2024-03-10',
    _count: { usuarios: 8 },
  },
  {
    id: '4',
    nome: 'Consultoria XYZ',
    cnpj: '78.901.234/0001-56',
    email: 'atendimento@consultoriaxyz.com.br',
    telefone: '(41) 96666-6666',
    ativo: false,
    criadoEm: '2023-11-05',
    _count: { usuarios: 3 },
  },
  {
    id: '5',
    nome: 'Global Partners',
    cnpj: '23.456.789/0001-01',
    email: 'global@partners.com',
    telefone: '(51) 95555-5555',
    ativo: true,
    criadoEm: '2024-04-01',
    _count: { usuarios: 15 },
  },
]

export default function EmpresasPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tenants')
      if (response.ok) {
        const data = await response.json()
        setEmpresas(data)
      } else {
        setEmpresas(empresasMock)
      }
    } catch {
      setEmpresas(empresasMock)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (empresaId: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/admin/tenants/${empresaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      })

      if (response.ok) {
        toast({
          title: 'Status atualizado',
          description: `Empresa ${ativo ? 'desativada' : 'ativada'} com sucesso`,
        })
        fetchEmpresas()
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel atualizar o status',
        variant: 'destructive',
      })
    }
  }

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((empresa) => {
      const matchSearch =
        empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cnpj?.includes(searchTerm) ||
        empresa.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus =
        statusFiltro === 'TODOS' ||
        (statusFiltro === 'ATIVO' && empresa.ativo) ||
        (statusFiltro === 'INATIVO' && !empresa.ativo)
      return matchSearch && matchStatus
    })
  }, [empresas, searchTerm, statusFiltro])

  // Estatísticas
  const totalEmpresas = empresas.length
  const empresasAtivas = empresas.filter((e) => e.ativo).length
  const totalUsuarios = empresas.reduce((acc, e) => acc + (e._count?.usuarios || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-bmv-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Admin
      </Link>

      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white animate-fade-in-up">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Gestao de Empresas</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Gerencie todas as empresas cadastradas no sistema
                </p>
              </div>
            </div>
            <Link href="/admin/empresas/nova">
              <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-blue-900/30 transition-all hover:scale-105 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </Link>
          </div>

          {/* Métricas no header */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Total</span>
              </div>
              <p className="text-2xl font-bold">{totalEmpresas}</p>
              <p className="text-xs text-blue-200">{empresasAtivas} ativas</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Usuarios</span>
              </div>
              <p className="text-2xl font-bold">{totalUsuarios}</p>
              <p className="text-xs text-blue-200">em todas empresas</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Taxa Ativacao</span>
              </div>
              <p className="text-2xl font-bold text-emerald-300">
                {totalEmpresas > 0 ? Math.round((empresasAtivas / totalEmpresas) * 100) : 0}%
              </p>
              <p className="text-xs text-blue-200">empresas ativas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFiltro}
              onValueChange={(v) => setStatusFiltro(v as 'TODOS' | 'ATIVO' | 'INATIVO')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="ATIVO">Ativas</SelectItem>
                <SelectItem value="INATIVO">Inativas</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline" className="ml-auto">
              {empresasFiltradas.length} empresa(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Empresas como Cards */}
      {empresasFiltradas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {empresasFiltradas.map((empresa, index) => (
            <Card
              key={empresa.id}
              className={cn(
                'group relative overflow-hidden border-2 border-transparent hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up',
                !empresa.ativo && 'opacity-70'
              )}
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              {/* Background hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar/Logo da empresa */}
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-bmv-primary/10 to-bmv-primary/20 flex items-center justify-center border-2 border-bmv-primary/20 group-hover:scale-105 transition-transform shadow-lg">
                      <span className="text-xl font-bold text-bmv-primary">
                        {empresa.nome.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/admin/empresas/${empresa.id}`}>
                          <h3 className="font-bold text-lg hover:text-bmv-primary transition-colors cursor-pointer">
                            {empresa.nome}
                          </h3>
                        </Link>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            empresa.ativo
                              ? 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30'
                              : 'border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30'
                          )}
                        >
                          {empresa.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mt-0.5">
                        {empresa.cnpj || 'CNPJ nao informado'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {empresa.email}
                        </span>
                        {empresa.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {empresa.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/admin/empresas/${empresa.id}`}>
                          <Users className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          'cursor-pointer',
                          empresa.ativo ? 'text-red-600' : 'text-green-600'
                        )}
                        onClick={() => toggleStatus(empresa.id, empresa.ativo)}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {empresa.ativo ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Footer com métricas */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">{empresa._count?.usuarios || 0}</p>
                        <p className="text-xs text-muted-foreground">usuarios</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Calendar className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">cadastro</p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/admin/empresas/${empresa.id}`}>
                    <Button variant="outline" size="sm" className="group/btn">
                      Ver
                      <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="animate-fade-in-up">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
                  <Building2 className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <Sparkles className="h-6 w-6 text-blue-400 mt-4 animate-pulse" />
              <h3 className="text-xl font-semibold mt-4 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchTerm || statusFiltro !== 'TODOS'
                  ? 'Tente ajustar os filtros de busca para encontrar resultados.'
                  : 'Comece cadastrando a primeira empresa no sistema.'}
              </p>
              {!searchTerm && statusFiltro === 'TODOS' && (
                <Link href="/admin/empresas/nova">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeira Empresa
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
