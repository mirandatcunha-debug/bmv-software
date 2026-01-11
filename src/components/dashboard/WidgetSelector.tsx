'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  Wallet,
  TrendingUp,
  Calendar,
  Users,
  Target,
  DollarSign,
  Brain,
  BarChart3,
  ListTodo,
} from 'lucide-react'

export interface WidgetOption {
  id: string
  nome: string
  descricao: string
  icone: React.ReactNode
  categoria: 'financeiro' | 'processos' | 'ia' | 'equipe'
  preview?: React.ReactNode
}

export const WIDGETS_DISPONIVEIS: WidgetOption[] = [
  {
    id: 'indicadores-financeiros',
    nome: 'Indicadores Financeiros',
    descricao: 'Saldo, receitas e despesas do mes',
    icone: <Wallet className="h-5 w-5" />,
    categoria: 'financeiro',
    preview: (
      <div className="grid grid-cols-3 gap-1 p-2">
        <div className="h-6 bg-green-100 dark:bg-green-900/30 rounded" />
        <div className="h-6 bg-blue-100 dark:bg-blue-900/30 rounded" />
        <div className="h-6 bg-red-100 dark:bg-red-900/30 rounded" />
      </div>
    ),
  },
  {
    id: 'grafico-receitas-despesas',
    nome: 'Grafico Receitas x Despesas',
    descricao: 'Comparativo visual do fluxo financeiro',
    icone: <BarChart3 className="h-5 w-5" />,
    categoria: 'financeiro',
    preview: (
      <div className="flex items-end gap-1 p-2 h-12">
        <div className="w-3 h-4 bg-green-400 rounded-t" />
        <div className="w-3 h-6 bg-green-400 rounded-t" />
        <div className="w-3 h-8 bg-green-400 rounded-t" />
        <div className="w-3 h-5 bg-red-400 rounded-t" />
        <div className="w-3 h-7 bg-red-400 rounded-t" />
        <div className="w-3 h-4 bg-red-400 rounded-t" />
      </div>
    ),
  },
  {
    id: 'contas-vencer',
    nome: 'Contas a Vencer',
    descricao: 'Proximos vencimentos e pendencias',
    icone: <Calendar className="h-5 w-5" />,
    categoria: 'financeiro',
    preview: (
      <div className="space-y-1 p-2">
        <div className="h-3 w-full bg-orange-100 dark:bg-orange-900/30 rounded" />
        <div className="h-3 w-3/4 bg-orange-100 dark:bg-orange-900/30 rounded" />
        <div className="h-3 w-1/2 bg-orange-100 dark:bg-orange-900/30 rounded" />
      </div>
    ),
  },
  {
    id: 'atividades-equipe',
    nome: 'Atividades da Equipe',
    descricao: 'Acompanhe o que a equipe esta fazendo',
    icone: <Users className="h-5 w-5" />,
    categoria: 'equipe',
    preview: (
      <div className="flex items-center gap-2 p-2">
        <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
        <div className="flex-1 space-y-1">
          <div className="h-2 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-2 w-1/2 bg-gray-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'objetivos-okr',
    nome: 'Objetivos OKR',
    descricao: 'Progresso dos seus objetivos e metas',
    icone: <Target className="h-5 w-5" />,
    categoria: 'processos',
    preview: (
      <div className="space-y-2 p-2">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-green-500 rounded-full" />
          </div>
          <span className="text-[10px] text-gray-500">75%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-yellow-500 rounded-full" />
          </div>
          <span className="text-[10px] text-gray-500">50%</span>
        </div>
      </div>
    ),
  },
  {
    id: 'fluxo-caixa',
    nome: 'Fluxo de Caixa',
    descricao: 'Visao geral do fluxo de caixa',
    icone: <DollarSign className="h-5 w-5" />,
    categoria: 'financeiro',
    preview: (
      <div className="flex items-end gap-1 p-2 h-12">
        <div className="w-2 h-3 bg-blue-300 rounded-t" />
        <div className="w-2 h-5 bg-blue-400 rounded-t" />
        <div className="w-2 h-8 bg-blue-500 rounded-t" />
        <div className="w-2 h-6 bg-blue-400 rounded-t" />
        <div className="w-2 h-4 bg-blue-300 rounded-t" />
      </div>
    ),
  },
  {
    id: 'insights-ia',
    nome: 'Insights IA',
    descricao: 'Analises inteligentes do seu negocio',
    icone: <Brain className="h-5 w-5" />,
    categoria: 'ia',
    preview: (
      <div className="space-y-1 p-2">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-purple-400 rounded-full" />
          <div className="h-2 flex-1 bg-purple-100 dark:bg-purple-900/30 rounded" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-teal-400 rounded-full" />
          <div className="h-2 flex-1 bg-teal-100 dark:bg-teal-900/30 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'projeto-consultoria',
    nome: 'Projeto de Consultoria',
    descricao: 'Status do seu projeto de consultoria',
    icone: <ListTodo className="h-5 w-5" />,
    categoria: 'processos',
    preview: (
      <div className="p-2">
        <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-blue-500 rounded-full" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">Fase 3</span>
          <span className="text-[10px] text-gray-500">67%</span>
        </div>
      </div>
    ),
  },
  {
    id: 'resumo-financeiro',
    nome: 'Resumo Financeiro',
    descricao: 'Visao completa das financas',
    icone: <TrendingUp className="h-5 w-5" />,
    categoria: 'financeiro',
    preview: (
      <div className="grid grid-cols-2 gap-1 p-2">
        <div className="h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
        </div>
      </div>
    ),
  },
]

interface WidgetSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedWidgets: string[]
  onSelectionChange: (widgets: string[]) => void
}

export function WidgetSelector({
  open,
  onOpenChange,
  selectedWidgets,
  onSelectionChange,
}: WidgetSelectorProps) {
  const [localSelection, setLocalSelection] = React.useState<string[]>(selectedWidgets)

  React.useEffect(() => {
    setLocalSelection(selectedWidgets)
  }, [selectedWidgets, open])

  const toggleWidget = (widgetId: string) => {
    setLocalSelection((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    )
  }

  const handleSave = () => {
    onSelectionChange(localSelection)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setLocalSelection(selectedWidgets)
    onOpenChange(false)
  }

  const categorias = {
    financeiro: 'Financeiro',
    processos: 'Processos',
    ia: 'Inteligencia Artificial',
    equipe: 'Equipe',
  }

  const widgetsPorCategoria = WIDGETS_DISPONIVEIS.reduce((acc, widget) => {
    if (!acc[widget.categoria]) {
      acc[widget.categoria] = []
    }
    acc[widget.categoria].push(widget)
    return acc
  }, {} as Record<string, WidgetOption[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Widget</DialogTitle>
          <DialogDescription>
            Selecione os widgets que deseja exibir no seu dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(widgetsPorCategoria).map(([categoria, widgets]) => (
            <div key={categoria}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                {categorias[categoria as keyof typeof categorias]}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {widgets.map((widget) => {
                  const isSelected = localSelection.includes(widget.id)
                  return (
                    <div
                      key={widget.id}
                      className={cn(
                        'relative border rounded-xl p-3 cursor-pointer transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      )}
                      onClick={() => toggleWidget(widget.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleWidget(widget.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              'p-1.5 rounded-lg',
                              isSelected
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                            )}>
                              {widget.icone}
                            </div>
                            <span className="font-medium text-sm text-gray-800 dark:text-slate-100">
                              {widget.nome}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                            {widget.descricao}
                          </p>
                          {/* Preview */}
                          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                            {widget.preview}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar ({localSelection.length} widgets)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
