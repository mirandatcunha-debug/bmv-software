'use client'

import {
  Mail,
  Phone,
  Clock,
  PlayCircle,
  FileText,
  BookOpen,
  MessageCircle,
  Wallet,
  Target,
  Users,
  Settings,
  HelpCircle,
  RotateCcw,
  LayoutDashboard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useResetModuloOnboarding } from '@/hooks/useOnboarding'
import { onboardingModulos } from '@/lib/onboarding-steps'
import { useRouter } from 'next/navigation'

// FAQ organizado por módulos
const faqItems = [
  {
    categoria: 'Financeiro',
    icon: Wallet,
    moduloId: 'financeiro',
    perguntas: [
      {
        pergunta: 'Como cadastrar uma conta bancária?',
        resposta: 'Para cadastrar uma conta bancária, acesse o menu Financeiro > Contas Bancárias e clique em "Nova Conta". Preencha os dados como nome do banco, agência, número da conta e saldo inicial. Após salvar, a conta estará disponível para receber lançamentos.'
      },
      {
        pergunta: 'Como lançar uma despesa parcelada?',
        resposta: 'Ao criar uma nova conta a pagar, marque a opção "Parcelado" e informe o número de parcelas. O sistema irá gerar automaticamente os lançamentos com as datas de vencimento consecutivas. Você pode editar individualmente cada parcela se necessário.'
      },
      {
        pergunta: 'Como fazer uma transferência entre contas?',
        resposta: 'Acesse Financeiro > Transferências e clique em "Nova Transferência". Selecione a conta de origem, a conta de destino e o valor. A transferência será registrada automaticamente como saída na conta origem e entrada na conta destino.'
      }
    ]
  },
  {
    categoria: 'Processos e OKRs',
    icon: Target,
    moduloId: 'processos',
    perguntas: [
      {
        pergunta: 'Como criar um objetivo OKR?',
        resposta: 'Acesse o módulo Processos e clique em "Novo Objetivo". Defina um título claro e mensurável para o objetivo. Em seguida, adicione os Key Results (resultados-chave) que indicarão o progresso. Cada Key Result deve ter uma meta numérica e um prazo.'
      },
      {
        pergunta: 'Como atribuir tarefas a colaboradores?',
        resposta: 'Dentro de um objetivo ou projeto, clique em "Nova Tarefa". Preencha a descrição da tarefa, selecione o colaborador responsável no campo "Atribuir a", defina a data de vencimento e a prioridade. O colaborador receberá uma notificação sobre a nova tarefa.'
      },
      {
        pergunta: 'Como acompanhar o progresso dos OKRs?',
        resposta: 'No módulo Processos, você pode visualizar o progresso geral de cada objetivo através da barra de progresso. Clique no objetivo para ver detalhes dos Key Results e suas respectivas métricas. O dashboard também exibe um resumo dos OKRs ativos.'
      }
    ]
  },
  {
    categoria: 'Cadastros',
    icon: Users,
    moduloId: null,
    perguntas: [
      {
        pergunta: 'Como adicionar colaboradores?',
        resposta: 'Acesse Cadastros > Colaboradores e clique em "Novo Colaborador". Preencha os dados pessoais, e-mail e defina o perfil de acesso. O colaborador receberá um e-mail com instruções para criar sua senha e acessar o sistema.'
      },
      {
        pergunta: 'Como cadastrar clientes e fornecedores?',
        resposta: 'Acesse Cadastros e selecione Clientes ou Fornecedores. Clique em "Novo" e preencha os dados cadastrais como razão social, CNPJ/CPF, endereço e contatos. Esses cadastros ficarão disponíveis para uso nos lançamentos financeiros.'
      }
    ]
  },
  {
    categoria: 'Configurações Gerais',
    icon: Settings,
    moduloId: null,
    perguntas: [
      {
        pergunta: 'Como alterar minha senha?',
        resposta: 'Clique no seu nome no canto superior direito e selecione "Minha Conta". Na seção de segurança, clique em "Alterar Senha". Digite sua senha atual, a nova senha e confirme. A nova senha deve ter no mínimo 8 caracteres.'
      },
      {
        pergunta: 'Como personalizar as categorias financeiras?',
        resposta: 'Acesse Configurações > Categorias. Você pode criar novas categorias de receita e despesa, editar as existentes ou desativá-las. As categorias ajudam a organizar seus lançamentos e gerar relatórios mais precisos.'
      },
      {
        pergunta: 'Como exportar relatórios?',
        resposta: 'Em qualquer tela de relatório ou listagem, procure pelo botão "Exportar" no canto superior direito. Você pode exportar os dados em formato Excel (XLSX) ou PDF. Os filtros aplicados serão considerados na exportação.'
      }
    ]
  }
]

