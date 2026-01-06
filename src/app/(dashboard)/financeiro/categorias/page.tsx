'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tags,
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { CategoriaFinanceira, TipoCategoria, categoriasReceita, categoriasDespesa } from '@/types/financeiro'
import { cn } from '@/lib/utils'

// Dados mockados
const categoriasMock: CategoriaFinanceira[] = [
  // Receitas
  ...categoriasReceita.map((nome, i) => ({
    id: `r${i}`,
    tenantId: '1',
    nome,
    tipo: 'RECEITA' as TipoCategoria,
    cor: '#16a34a',
    criadoEm: new Date(),
  })),
  // Despesas
  ...categoriasDespesa.map((nome, i) => ({
    id: `d${i}`,
    tenantId: '1',
    nome,
    tipo: 'DESPESA' as TipoCategoria,
    cor: '#dc2626',
    criadoEm: new Date(),
  })),
]

const coresOptions = [
  '#16a34a', '#dc2626', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#4f46e5', '#be185d'
]

export default function CategoriasPage() {
  const { toast } = useToast()
  const [categorias] = useState<CategoriaFinanceira[]>(categoriasMock)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tipoNova, setTipoNova] = useState<TipoCategoria>('RECEITA')
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', cor: '#16a34a' })

  const categoriasReceitas = categorias.filter((c) => c.tipo === 'RECEITA')
  const categoriasDespesas = categorias.filter((c) => c.tipo === 'DESPESA')

  const handleAddCategoria = () => {
    if (!novaCategoria.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Categoria criada!',
      description: `A categoria "${novaCategoria.nome}" foi adicionada.`,
    })

    setDialogOpen(false)
    setNovaCategoria({ nome: '', cor: '#16a34a' })
  }

  const openDialog = (tipo: TipoCategoria) => {
    setTipoNova(tipo)
    setNovaCategoria({
      nome: '',
      cor: tipo === 'RECEITA' ? '#16a34a' : '#dc2626',
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Financeiro
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Tags className="h-7 w-7 text-bmv-primary" />
          Categorias
        </h1>
        <p className="text-muted-foreground">
          Gerencie as categorias de receitas e despesas
        </p>
      </div>

      {/* Grid de Categorias */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receitas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-lg">Receitas</CardTitle>
                <CardDescription>Categorias de entrada</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => openDialog('RECEITA')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoriasReceitas.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.cor || '#16a34a' }}
                    />
                    <span className="font-medium">{cat.nome}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <CardTitle className="text-lg">Despesas</CardTitle>
                <CardDescription>Categorias de saida</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => openDialog('DESPESA')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoriasDespesas.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.cor || '#dc2626' }}
                    />
                    <span className="font-medium">{cat.nome}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nova Categoria */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {tipoNova === 'RECEITA' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Nova Categoria de {tipoNova === 'RECEITA' ? 'Receita' : 'Despesa'}
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar suas movimentacoes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                placeholder="Ex: Consultoria"
                value={novaCategoria.nome}
                onChange={(e) =>
                  setNovaCategoria((prev) => ({ ...prev, nome: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {coresOptions.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      novaCategoria.cor === cor
                        ? 'border-slate-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: cor }}
                    onClick={() =>
                      setNovaCategoria((prev) => ({ ...prev, cor }))
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddCategoria}
              className={cn(
                tipoNova === 'RECEITA'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
            >
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
