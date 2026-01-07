export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Notificacao, NotificacoesResponse, TipoNotificacao } from '@/types/notificacoes'

// Dados mock para quando não existir model Notificacao no Prisma
const notificacoesMock: Notificacao[] = [
  {
    id: '1',
    tipo: 'tarefa',
    titulo: 'Nova tarefa atribuída',
    mensagem: 'Você foi atribuído à tarefa "Revisar relatório financeiro"',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
    link: '/tarefas'
  },
  {
    id: '2',
    tipo: 'financeiro',
    titulo: 'Pagamento vencendo',
    mensagem: 'A conta "Fornecedor ABC" vence em 3 dias',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
    link: '/financeiro/contas-pagar'
  },
  {
    id: '3',
    tipo: 'okr',
    titulo: 'Meta atingida!',
    mensagem: 'O Key Result "Aumentar vendas em 20%" foi concluído',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 horas atrás
    link: '/okr'
  },
  {
    id: '4',
    tipo: 'consultoria',
    titulo: 'Projeto atualizado',
    mensagem: 'O projeto "Implementação ERP" teve uma nova etapa concluída',
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    link: '/consultoria'
  },
  {
    id: '5',
    tipo: 'sistema',
    titulo: 'Backup realizado',
    mensagem: 'O backup automático do sistema foi concluído com sucesso',
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
  },
  {
    id: '6',
    tipo: 'alerta',
    titulo: 'Atenção: Limite de armazenamento',
    mensagem: 'Você está utilizando 85% do espaço de armazenamento',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
    link: '/configuracoes'
  }
]

// Armazenamento em memória para simular persistência durante a sessão do servidor
let notificacoesStorage: Map<string, Notificacao[]> = new Map()

function getNotificacoesUsuario(userId: string): Notificacao[] {
  if (!notificacoesStorage.has(userId)) {
    // Clonar mock para cada usuário
    notificacoesStorage.set(userId, JSON.parse(JSON.stringify(notificacoesMock)))
  }
  return notificacoesStorage.get(userId) || []
}

function setNotificacoesUsuario(userId: string, notificacoes: Notificacao[]): void {
  notificacoesStorage.set(userId, notificacoes)
}

// GET: Listar notificações do usuário
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Por enquanto, usar dados mock (quando model Notificacao existir, usar Prisma)
    const notificacoes = getNotificacoesUsuario(userId)

    // Ordenar por data (mais recentes primeiro)
    notificacoes.sort((a, b) =>
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    )

    const naoLidas = notificacoes.filter(n => !n.lida).length

    const response: NotificacoesResponse = {
      notificacoes,
      total: notificacoes.length,
      naoLidas
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    )
  }
}

// PUT: Marcar todas como lidas
export async function PUT(_request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Marcar todas como lidas
    const notificacoes = getNotificacoesUsuario(userId)
    const notificacoesAtualizadas = notificacoes.map(n => ({ ...n, lida: true }))
    setNotificacoesUsuario(userId, notificacoesAtualizadas)

    return NextResponse.json({
      message: 'Todas as notificações foram marcadas como lidas',
      atualizadas: notificacoes.filter(n => !n.lida).length
    })
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro ao marcar notificações como lidas' },
      { status: 500 }
    )
  }
}

// POST: Criar nova notificação (para uso interno/sistema)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tipo, titulo, mensagem, link, userId: targetUserId } = body

    if (!tipo || !titulo || !mensagem) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: tipo, titulo, mensagem' },
        { status: 400 }
      )
    }

    // Validar tipo
    const tiposValidos: TipoNotificacao[] = [
      'info', 'sucesso', 'alerta', 'erro', 'tarefa',
      'financeiro', 'consultoria', 'okr', 'sistema'
    ]

    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }

    const userId = targetUserId || session.user.id

    const novaNotificacao: Notificacao = {
      id: crypto.randomUUID(),
      tipo,
      titulo,
      mensagem,
      lida: false,
      criadoEm: new Date().toISOString(),
      link,
      userId
    }

    const notificacoes = getNotificacoesUsuario(userId)
    notificacoes.unshift(novaNotificacao)
    setNotificacoesUsuario(userId, notificacoes)

    return NextResponse.json(novaNotificacao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    )
  }
}