// Tutoriais em vídeo (placeholder)
const tutoriais = [
  { titulo: 'Primeiros Passos', descricao: 'Conheça o sistema' },
  { titulo: 'Gestão Financeira', descricao: 'Controle suas finanças' },
  { titulo: 'Criando OKRs', descricao: 'Defina objetivos' },
  { titulo: 'Relatórios', descricao: 'Extraia insights' },
]

// Módulos com tour disponível
const modulosComTour = [
  {
    id: 'dashboard',
    nome: 'Dashboard',
    icon: LayoutDashboard,
    rota: '/',
    descricao: 'Tour pelos indicadores e gráficos principais'
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    icon: Wallet,
    rota: '/financeiro',
    descricao: 'Tour pelas contas, lançamentos e relatórios'
  },
  {
    id: 'processos',
    nome: 'Processos',
    icon: Target,
    rota: '/processos',
    descricao: 'Tour pelos objetivos, tarefas e equipe'
  }
]

export default function AjudaPage() {
  const { resetarModulo } = useResetModuloOnboarding()
  const router = useRouter()

  const handleReiniciarTour = (moduloId: string, rota: string) => {
    resetarModulo(moduloId)
    router.push(rota + '?tour=1')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#1E3A5F]/10">
          <HelpCircle className="h-8 w-8 text-[#1E3A5F]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Ajuda</h1>
          <p className="text-gray-500">Encontre respostas e suporte para utilizar o sistema</p>
        </div>
      </div>

      {/* Tour Guiado */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tour Guiado</h2>
        <p className="text-sm text-gray-500 mb-4">
          Reinicie o tour guiado de cada módulo para rever as funcionalidades do sistema.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {modulosComTour.map((modulo) => (
            <Card key={modulo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#1E3A5F]/10">
                    <modulo.icon className="h-5 w-5 text-[#1E3A5F]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{modulo.nome}</h3>
                    <p className="text-sm text-gray-500 mt-1">{modulo.descricao}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => handleReiniciarTour(modulo.id, modulo.rota)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reiniciar Tour
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Canais de Suporte */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Canais de Suporte</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">E-mail</h3>
                  <a
                    href="mailto:suporte@bmv.com.br"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    suporte@bmv.com.br
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Resposta em até 24h úteis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">WhatsApp</h3>
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline text-sm"
                  >
                    (11) 99999-9999
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Atendimento rápido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Horário de Atendimento</h3>
                  <p className="text-sm text-gray-600">Segunda a Sexta</p>
                  <p className="text-sm font-medium text-gray-900">08:00 às 18:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Perguntas Frequentes */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {faqItems.map((categoria) => (
            <Card key={categoria.categoria}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <categoria.icon className="h-5 w-5 text-[#1E3A5F]" />
                    {categoria.categoria}
                  </CardTitle>
                  {categoria.moduloId && onboardingModulos[categoria.moduloId] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 text-gray-500 hover:text-[#1E3A5F]"
                      onClick={() => {
                        const rota = categoria.moduloId === 'financeiro' ? '/financeiro' : '/processos'
                        handleReiniciarTour(categoria.moduloId!, rota)
                      }}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Tour
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion>
                  {categoria.perguntas.map((item, index) => (
                    <AccordionItem key={index} title={item.pergunta}>
                      {item.resposta}
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tutoriais em Vídeo */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tutoriais em Vídeo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tutoriais.map((tutorial, index) => (
            <Card key={index} className="overflow-hidden group cursor-not-allowed">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Thumbnail placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <PlayCircle className="h-12 w-12 text-gray-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>
                {/* Badge "Em breve" */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700">
                    Em breve
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900">{tutorial.titulo}</h3>
                <p className="text-sm text-gray-500">{tutorial.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Documentação */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentação</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-[#1E3A5F] transition-colors">
                    Guia de Início Rápido
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Aprenda os conceitos básicos e comece a usar o sistema em poucos minutos.
                  </p>
                  <div className="mt-3 inline-flex items-center text-sm text-purple-600 font-medium">
                    Acessar guia
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group opacity-60">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gray-100">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">Manual Completo</h3>
                    <span className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600">
                      Em breve
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Documentação detalhada de todos os recursos e funcionalidades do sistema.
                  </p>
                  <div className="mt-3 inline-flex items-center text-sm text-gray-400 font-medium">
                    Disponível em breve
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rodapé informativo */}
      <div className="text-center py-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Não encontrou o que procurava? Entre em contato conosco pelos canais acima.
        </p>
      </div>
    </div>
  )
}
