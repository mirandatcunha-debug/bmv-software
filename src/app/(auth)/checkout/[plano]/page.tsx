'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CreditCard, Check, Shield, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { PRECOS_PLANOS, formatarPreco, calcularDescontoAnual, PlanoType, PeriodoType } from '@/lib/pagamento'
import { PLAN_LIMITS } from '@/lib/plan-limits'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const planoParam = (params.plano as string)?.toUpperCase() as PlanoType

  const [periodo, setPeriodo] = useState<PeriodoType>('mensal')
  const [loading, setLoading] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Validar plano
  const planoValido = planoParam && PRECOS_PLANOS[planoParam]
  const plano = planoValido ? PRECOS_PLANOS[planoParam] : null
  const limites = planoValido ? PLAN_LIMITS[planoParam] : null

  useEffect(() => {
    if (!planoValido) {
      router.push('/planos')
    }
  }, [planoValido, router])

  if (!plano || !limites) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const precoAtual = periodo === 'mensal' ? plano.mensal : plano.anual
  const precoMensal = periodo === 'anual' ? Math.round(plano.anual / 12) : plano.mensal
  const desconto = calcularDescontoAnual(planoParam)

  // Simular pagamento (em produção, redirecionaria para gateway)
  const handleSimularPagamento = async () => {
    setProcessando(true)
    setErro(null)

    try {
      // Chamar API para ativar plano (simulação)
      const response = await fetch('/api/pagamento/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: `sim_${Date.now()}`,
              metadata: {
                plano: planoParam,
                periodo,
                // tenantId será obtido do usuário logado
              },
            },
          },
        }),
      })

      if (response.ok) {
        // Redirecionar para página de sucesso
        router.push(`/pagamento/sucesso?plano=${planoParam}&periodo=${periodo}`)
      } else {
        setErro('Erro ao processar pagamento. Tente novamente.')
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet.')
    } finally {
      setProcessando(false)
    }
  }

  // Ir para checkout real (quando integração estiver pronta)
  const handleCheckoutReal = async () => {
    setLoading(true)
    setErro(null)

    try {
      const response = await fetch('/api/pagamento/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoParam, periodo }),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Em produção, redirecionaria para URL do Stripe/MercadoPago
        // window.location.href = data.checkoutUrl

        // Por enquanto, simular
        handleSimularPagamento()
      } else {
        setErro(data.error || 'Erro ao criar sessão de checkout')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumo do Plano */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{plano.nome}</h1>
                <p className="text-slate-500">{plano.descricao}</p>
              </div>
            </div>

            {/* Toggle Mensal/Anual */}
            <div className="bg-slate-100 rounded-xl p-1 flex mb-6">
              <button
                onClick={() => setPeriodo('mensal')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  periodo === 'mensal'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPeriodo('anual')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  periodo === 'anual'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Anual
                <span className="ml-2 text-xs text-green-600 font-bold">-{desconto}%</span>
              </button>
            </div>

            {/* Preço */}
            <div className="text-center py-6 border-y border-slate-200">
              <div className="text-5xl font-bold text-slate-900">
                {formatarPreco(precoMensal)}
                <span className="text-lg font-normal text-slate-500">/mês</span>
              </div>
              {periodo === 'anual' && (
                <p className="text-sm text-slate-500 mt-2">
                  Cobrado anualmente ({formatarPreco(precoAtual)})
                </p>
              )}
            </div>

            {/* Recursos Inclusos */}
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-4">Recursos inclusos:</h3>
              <div className="flex items-center gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{limites.usuarios === -1 ? 'Usuários ilimitados' : `Até ${limites.usuarios} usuários`}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{limites.contasBancarias === -1 ? 'Contas bancárias ilimitadas' : `${limites.contasBancarias} contas bancárias`}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{limites.projetos === -1 ? 'Projetos ilimitados' : `${limites.projetos} projetos de consultoria`}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{limites.analisesIA === -1 ? 'Análises IA ilimitadas' : `${limites.analisesIA} análises IA/mês`}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Suporte prioritário</span>
              </div>
            </div>
          </div>

          {/* Formulário de Pagamento */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Finalizar Assinatura
            </h2>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {erro}
              </div>
            )}

            {/* Info de Segurança */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Pagamento Seguro</p>
                  <p className="text-sm text-slate-600">
                    Seus dados são protegidos com criptografia de ponta a ponta.
                    Processado via Stripe.
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="border border-slate-200 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-slate-900 mb-3">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{plano.nome} ({periodo})</span>
                  <span className="text-slate-900">{formatarPreco(precoAtual)}</span>
                </div>
                {periodo === 'anual' && (
                  <div className="flex justify-between text-green-600">
                    <span>Economia anual</span>
                    <span>-{formatarPreco((plano.mensal * 12) - plano.anual)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatarPreco(precoAtual)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              {/* Botão de Simulação (apenas durante desenvolvimento) */}
              <button
                onClick={handleSimularPagamento}
                disabled={processando || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Simular Pagamento (Dev)
                  </>
                )}
              </button>

              {/* Botão Real (desabilitado até integração) */}
              <button
                onClick={handleCheckoutReal}
                disabled={true}
                className="w-full bg-slate-200 text-slate-500 py-4 px-6 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Pagar com Cartão (Em breve)
              </button>
            </div>

            {/* Termos */}
            <p className="text-xs text-slate-500 text-center mt-6">
              Ao continuar, você concorda com nossos{' '}
              <a href="/termos" className="text-blue-600 hover:underline">Termos de Serviço</a>{' '}
              e{' '}
              <a href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
