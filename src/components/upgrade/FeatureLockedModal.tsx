'use client'

import { Lock, Check, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

type PlanoType = 'TRIAL' | 'BASICO' | 'PROFISSIONAL' | 'ENTERPRISE'

interface FeatureLockedModalProps {
  funcionalidade: string
  planoNecessario: PlanoType
  planoAtual?: PlanoType
  open: boolean
  onOpenChange: (open: boolean) => void
}

const planosInfo: Record<PlanoType, { nome: string; ordem: number; recursos: string[] }> = {
  TRIAL: {
    nome: 'Trial',
    ordem: 0,
    recursos: [
      'Até 3 usuários',
      '2 contas bancárias',
      '1 projeto',
      'Suporte por email',
    ],
  },
  BASICO: {
    nome: 'Básico',
    ordem: 1,
    recursos: [
      'Até 5 usuários',
      '5 contas bancárias',
      '3 projetos',
      'Relatórios básicos',
      'Suporte por email',
    ],
  },
  PROFISSIONAL: {
    nome: 'Profissional',
    ordem: 2,
    recursos: [
      'Até 15 usuários',
      '10 contas bancárias',
      '10 projetos',
      'Relatórios avançados',
      'Análises de IA',
      'Suporte prioritário',
    ],
  },
  ENTERPRISE: {
    nome: 'Enterprise',
    ordem: 3,
    recursos: [
      'Usuários ilimitados',
      'Contas ilimitadas',
      'Projetos ilimitados',
      'Todos os recursos',
      'IA avançada',
      'Suporte dedicado',
      'API personalizada',
    ],
  },
}

export function FeatureLockedModal({
  funcionalidade,
  planoNecessario,
  planoAtual = 'TRIAL',
  open,
  onOpenChange,
}: FeatureLockedModalProps) {
  const planoAtualInfo = planosInfo[planoAtual]
  const planoNecessarioInfo = planosInfo[planoNecessario]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Lock className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center">Funcionalidade Bloqueada</DialogTitle>
          <DialogDescription className="text-center">
            <strong>{funcionalidade}</strong> está disponível a partir do plano{' '}
            <strong>{planoNecessarioInfo.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 grid grid-cols-2 gap-4">
          {/* Plano Atual */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 text-center">
              <span className="text-sm text-muted-foreground">Seu plano atual</span>
              <h4 className="font-semibold">{planoAtualInfo.nome}</h4>
            </div>
            <ul className="space-y-2">
              {planoAtualInfo.recursos.map((recurso, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  {recurso}
                </li>
              ))}
            </ul>
          </div>

          {/* Plano Necessário */}
          <div className="relative rounded-lg border-2 border-purple-500 bg-purple-50 p-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                Recomendado
              </span>
            </div>
            <div className="mb-3 text-center">
              <span className="text-sm text-purple-600">Faça upgrade</span>
              <h4 className="font-semibold text-purple-700">{planoNecessarioInfo.nome}</h4>
            </div>
            <ul className="space-y-2">
              {planoNecessarioInfo.recursos.map((recurso, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  {recurso}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 p-3">
          <p className="text-center text-sm text-purple-800">
            Desbloqueie <strong>{funcionalidade}</strong> e muito mais fazendo upgrade agora!
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-1.5 h-4 w-4" />
            Continuar no Atual
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/planos">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Ver Planos
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
