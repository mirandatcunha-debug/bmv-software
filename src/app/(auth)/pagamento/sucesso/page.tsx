'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Sparkles, ArrowRight, PartyPopper, Rocket, Users, Building2, BarChart3 } from 'lucide-react'
import { PRECOS_PLANOS, PlanoType } from '@/lib/pagamento'
import { PLAN_LIMITS } from '@/lib/plan-limits'

// Componente de Confetti simples com CSS
function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([])

  useEffect(() => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444']
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setPieces(newPieces)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 4s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}

function SucessoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(true)

  const planoParam = searchParams.get('plano')?.toUpperCase() as PlanoType | undefined
  const periodo = searchParams.get('periodo') || 'mensal'

  const plano = planoParam && PRECOS_PLANOS[planoParam] ? PRECOS_PLANOS[planoParam] : null
  const limites = planoParam && PLAN_LIMITS[planoParam] ? PLAN_LIMITS[planoParam] : null

  useEffect(() => {
    // Esconder confetti após 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const recursos = [
    {
      icon: Users,
      titulo: 'Usuários',
      valor: limites?.usuarios === -1 ? 'Ilimitados' : `${limites?.usuarios || 0}`,
      cor: 'text-blue-600 bg-blue-100',
    },
    {
      icon: Building2,
      titulo: 'Contas Bancárias',
      valor: limites?.contasBancarias === -1 ? 'Ilimitadas' : `${limites?.contasBancarias || 0}`,
      cor: 'text-purple-600 bg-purple-100',
    },
    {
      icon: BarChart3,
      titulo: 'Projetos',
      valor: limites?.projetos === -1 ? 'Ilimitados' : `${limites?.projetos || 0}`,
      cor: 'text-green-600 bg-green-100',
    },
    {
      icon: Sparkles,
      titulo: 'Análises IA/mês',
      valor: limites?.analisesIA === -1 ? 'Ilimitadas' : `${limites?.analisesIA || 0}`,
      cor: 'text-amber-600 bg-amber-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      {showConfetti && <Confetti />}

      <div className="max-w-2xl w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-12 text-center relative overflow-hidden">
            {/* Decorações */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-20 translate-y-20" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Pagamento Confirmado!
              </h1>
              <p className="text-blue-100 text-lg">
                Bem-vindo ao {plano?.nome || 'seu novo plano'}
              </p>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-8 py-10">
            {/* Mensagem de Boas-vindas */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <PartyPopper className="h-4 w-4" />
                Assinatura ativa
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Parabéns! Sua empresa está pronta para decolar
              </h2>
              <p className="text-slate-600">
                Seu plano foi ativado com sucesso. Agora você tem acesso a todos os recursos
                {periodo === 'anual' ? ' por um ano inteiro!' : '.'}
              </p>
            </div>

            {/* Recursos Adquiridos */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                O que você adquiriu:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {recursos.map((recurso) => (
                  <div
                    key={recurso.titulo}
                    className="bg-white rounded-xl p-4 border border-slate-200"
                  >
                    <div className={`w-10 h-10 rounded-lg ${recurso.cor} flex items-center justify-center mb-3`}>
                      <recurso.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-500">{recurso.titulo}</p>
                    <p className="text-xl font-bold text-slate-900">{recurso.valor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Passos */}
            <div className="border border-slate-200 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">Próximos passos:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-900">Convide sua equipe</span> - Adicione
                    colaboradores nas configurações da empresa.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-900">Configure suas contas</span> - Cadastre
                    suas contas bancárias para controle financeiro.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-900">Explore a IA</span> - Use as análises
                    inteligentes para insights sobre seus dados.
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              Acessar Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Email de Confirmação */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Um email de confirmação foi enviado para você com os detalhes da sua assinatura.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600">
            Precisa de ajuda?{' '}
            <a href="/suporte" className="text-blue-600 hover:underline">
              Fale com nosso suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PagamentoSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Carregando...</div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  )
}
