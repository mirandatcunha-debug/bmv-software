'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Clock,
  AlertCircle,
  Filter,
  Shield,
  UserPlus,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { UsuarioLista, perfilLabels } from '@/types/configuracoes'

export default function UsuariosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<UsuarioLista[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPerfil, setFilterPerfil] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [hasPermission, setHasPermission] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioLista | null>(null)
  const [dialogAction, setDialogAction] = useState<'ativar' | 'desativar' | null>(null)

  useEffect(() => {
    checkPermissionAndFetch()
  }, [])

  useEffect(() => {
    filterUsuarios()
  }, [usuarios, searchTerm, filterPerfil, filterStatus])

  const checkPermissionAndFetch = async () => {
    try {
      const meResponse = await fetch('/api/auth/me')
      if (meResponse.ok) {
        const userData = await meResponse.json()
        const canManage = ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(userData.perfil)
        setHasPermission(canManage)

        if (!canManage) {
          setLoading(false)
          return
        }
      }

      await fetchUsuarios()
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/configuracoes/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de usuários',
        variant: 'destructive',
      })
    }
  }

  const filterUsuarios = () => {
    let filtered = [...usuarios]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.nome.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
    }

    if (filterPerfil !== 'todos') {
      filtered = filtered.filter((u) => u.perfil === filterPerfil)
    }

    if (filterStatus !== 'todos') {
      const isAtivo = filterStatus === 'ativo'
      filtered = filtered.filter((u) => u.ativo === isAtivo)
    }

    setFilteredUsuarios(filtered)
  }

  const handleToggleStatus = (user: UsuarioLista) => {
    setSelectedUser(user)
    setDialogAction(user.ativo ? 'desativar' : 'ativar')
    setDialogOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/configuracoes/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !selectedUser.ativo }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: `Usuário ${selectedUser.ativo ? 'desativado' : 'ativado'} com sucesso`,
        })
        fetchUsuarios()
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao atualizar usuário',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar usuário',
        variant: 'destructive',
      })
    } finally {
      setDialogOpen(false)
      setSelectedUser(null)
      setDialogAction(null)
    }
  }

  const handleResendInvite = async (user: UsuarioLista) => {
    try {
      const response = await fetch(`/api/configuracoes/usuarios/${user.id}/reenviar-convite`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Convite reenviado com sucesso',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao reenviar convite',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao reenviar convite:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao reenviar convite',
        variant: 'destructive',
      })
    }
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (user: UsuarioLista) => {
    if (user.primeiroAcesso) {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      )
    }
    if (user.ativo) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
          <UserCheck className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700">
        <UserX className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  const getPerfilBadge = (perfil: string) => {
    const colors: Record<string, string> = {
      'ADMIN_BMV': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
      'CONSULTOR_BMV': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
      'GESTOR': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
      'COLABORADOR': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
      'CLIENTE': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
    }
    return (
      <Badge variant="outline" className={colors[perfil] || colors['COLABORADOR']}>
        <Shield className="h-3 w-3 mr-1" />
        {perfilLabels[perfil] || perfil}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="space-y-6 animate-in">
        <Link
          href="/configuracoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Configurações
        </Link>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Você não tem permissão para gerenciar usuários.
                  Entre em contato com o administrador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Usuários</h1>
              <p className="text-white/80">
                Gerencie os usuários e permissões da empresa
              </p>
            </div>
          </div>
          <Link href="/configuracoes/usuarios/convidar">
            <Button className="bg-white text-purple-600 hover:bg-white/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usuarios.length}</p>
                  <p className="text-xs text-muted-foreground">Total de Usuários</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/50">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {usuarios.filter((u) => u.ativo && !u.primeiroAcesso).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {usuarios.filter((u) => u.primeiroAcesso).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {usuarios.filter((u) => !u.ativo).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Inativos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterPerfil} onValueChange={setFilterPerfil}>
                <SelectTrigger className="w-[160px]">
                  <Shield className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Perfis</SelectItem>
                  <SelectItem value="GESTOR">Gestor</SelectItem>
                  <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchUsuarios}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsuarios.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhum usuário encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou convide novos usuários
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Último Acesso</TableHead>
                    <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-sm">
                              {getInitials(user.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.nome}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPerfilBadge(user.perfil)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(user.ultimoAcesso)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(user.criadoEm)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {user.primeiroAcesso && (
                              <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Reenviar Convite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.ativo ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2 text-red-500" />
                                  <span className="text-red-600">Desativar</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                                  <span className="text-green-600">Ativar</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogAction === 'ativar' ? (
                <UserCheck className="h-5 w-5 text-green-500" />
              ) : (
                <UserX className="h-5 w-5 text-red-500" />
              )}
              {dialogAction === 'ativar' ? 'Ativar Usuário' : 'Desativar Usuário'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'ativar'
                ? `Tem certeza que deseja ativar o usuário "${selectedUser?.nome}"? Ele poderá acessar o sistema novamente.`
                : `Tem certeza que deseja desativar o usuário "${selectedUser?.nome}"? Ele não poderá mais acessar o sistema.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={dialogAction === 'desativar' ? 'destructive' : 'default'}
              onClick={confirmToggleStatus}
              className={dialogAction === 'ativar' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {dialogAction === 'ativar' ? 'Ativar' : 'Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
