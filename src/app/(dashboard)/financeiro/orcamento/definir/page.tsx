'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Target,
  TrendingUp,
  TrendingDown,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/types/financeiro'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const anos = ['2024', '2025', '2026', '2027']

const categoriasReceitas = [
  'Receita com Produtos',
  'Receita com Servicos',
  'Outras Receitas',
  'Receitas Financeiras',
]

const categoriasDespesas = [
  'Custos Variaveis',
  'Despesas com Ocupacao',
  'Despesas com Servicos',
  'Despesas com Pessoal',
  'Impostos',
  'Despesas Financeiras',
]

interface OrcamentoItem {
  categoria: string
  tipo: 'RECEITA' | 'DESPESA'
  valores: number[]
}

interface OrcamentoSalvo {
  id: string
  ano: number
  mes: number
  categoria: string
  tipo: string
  valorOrcado: number
}

export default function DefinirOrcamentoPage() {
  const [anoSelecionado, setAnoSelecionado] = useState(String(new Date().getFullYear()))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Estado para os valores de orçamento
  const [receitas, setReceitas] = useState<OrcamentoItem[]>(
    categoriasReceitas.map((cat) => ({
      categoria: cat,
      tipo: 'RECEITA',
      valores: Array(12).fill(0),
    }))
  )

  const [despesas, setDespesas] = useState<OrcamentoItem[]>(
    categoriasDespesas.map((cat) => ({
      categoria: cat,
      tipo: 'DESPESA',
      valores: Array(12).fill(0),
    }))
  )

  // Carregar orçamentos existentes
  const carregarOrcamentos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/financeiro/orcamento?ano=${anoSelecionado}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar orcamentos')
      }

      const orcamentos: OrcamentoSalvo[] = await response.json()

      // Resetar valores
      const novasReceitas = categoriasReceitas.map((cat) => ({
        categoria: cat,
        tipo: 'RECEITA' as const,
        valores: Array(12).fill(0),
      }))

      const novasDespesas = categoriasDespesas.map((cat) => ({
        categoria: cat,
        tipo: 'DESPESA' as const,
        valores: Array(12).fill(0),
      }))

      // Preencher com dados salvos
      orcamentos.forEach((orc) => {
        if (orc.tipo === 'RECEITA') {
          const idx = novasReceitas.findIndex((r) => r.categoria === orc.categoria)
          if (idx >= 0) {
            novasReceitas[idx].valores[orc.mes - 1] = orc.valorOrcado
          }
        } else {
          const idx = novasDespesas.findIndex((d) => d.categoria === orc.categoria)
          if (idx >= 0) {
            novasDespesas[idx].valores[orc.mes - 1] = orc.valorOrcado
          }
        }
      })

      setReceitas(novasReceitas)
      setDespesas(novasDespesas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [anoSelecionado])

  useEffect(() => {
    carregarOrcamentos()
  }, [carregarOrcamentos])

  // Atualizar valor de receita
  const atualizarReceita = (categoriaIdx: number, mesIdx: number, valor: number) => {
    setReceitas((prev) => {
      const novas = [...prev]
      novas[categoriaIdx] = {
        ...novas[categoriaIdx],
        valores: [...novas[categoriaIdx].valores],
      }
      novas[categoriaIdx].valores[mesIdx] = valor
      return novas
    })
  }

  // Atualizar valor de despesa
  const atualizarDespesa = (categoriaIdx: number, mesIdx: number, valor: number) => {
    setDespesas((prev) => {
      const novas = [...prev]
      novas[categoriaIdx] = {
        ...novas[categoriaIdx],
        valores: [...novas[categoriaIdx].valores],
      }
      novas[categoriaIdx].valores[mesIdx] = valor
      return novas
    })
  }

  // Calcular totais por categoria (linha)
  const calcularTotalLinha = (valores: number[]) => {
    return valores.reduce((acc, v) => acc + v, 0)
  }

  // Calcular totais por mês (coluna)
  const totaisPorMesReceitas = useMemo(() => {
    return mesesAbrev.map((_, mesIdx) =>
      receitas.reduce((acc, r) => acc + r.valores[mesIdx], 0)
    )
  }, [receitas])

  const totaisPorMesDespesas = useMemo(() => {
    return mesesAbrev.map((_, mesIdx) =>
      despesas.reduce((acc, d) => acc + d.valores[mesIdx], 0)
    )
  }, [despesas])

  // Total geral
  const totalGeralReceitas = useMemo(() => {
    return receitas.reduce((acc, r) => acc + calcularTotalLinha(r.valores), 0)
  }, [receitas])

  const totalGeralDespesas = useMemo(() => {
    return despesas.reduce((acc, d) => acc + calcularTotalLinha(d.valores), 0)
  }, [despesas])

  // Salvar orçamento
  const salvarOrcamento = async () => {
    try {
      setSaving(true)

      // Preparar todos os itens para salvar
      const itensParaSalvar: Array<{
        ano: number
        mes: number
        categoria: string
        tipo: string
        valorOrcado: number
      }> = []

      // Adicionar receitas
      receitas.forEach((r) => {
        r.valores.forEach((valor, mesIdx) => {
          if (valor > 0) {
            itensParaSalvar.push({
              ano: parseInt(anoSelecionado),
              mes: mesIdx + 1,
              categoria: r.categoria,
              tipo: r.tipo,
              valorOrcado: valor,
            })
          }
        })
      })

      // Adicionar despesas
      despesas.forEach((d) => {
        d.valores.forEach((valor, mesIdx) => {
          if (valor > 0) {
            itensParaSalvar.push({
              ano: parseInt(anoSelecionado),
              mes: mesIdx + 1,
              categoria: d.categoria,
              tipo: d.tipo,
              valorOrcado: valor,
            })
          }
        })
      })

      // Salvar cada item
      for (const item of itensParaSalvar) {
        const response = await fetch('/api/financeiro/orcamento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })

        if (!response.ok) {
          throw new Error(`Erro ao salvar orcamento: ${item.categoria} - ${mesesAbrev[item.mes - 1]}`)
        }
      }

      toast({
        title: 'Orcamento salvo!',
        description: `${itensParaSalvar.length} itens salvos com sucesso.`,
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatInputValue = (value: number) => {
    return value === 0 ? '' : value.toString()
  }

  const parseInputValue = (value: string) => {
    const parsed = parseFloat(value.replace(',', '.'))
    return isNaN(parsed) ? 0 : parsed
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/financeiro/orcamento"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Orcamento
      </Link>

      {/* Header com gradiente amarelo/laranja */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Definir Orcamento</h1>
                <p className="text-amber-100 text-sm md:text-base">
                  Configure os valores orcados para cada categoria
                </p>
              </div>
            </div>
            <Button
              onClick={salvarOrcamento}
              disabled={saving || loading}
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Orcamento
                </>
              )}
            </Button>
          </div>

          {/* Mini cards no header */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-200" />
                <span className="text-xs text-amber-200">Total Receitas</span>
              </div>
              <p className="text-lg font-bold text-green-300">
                {formatCurrency(totalGeralReceitas)}
              </p>
            </div>

            <div
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-amber-200" />
                <span className="text-xs text-amber-200">Total Despesas</span>
              </div>
              <p className="text-lg font-bold text-red-300">
                {formatCurrency(totalGeralDespesas)}
              </p>
            </div>

            <div
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-amber-200" />
                <span className="text-xs text-amber-200">Resultado</span>
              </div>
              <p
                className={cn(
                  'text-lg font-bold',
                  totalGeralReceitas - totalGeralDespesas >= 0 ? 'text-green-300' : 'text-red-300'
                )}
              >
                {formatCurrency(totalGeralReceitas - totalGeralDespesas)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Ano */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Ano:</span>
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Receitas */}
      {!loading && !error && (
        <>
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Receitas
              </CardTitle>
              <CardDescription>
                Defina os valores orcados para cada categoria de receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50 dark:bg-green-900/20">
                      <TableHead className="min-w-[180px] sticky left-0 bg-green-50 dark:bg-green-900/20 z-10">
                        Categoria
                      </TableHead>
                      {mesesAbrev.map((mes) => (
                        <TableHead key={mes} className="text-center min-w-[100px]">
                          {mes}
                        </TableHead>
                      ))}
                      <TableHead className="text-right min-w-[120px] font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitas.map((item, catIdx) => (
                      <TableRow
                        key={item.categoria}
                        className="hover:bg-green-50/50 dark:hover:bg-green-900/10"
                      >
                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-950 z-10">
                          {item.categoria}
                        </TableCell>
                        {item.valores.map((valor, mesIdx) => (
                          <TableCell key={mesIdx} className="p-1">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formatInputValue(valor)}
                              onChange={(e) =>
                                atualizarReceita(catIdx, mesIdx, parseInputValue(e.target.value))
                              }
                              className="w-full text-right h-8 text-sm"
                              placeholder="0,00"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(calcularTotalLinha(item.valores))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-green-100 dark:bg-green-900/30 font-semibold">
                      <TableCell className="sticky left-0 bg-green-100 dark:bg-green-900/30 z-10">
                        TOTAL RECEITAS
                      </TableCell>
                      {totaisPorMesReceitas.map((total, idx) => (
                        <TableCell key={idx} className="text-right text-green-600">
                          {formatCurrency(total)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-green-700 dark:text-green-400 text-lg">
                        {formatCurrency(totalGeralReceitas)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Despesas */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Despesas
              </CardTitle>
              <CardDescription>
                Defina os valores orcados para cada categoria de despesa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-50 dark:bg-red-900/20">
                      <TableHead className="min-w-[180px] sticky left-0 bg-red-50 dark:bg-red-900/20 z-10">
                        Categoria
                      </TableHead>
                      {mesesAbrev.map((mes) => (
                        <TableHead key={mes} className="text-center min-w-[100px]">
                          {mes}
                        </TableHead>
                      ))}
                      <TableHead className="text-right min-w-[120px] font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas.map((item, catIdx) => (
                      <TableRow
                        key={item.categoria}
                        className="hover:bg-red-50/50 dark:hover:bg-red-900/10"
                      >
                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-950 z-10">
                          {item.categoria}
                        </TableCell>
                        {item.valores.map((valor, mesIdx) => (
                          <TableCell key={mesIdx} className="p-1">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formatInputValue(valor)}
                              onChange={(e) =>
                                atualizarDespesa(catIdx, mesIdx, parseInputValue(e.target.value))
                              }
                              className="w-full text-right h-8 text-sm"
                              placeholder="0,00"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(calcularTotalLinha(item.valores))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-red-100 dark:bg-red-900/30 font-semibold">
                      <TableCell className="sticky left-0 bg-red-100 dark:bg-red-900/30 z-10">
                        TOTAL DESPESAS
                      </TableCell>
                      {totaisPorMesDespesas.map((total, idx) => (
                        <TableCell key={idx} className="text-right text-red-600">
                          {formatCurrency(total)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-red-700 dark:text-red-400 text-lg">
                        {formatCurrency(totalGeralDespesas)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Final */}
          <Card
            className={cn(
              'animate-fade-in-up border-2',
              totalGeralReceitas - totalGeralDespesas >= 0
                ? 'border-green-500/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
                : 'border-red-500/30 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
            )}
            style={{ animationDelay: '0.4s' }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Resultado Orcado Anual</h3>
                  <p className="text-sm text-muted-foreground">
                    Receitas - Despesas = Resultado
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    {formatCurrency(totalGeralReceitas)} - {formatCurrency(totalGeralDespesas)}
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      totalGeralReceitas - totalGeralDespesas >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {totalGeralReceitas - totalGeralDespesas >= 0 ? '+' : ''}
                    {formatCurrency(totalGeralReceitas - totalGeralDespesas)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar no final */}
          <div className="flex justify-end">
            <Button
              onClick={salvarOrcamento}
              disabled={saving || loading}
              size="lg"
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Orcamento
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
