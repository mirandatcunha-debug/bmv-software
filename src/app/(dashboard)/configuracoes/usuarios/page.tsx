'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      console.error('Erro ao verificar permissao:', error)
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
      console.error('Erro ao buscar usuarios:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de usuarios',
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
          description: `Usuario ${selectedUser.ativo ? 'desativado' : 'ativado'} com sucesso`,
        })
        fetchUsuarios()
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao atualizar usuario',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar usuario',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bmv-primary"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center gap-4">
          <Link href="/configuracoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Usuarios
            </h1>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Voce nao tem permissao para gerenciar usuarios.
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/configuracoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="h-7 w-7 text-purple-600" />
              Usuarios
            </h1>
            <p className="text-muted-foreground">
              Gerencie os usuarios da empresa
            </p>
          </div>
        </div>
        <Link href="/configuracoes/usuarios/convidar">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Convidar Usuario
          </Button>
        </Link>
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
            <div className="flex gap-2">
              <Select value={filterPerfil} onValueChange={setFilterPerfil}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
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
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatisticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{usuarios.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {usuarios.filter((u) => u.ativo).length}
                </p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {usuarios.filter((u) => u.primeiroAcesso).length}
                </p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {usuarios.filter((u) => !u.ativo).length}
                </p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum usuario encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ultimo Acesso</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-bmv-primary/10 text-bmv-primary text-sm">
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
                      <Badge variant="outline">
                        {perfilLabels[user.perfil] || user.perfil}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.primeiroAcesso ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                          Pendente
                        </Badge>
                      ) : user.ativo ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.ultimoAcesso)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.criadoEm)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.primeiroAcesso && (
                            <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar Convite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.ativo ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Ativar
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
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmacao */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'ativar' ? 'Ativar Usuario' : 'Desativar Usuario'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'ativar'
                ? `Tem certeza que deseja ativar o usuario "${selectedUser?.nome}"? Ele podera acessar o sistema novamente.`
                : `Tem certeza que deseja desativar o usuario "${selectedUser?.nome}"? Ele nao podera mais acessar o sistema.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={dialogAction === 'desativar' ? 'destructive' : 'default'}
              onClick={confirmToggleStatus}
            >
              {dialogAction === 'ativar' ? 'Ativar' : 'Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
