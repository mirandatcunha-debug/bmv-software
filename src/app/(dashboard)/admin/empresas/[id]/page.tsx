'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  Loader2,
  UserPlus,
  Users,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  History,
  FileText,
  TrendingUp,
  Shield,
  Power,
  Edit,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { roleLabels, roleColors } from '@/lib/permissions'
import { cn } from '@/lib/utils'

interface Tenant {
  id: string
  nome: string
  cnpj: string | null
  email: string
  telefone: string | null
  ativo: boolean
  criadoEm: string
}

interface User {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  primeiroAcesso: boolean
  tokenConvite: string | null
  criadoEm: string
}

// Mock data
const empresaMock: Tenant = {
  id: '1',
  nome: 'Tech Solutions S.A.',
  cnpj: '98.765.432/0001-10',
  email: 'admin@techsolutions.com',
  telefone: '(21) 98888-8888',
  ativo: true,
  criadoEm: '2024-02-20',
}

const usuariosMock: User[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    email: 'carlos@techsolutions.com',
    perfil: 'GESTOR',
    ativo: true,
    primeiroAcesso: false,
    tokenConvite: null,
    criadoEm: '2024-02-20',
  },
  {
    id: '2',
    nome: 'Ana Santos',
    email: 'ana@techsolutions.com',
    perfil: 'OPERADOR',
    ativo: true,
    primeiroAcesso: false,
    tokenConvite: null,
    criadoEm: '2024-03-01',
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    email: 'pedro@techsolutions.com',
    perfil: 'VISUALIZADOR',
    ativo: true,
    primeiroAcesso: true,
    tokenConvite: 'abc123xyz',
    criadoEm: '2024-04-15',
  },
]

// Histórico mockado
const historicoMock = [
  { data: '2024-04-15', acao: 'Usuario convidado', descricao: 'Pedro Costa foi convidado como Visualizador', usuario: 'Carlos Silva' },
  { data: '2024-03-01', acao: 'Usuario adicionado', descricao: 'Ana Santos foi adicionada como Operador', usuario: 'Carlos Silva' },
  { data: '2024-02-20', acao: 'Empresa criada', descricao: 'Tech Solutions S.A. foi cadastrada no sistema', usuario: 'Admin BM&V' },
]

