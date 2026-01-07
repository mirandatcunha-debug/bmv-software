'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, AlertTriangle, Loader2, Trash2, FolderKanban } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { useToast } from '@/hooks/use-toast'
import { consultoriaService } from '@/services/consultoria.service'
import { Projeto, statusProjetoLabels, statusProjetoCores } from '@/types/consultoria'
import { cn } from '@/lib/utils'

// Projeto mock para simulação
const projetoMock: Projeto = {
  id: '1',
  tenantId: '1',
  nome: 'Implementação ERP',
  descricao: 'Implementação completa do sistema ERP na empresa ABC',
  
  cliente: { id: '1', nome: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-00', email: 'contato@abc.com.br' },
  dataInicio: new Date('2026-01-01'),
  dataFim: new Date('2026-06-30'),
  status: 'EM_ANDAMENTO',
  progresso: 45,
  criadoEm: new Date('2025-12-15'),
  atualizadoEm: new Date('2026-01-05'),
}

export default function ExcluirProjetoPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { tenant } = useTenant()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [loadingProjeto, setLoadingProjeto] = useState(true)
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [confirmacao, setConfirmacao] = useState('')

  useEffect(() => {
    const carregarProjeto = async () => {
      try {
        // Simular carregamento - em produção usaria consultoriaService.projetos.getProjeto(params.id)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Usar mock por enquanto
        setProjeto(projetoMock)
      } catch (error) {
        console.error('Erro ao carregar projeto:', error)
        toast({
          title: 'Erro ao carregar projeto',
          description: 'Não foi possível carregar os dados do projeto.',
          variant: 'destructive',
        })
      } finally {
        setLoadingProjeto(false)
      }
    }

    carregarProjeto()
  }, [params.id, toast])

  const handleExcluir = async () => {
    if (!projeto) return

    if (confirmacao !== projeto.nome) {
      toast({
        title: 'Confirmação incorreta',
        description: 'Digite o nome do projeto exatamente como mostrado para confirmar a exclusão.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      await consultoriaService.projetos.deleteProjeto(params.id as string)

      toast({
        title: 'Projeto excluído!',
        description: `O projeto "${projeto.nome}" foi excluído permanentemente.`,
      })

      router.push('/consultoria/projetos')
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      toast({
        title: 'Erro ao excluir projeto',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao excluir o projeto. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingProjeto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
          <p className="text-muted-foreground mb-4">O projeto que você está tentando excluir não existe.</p>
          <Link href="/consultoria/projetos">
            <Button>Voltar para Projetos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href={`/consultoria/projetos/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Projeto
        </Link>

        <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
          <Trash2 className="h-7 w-7" />
          Excluir Projeto
        </h1>
        <p className="text-muted-foreground">
          Esta ação não pode ser desfeita
        </p>
      </div>

      {/* Warning Card */}
      <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                Atenção! Você está prestes a excluir este projeto
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Todas as tarefas do projeto serão excluídas</li>
                <li>• Todos os arquivos anexados serão removidos</li>
                <li>• O histórico de atividades será perdido</li>
                <li>• Esta ação é irreversível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-orange-500" />
            Projeto a ser excluído
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-lg">{projeto.nome}</h4>
                <p className="text-sm text-muted-foreground mt-1">{projeto.descricao}</p>
              </div>
              <Badge className={cn('shrink-0', statusProjetoCores[projeto.status])}>
                {statusProjetoLabels[projeto.status]}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <p className="font-medium">{projeto.cliente?.nome || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Progresso:</span>
                <p className="font-medium">{projeto.progresso || 0}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Data de Início:</span>
                <p className="font-medium">{formatDate(projeto.dataInicio)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Data de Término:</span>
                <p className="font-medium">{formatDate(projeto.dataFim)}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="confirmacao" className="text-red-600">
              Para confirmar, digite o nome do projeto: <strong>{projeto.nome}</strong>
            </Label>
            <Input
              id="confirmacao"
              placeholder="Digite o nome do projeto"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              disabled={loading}
              className="border-red-200 focus:border-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleExcluir}
              disabled={loading || confirmacao !== projeto.nome}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Projeto
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
