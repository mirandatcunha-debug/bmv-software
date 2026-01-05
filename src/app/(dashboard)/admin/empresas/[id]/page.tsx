'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  MoreHorizontal,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { roleLabels, roleColors } from '@/lib/permissions'

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

export default function EmpresaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const empresaId = params.id as string

  const [loading, setLoading] = useState(true)
  const [empresa, setEmpresa] = useState<Tenant | null>(null)
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [empresaId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Buscar empresa
      const empresaRes = await fetch(`/api/admin/tenants/${empresaId}`)
      if (empresaRes.ok) {
        const empresaData = await empresaRes.json()
        setEmpresa(empresaData)
      }

      // Buscar usuarios
      const usuariosRes = await fetch(`/api/admin/tenants/${empresaId}/users`)
      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json()
        setUsuarios(usuariosData)
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar os dados',
        variant: 'destructive',
      })
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
        const data = await response.json()
        toast({
          title: 'Convite reenviado!',
          description: 'Um novo link de convite foi gerado.',
        })
        fetchData()
      }
    } catch (error) {
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
        <p className="text-muted-foreground">Empresa nao encontrada</p>
        <Link href="/admin/empresas">
          <Button variant="outline" className="mt-4">
            Voltar para Empresas
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <Link
          href="/admin/empresas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Empresas
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-bmv-primary" />
              {empresa.nome}
            </h1>
            <p className="text-muted-foreground">
              CNPJ: {empresa.cnpj || 'Nao informado'}
            </p>
          </div>
          <Link href={`/admin/empresas/${empresaId}/usuarios/novo`}>
            <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Info da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium">{empresa.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="font-medium">{empresa.telefone || 'Nao informado'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className={`font-medium ${empresa.ativo ? 'text-green-600' : 'text-red-600'}`}>
                {empresa.ativo ? 'Ativa' : 'Inativa'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Criada em</Label>
              <p className="font-medium">
                {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios ({usuarios.length})
          </CardTitle>
          <CardDescription>
            Lista de usuarios vinculados a esta empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum usuario cadastrado ainda
              </p>
              <Link href={`/admin/empresas/${empresaId}/usuarios/novo?primeiro=true`}>
                <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Primeiro Usuario (Gestor)
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((user) => {
                  const roleColor = roleColors[user.perfil as keyof typeof roleColors] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                  }
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text}`}
                        >
                          {roleLabels[user.perfil as keyof typeof roleLabels] || user.perfil}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.primeiroAcesso ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Mail className="h-3 w-3" />
                            Pendente
                          </span>
                        ) : user.ativo ? (
                          <span className="text-green-600">Ativo</span>
                        ) : (
                          <span className="text-red-600">Inativo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.primeiroAcesso && user.tokenConvite && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyInviteLink(user)}
                            >
                              {copiedId === user.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendInvite(user.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
