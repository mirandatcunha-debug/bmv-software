'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Plus,
  Search,
  Users,
  Edit,
  Power,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

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

export default function EmpresasPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
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
        // Se nao houver dados ou erro, usar dados mockados para visualizacao
        setEmpresas([
          {
            id: '1',
            nome: 'Empresa ABC Ltda',
            cnpj: '12.345.678/0001-90',
            email: 'contato@empresaabc.com.br',
            telefone: '(11) 99999-9999',
            ativo: true,
            criadoEm: '2024-01-15',
            _count: { usuarios: 5 },
          },
          {
            id: '2',
            nome: 'Tech Solutions S.A.',
            cnpj: '98.765.432/0001-10',
            email: 'admin@techsolutions.com',
            telefone: '(21) 98888-8888',
            ativo: true,
            criadoEm: '2024-02-20',
            _count: { usuarios: 12 },
          },
        ])
      }
    } catch (error) {
      // Em caso de erro, usar dados mockados
      setEmpresas([
        {
          id: '1',
          nome: 'Empresa ABC Ltda',
          cnpj: '12.345.678/0001-90',
          email: 'contato@empresaabc.com.br',
          telefone: '(11) 99999-9999',
          ativo: true,
          criadoEm: '2024-01-15',
          _count: { usuarios: 5 },
        },
      ])
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
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel atualizar o status',
        variant: 'destructive',
      })
    }
  }

  const empresasFiltradas = empresas.filter(
    (empresa) =>
      empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.cnpj?.includes(searchTerm) ||
      empresa.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-bmv-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-bmv-primary" />
            Gestao de Empresas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <Link href="/admin/empresas/nova">
          <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {empresasFiltradas.length} empresa(s)
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left p-4 font-medium text-sm">Empresa</th>
                  <th className="text-left p-4 font-medium text-sm">CNPJ</th>
                  <th className="text-left p-4 font-medium text-sm">Email</th>
                  <th className="text-center p-4 font-medium text-sm">Usuarios</th>
                  <th className="text-center p-4 font-medium text-sm">Status</th>
                  <th className="text-right p-4 font-medium text-sm">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.map((empresa) => (
                  <tr
                    key={empresa.id}
                    className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="p-4">
                      <Link href={`/admin/empresas/${empresa.id}`}>
                        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                          <div className="h-10 w-10 rounded-lg bg-bmv-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-bmv-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{empresa.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              Desde {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-sm">{empresa.cnpj || '-'}</td>
                    <td className="p-4 text-sm">{empresa.email}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        {empresa._count?.usuarios || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          empresa.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {empresa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/empresas/${empresa.id}`}>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={empresa.ativo ? 'text-red-500' : 'text-green-500'}
                          onClick={() => toggleStatus(empresa.id, empresa.ativo)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {empresasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
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
