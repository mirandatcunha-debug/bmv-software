'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  UserX,
  Calendar,
  Mail,
  ArrowLeft,
  Filter,
  RefreshCw,
  Shield,
  User,
  AlertCircle,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Colaborador {
  id: string
  nome: string
  email: string
  perfil: 'GESTOR' | 'COLABORADOR'
  ativo: boolean
  criadoEm: string
  ultimoAcesso: string | null
  emailVerificado: boolean
}

interface ColaboradoresResponse {
  colaboradores: Colaborador[]
  total: number
  totalUsuarios: number
  limiteUsuarios: number
  plano: string
}

export default function ColaboradoresPage() {
  const [data, setData] = useState<ColaboradoresResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [perfilFilter, setPerfilFilter] = useState<string>('todos')

  const [triggerSearch, setTriggerSearch] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (statusFilter !== 'todos') params.append('status', statusFilter)
        if (perfilFilter !== 'todos') params.append('perfil', perfilFilter)

        const response = await fetch(`/api/cadastros/colaboradores?${params.toString()}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [statusFilter, perfilFilter, search, triggerSearch])

  const fetchColaboradores = () => {
    setTriggerSearch(prev => prev + 1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchColaboradores()
  }

  const handleDesativar = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente desativar o colaborador ${nome}?`)) return

    try {
      const response = await fetch(`/api/cadastros/colaboradores/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchColaboradores()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao desativar colaborador')
      }
    } catch (error) {
      console.error('Erro ao desativar colaborador:', error)
      alert('Erro ao desativar colaborador')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Nunca acessou'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const colaboradores = data?.colaboradores || []
  const totalUsuarios = data?.totalUsuarios || 0
  const limiteUsuarios = data?.limiteUsuarios || 0
  const plano = data?.plano || 'TRIAL'
  const vagasDisponiveis = limiteUsuarios === -1 ? Infinity : limiteUsuarios - totalUsuarios
  const atingiuLimite = limiteUsuarios !== -1 && totalUsuarios >= limiteUsuarios

  const colaboradoresAtivos = colaboradores.filter(c => c.ativo).length
  const gestores = colaboradores.filter(c => c.perfil === 'GESTOR').length
  const colaboradoresRegulares = colaboradores.filter(c => c.perfil === 'COLABORADOR').length

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Breadcrumb */}
          <Link href="/cadastros" className="inline-flex items-center gap-2 text-blue-100 text-sm mb-3 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Cadastros</span>
          </Link>

          {/* Titulo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Colaboradores</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Gerencie os usuários da sua equipe
                </p>
              </div>
            </div>
            <Link href="/cadastros/colaboradores/novo">
              <Button
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                variant="outline"
                disabled={atingiuLimite}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Colaborador
              </Button>
            </Link>
          </div>

          {/* Badge de limite de usuários */}
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {totalUsuarios} de {limiteUsuarios === -1 ? '∞' : limiteUsuarios} usuários
              </span>
              {atingiuLimite && (
                <Badge className="bg-amber-500 text-white ml-2">
                  Limite Atingido
                </Badge>
              )}
            </div>
            <span className="text-xs text-blue-100 ml-2">
              Plano {plano}
            </span>
          </div>

          {/* Mini cards de resumo no header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Ativos</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{colaboradoresAtivos}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Gestores</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{gestores}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Colaboradores</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{colaboradoresRegulares}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de limite */}
      {atingiuLimite && (
        <Alert className="animate-fade-in-up border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Você atingiu o limite de {limiteUsuarios} usuários do plano {plano}.{' '}
            <Link href="/configuracoes/planos" className="underline font-medium">
              Faça upgrade
            </Link>
            {' '}para adicionar mais colaboradores.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                <SelectTrigger className="w-[140px]">
                  <Shield className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="GESTOR">Gestores</SelectItem>
                  <SelectItem value="COLABORADOR">Colaboradores</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button type="button" variant="outline" onClick={fetchColaboradores}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Colaboradores */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : colaboradores.length === 0 ? (
        <Card className="animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando colaboradores à sua equipe.'}
            </p>
            {!atingiuLimite && (
              <Link href="/cadastros/colaboradores/novo">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Colaborador
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {colaboradores.map((colaborador, index) => (
            <Card
              key={colaborador.id}
              className={cn(
                "relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up",
                colaborador.ativo
                  ? colaborador.perfil === 'GESTOR'
                    ? "border-l-purple-500 hover:border-l-purple-600"
                    : "border-l-blue-500 hover:border-l-blue-600"
                  : "border-l-slate-400 opacity-75"
              )}
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      colaborador.perfil === 'GESTOR'
                        ? "bg-purple-100 dark:bg-purple-900/50"
                        : "bg-blue-100 dark:bg-blue-900/50"
                    )}>
                      {colaborador.perfil === 'GESTOR' ? (
                        <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1">{colaborador.nome}</CardTitle>
                      <CardDescription className="text-xs">
                        {colaborador.perfil === 'GESTOR' ? 'Gestor' : 'Colaborador'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={colaborador.ativo ? "default" : "secondary"} className={cn(
                    "text-xs",
                    colaborador.ativo
                      ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}>
                    {colaborador.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{colaborador.email}</span>
                  </div>

                  {!colaborador.emailVerificado && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                      Email não verificado
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground text-xs pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>Cadastrado em {formatDate(colaborador.criadoEm)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>Último acesso: {formatDateTime(colaborador.ultimoAcesso)}</span>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Link href={`/cadastros/colaboradores/${colaborador.id}/editar`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  {colaborador.ativo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDesativar(colaborador.id, colaborador.nome)}
                    >
                      <UserX className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
