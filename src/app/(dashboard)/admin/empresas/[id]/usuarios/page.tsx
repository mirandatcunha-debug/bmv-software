'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Building2,
  Users,
  Plus,
  Search,
  Edit,
  Power,
  Copy,
  Check,
  Mail,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { roleLabels, roleColors, UserRole } from '@/lib/permissions'

// Dados mockados
const empresaMock = {
  id: '1',
  nome: 'Empresa ABC Ltda',
}

const usuariosMock = [
  {
    id: '1',
    nome: 'Joao Silva',
    email: 'joao@empresaabc.com.br',
    perfil: 'GESTOR' as UserRole,
    ativo: true,
    primeiroAcesso: false,
    tokenConvite: null,
    ultimoAcesso: new Date('2024-01-20'),
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@empresaabc.com.br',
    perfil: 'COLABORADOR' as UserRole,
    ativo: true,
    primeiroAcesso: true,
    tokenConvite: 'abc123def456',
    ultimoAcesso: null,
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    email: 'pedro@empresaabc.com.br',
    perfil: 'COLABORADOR' as UserRole,
    ativo: false,
    primeiroAcesso: false,
    tokenConvite: null,
    ultimoAcesso: new Date('2024-01-10'),
  },
]

export default function UsuariosEmpresaPage() {
  const params = useParams()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const empresa = empresaMock
  const usuarios = usuariosMock

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyInviteLink = (userId: string, token: string) => {
    const link = `${window.location.origin}/convite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(userId)
    toast({
      title: 'Link copiado!',
      description: 'O link de convite foi copiado para a area de transferencia.',
    })
    setTimeout(() => setCopiedId(null), 2000)
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
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{empresa.nome}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="h-7 w-7 text-bmv-primary" />
              Usuarios
            </h1>
            <p className="text-muted-foreground">
              Gerencie os usuarios desta empresa
            </p>
          </div>
          <Link href={`/admin/empresas/${params.id}/usuarios/novo`}>
            <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {usuariosFiltrados.length} usuario(s)
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left p-4 font-medium text-sm">Usuario</th>
                  <th className="text-left p-4 font-medium text-sm">Perfil</th>
                  <th className="text-center p-4 font-medium text-sm">Status</th>
                  <th className="text-center p-4 font-medium text-sm">Convite</th>
                  <th className="text-right p-4 font-medium text-sm">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => {
                  const colors = roleColors[usuario.perfil]
                  return (
                    <tr
                      key={usuario.id}
                      className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                          {roleLabels[usuario.perfil]}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.ativo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {usuario.primeiroAcesso && usuario.tokenConvite ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteLink(usuario.id, usuario.tokenConvite!)}
                          >
                            {copiedId === usuario.id ? (
                              <>
                                <Check className="h-4 w-4 mr-1 text-green-500" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copiar Link
                              </>
                            )}
                          </Button>
                        ) : usuario.primeiroAcesso ? (
                          <span className="text-xs text-amber-600">Pendente</span>
                        ) : (
                          <span className="text-xs text-green-600">Ativado</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={usuario.ativo ? 'text-red-500' : 'text-green-500'}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuario encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