export default function EmpresaDetalhesPage() {
  const params = useParams()
  const { toast } = useToast()
  const empresaId = params.id as string

  const [loading, setLoading] = useState(true)
  const [empresa, setEmpresa] = useState<Tenant | null>(null)
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dados')

  useEffect(() => {
    fetchData()
  }, [empresaId])

  const fetchData = async () => {
    try {
      setLoading(true)

      const empresaRes = await fetch(`/api/admin/tenants/${empresaId}`)
      if (empresaRes.ok) {
        const empresaData = await empresaRes.json()
        setEmpresa(empresaData)
      } else {
        setEmpresa(empresaMock)
      }

      const usuariosRes = await fetch(`/api/admin/tenants/${empresaId}/users`)
      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json()
        setUsuarios(usuariosData)
      } else {
        setUsuarios(usuariosMock)
      }
    } catch {
      setEmpresa(empresaMock)
      setUsuarios(usuariosMock)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = (user: User) => {
    if (user.tokenConvite) {
      const link = `${window.location.origin}/convite/${user.tokenConvite}`
      navigator.clipboard.writeText(link)
      setCopiedId(user.id)
      toast({
        title: 'Link copiado!',
        description: 'O link de convite foi copiado para a area de transferencia.',
      })
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const resendInvite = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
      })

      if (response.ok) {
        toast({
          title: 'Convite reenviado!',
          description: 'Um novo link de convite foi gerado.',
        })
        fetchData()
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel reenviar o convite',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-bmv-primary" />
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
          <div className="relative p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mt-4 mb-2">Empresa nao encontrada</h3>
        <p className="text-muted-foreground mb-4">
          A empresa que voce procura nao existe ou foi removida.
        </p>
        <Link href="/admin/empresas">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Empresas
          </Button>
        </Link>
      </div>
    )
  }

  // Métricas
  const usuariosAtivos = usuarios.filter((u) => u.ativo && !u.primeiroAcesso).length
  const convitesPendentes = usuarios.filter((u) => u.primeiroAcesso).length
  const diasCadastro = Math.floor((new Date().getTime() - new Date(empresa.criadoEm).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/empresas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Empresas
      </Link>

      {/* Header com info da empresa */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white animate-fade-in-up">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo/Avatar */}
              <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
                <span className="text-2xl font-bold">{empresa.nome.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold">{empresa.nome}</h1>
                  <Badge
                    className={cn(
                      "text-xs font-medium",
                      empresa.ativo
                        ? "bg-green-400/20 text-green-100 border-green-400/30"
                        : "bg-red-400/20 text-red-100 border-red-400/30"
                    )}
                  >
                    {empresa.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <p className="text-blue-100 mt-1">
                  CNPJ: {empresa.cnpj || 'Nao informado'}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-blue-200">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {empresa.email}
                  </span>
                  {empresa.telefone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {empresa.telefone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Link href={`/admin/empresas/${empresaId}/usuarios/novo`}>
                <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-blue-900/30">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuario
                </Button>
              </Link>
            </div>
          </div>

          {/* Cards de métricas no header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Total Usuarios</span>
              </div>
              <p className="text-2xl font-bold">{usuarios.length}</p>
              <p className="text-xs text-blue-200">{usuariosAtivos} ativos</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Convites</span>
              </div>
              <p className="text-2xl font-bold text-amber-300">{convitesPendentes}</p>
              <p className="text-xs text-blue-200">pendentes</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Cadastro</span>
              </div>
              <p className="text-2xl font-bold">{diasCadastro}</p>
              <p className="text-xs text-blue-200">dias atras</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/15 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Atividade</span>
              </div>
              <p className="text-2xl font-bold text-emerald-300">Alta</p>
              <p className="text-xs text-blue-200">esta semana</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dados" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuarios</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {usuarios.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historico</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dados */}
        <TabsContent value="dados" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Informacoes da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium">{empresa.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{empresa.cnpj || 'Nao informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{empresa.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{empresa.telefone || 'Nao informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      className={cn(
                        empresa.ativo
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {empresa.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Criada em</p>
                    <p className="font-medium">
                      {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Endereco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Endereco nao cadastrado
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Usuários */}
        <TabsContent value="usuarios" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Usuarios ({usuarios.length})
                </CardTitle>
                <CardDescription>
                  Lista de usuarios vinculados a esta empresa
                </CardDescription>
              </div>
              <Link href={`/admin/empresas/${empresaId}/usuarios/novo`}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuario
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {usuarios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
                    <div className="relative p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
                      <Users className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                  <Sparkles className="h-6 w-6 text-blue-400 mx-auto mt-4 animate-pulse" />
                  <h3 className="text-xl font-semibold mt-4 mb-2">Nenhum usuario cadastrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Comece adicionando o primeiro usuario (gestor) para esta empresa.
                  </p>
                  <Link href={`/admin/empresas/${empresaId}/usuarios/novo?primeiro=true`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Primeiro Usuario
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead className="text-right">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((user, index) => {
                        const roleColor = roleColors[user.perfil as keyof typeof roleColors] || {
                          bg: 'bg-slate-100',
                          text: 'text-slate-700',
                        }
                        return (
                          <TableRow
                            key={user.id}
                            className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all animate-fade-in-up"
                            style={{ animationDelay: `${0.05 * index}s` }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                  <span className="font-semibold text-blue-600">
                                    {user.nome.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium group-hover:text-blue-600 transition-colors">{user.nome}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text}`}
                              >
                                <Shield className="h-3 w-3" />
                                {roleLabels[user.perfil as keyof typeof roleLabels] || user.perfil}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.primeiroAcesso ? (
                                <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              ) : user.ativo ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  Inativo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right">
                              {user.primeiroAcesso && user.tokenConvite ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyInviteLink(user)}
                                    className="gap-1"
                                  >
                                    {copiedId === user.id ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                    Copiar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resendInvite(user.id)}
                                    className="gap-1"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    Reenviar
                                  </Button>
                                </div>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="cursor-pointer">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className={cn(
                                      "cursor-pointer",
                                      user.ativo ? "text-red-600" : "text-green-600"
                                    )}>
                                      <Power className="h-4 w-4 mr-2" />
                                      {user.ativo ? 'Desativar' : 'Ativar'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configurações */}
        <TabsContent value="configuracoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Configuracoes
              </CardTitle>
              <CardDescription>
                Configuracoes especificas para esta empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-slate-600/20 rounded-full blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full">
                    <Settings className="h-12 w-12 text-slate-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Em breve</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Configuracoes avancadas da empresa serao disponibilizadas em uma proxima atualizacao.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Historico de Atividades
              </CardTitle>
              <CardDescription>
                Registro de todas as acoes realizadas nesta empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicoMock.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <History className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.acao}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        por {item.usuario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
