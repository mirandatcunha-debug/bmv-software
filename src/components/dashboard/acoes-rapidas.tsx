'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, DollarSign, Receipt, CheckSquare } from 'lucide-react'

interface AcoesRapidasProps {
  perfil?: string
}

export function AcoesRapidas({ perfil }: AcoesRapidasProps) {
  // Colaborador e Cliente tem menos opções
  const isRestrito = perfil === 'COLABORADOR' || perfil === 'CLIENTE'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Ações Rápidas:
          </span>

          {!isRestrito && (
            <>
              <Link href="/financeiro/movimentacoes/nova?tipo=RECEITA">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <DollarSign className="h-4 w-4 mr-1" />
                  Nova Receita
                </Button>
              </Link>

              <Link href="/financeiro/movimentacoes/nova?tipo=DESPESA">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <Receipt className="h-4 w-4 mr-1" />
                  Nova Despesa
                </Button>
              </Link>
            </>
          )}

          <Link href="/processos/okr">
            <Button
              variant="outline"
              size="sm"
              className="text-bmv-primary border-bmv-primary/30 hover:bg-bmv-primary/5"
            >
              <Plus className="h-4 w-4 mr-1" />
              <CheckSquare className="h-4 w-4 mr-1" />
              Nova Tarefa
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
