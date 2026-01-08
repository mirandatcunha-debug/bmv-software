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
  Truck,
  UserPlus,
  Search,
  Eye,
  Pencil,
  UserX,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  ArrowLeft,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Supplier {
  id: string
  codigo: string
  nome: string
  tipo: string
  cpfCnpj: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  nomeContato: string | null
  observacoes: string | null
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  const [triggerSearch, setTriggerSearch] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (statusFilter !== 'todos') params.append('status', statusFilter)

        const response = await fetch('/api/cadastros/fornecedores?' + params.toString())
        if (response.ok) {
          const data = await response.json()
          setFornecedores(data)
        }
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [statusFilter, search, triggerSearch])

  const fetchFornecedores = () => {
    setTriggerSearch(prev => prev + 1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFornecedores()
  }

  const handleDesativar = async (id: string) => {
    if (!confirm('Deseja realmente desativar este fornecedor?')) return

    try {
      const response = await fetch('/api/cadastros/fornecedores/' + id, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchFornecedores()
      }
    } catch (error) {
      console.error('Erro ao desativar fornecedor:', error)
    }
  }

  const formatCpfCnpj = (value: string | null) => {
    if (!value) return '-'
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const fornecedoresAtivos = fornecedores.filter(f => f.ativo).length
  const fornecedoresPF = fornecedores.filter(f => f.tipo === 'PF').length
  const fornecedoresPJ = fornecedores.filter(f => f.tipo === 'PJ').length

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Breadcrumb */}
          <Link href="/cadastros" className="inline-flex items-center gap-2 text-purple-100 text-sm mb-3 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Cadastros</span>
          </Link>

          {/* Titulo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Fornecedores</h1>
                <p className="text-purple-100 text-sm md:text-base">
                  Gerencie seus fornecedores e parceiros
                </p>
              </div>
            </div>
            <Link href="/cadastros/fornecedores/novo">
              <Button
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            </Link>
          </div>

          {/* Mini cards de resumo no header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-purple-200" />
                <span className="text-xs text-purple-200">Total Ativos</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{fornecedoresAtivos}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-purple-200" />
                <span className="text-xs text-purple-200">Pessoa Fisica</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{fornecedoresPF}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-purple-200" />
                <span className="text-xs text-purple-200">Pessoa Juridica</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{fornecedoresPJ}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF/CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
              <Button type="button" variant="outline" onClick={fetchFornecedores}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Fornecedores */}
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
      ) : fornecedores.length === 0 ? (
        <Card className="animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando seu primeiro fornecedor.'}
            </p>
            <Link href="/cadastros/fornecedores/novo">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Fornecedor
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {fornecedores.map((fornecedor, index) => (
            <Card
              key={fornecedor.id}
              className={cn(
                "relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up",
                fornecedor.ativo
                  ? "border-l-purple-500 hover:border-l-purple-600"
                  : "border-l-slate-400 opacity-75"
              )}
              style={{ animationDelay: (0.05 * index) + 's' }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      fornecedor.tipo === 'PJ'
                        ? "bg-purple-100 dark:bg-purple-900/50"
                        : "bg-violet-100 dark:bg-violet-900/50"
                    )}>
                      {fornecedor.tipo === 'PJ' ? (
                        <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1">{fornecedor.nome}</CardTitle>
                      <CardDescription className="text-xs">
                        Codigo: {fornecedor.codigo}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={fornecedor.ativo ? "default" : "secondary"} className={cn(
                    "text-xs",
                    fornecedor.ativo
                      ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}>
                    {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {fornecedor.tipo === 'PJ' ? 'CNPJ:' : 'CPF:'}
                    </span>
                    {formatCpfCnpj(fornecedor.cpfCnpj)}
                  </div>

                  {fornecedor.telefone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{fornecedor.telefone}</span>
                    </div>
                  )}

                  {fornecedor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{fornecedor.email}</span>
                    </div>
                  )}

                  {(fornecedor.cidade || fornecedor.uf) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{[fornecedor.cidade, fornecedor.uf].filter(Boolean).join(' - ')}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground text-xs pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>Cadastrado em {formatDate(fornecedor.criadoEm)}</span>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Link href={'/cadastros/fornecedores/' + fornecedor.id} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={'/cadastros/fornecedores/' + fornecedor.id + '?edit=true'} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  {fornecedor.ativo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDesativar(fornecedor.id)}
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
