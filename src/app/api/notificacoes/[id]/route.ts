export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Notificacao } from '@/types/notificacoes'

// Armazenamento em memória compartilhado (mesmo do route.ts pai)
// Em produção, isso seria substituído por queries no banco de dados
let notificacoesStorage: Map<string, Notificacao[]> = new Map()

// Dados mock iniciais
const notificacoesMock: Notificacao[] = [
  {
    id: '1',
    tipo: 'tarefa',
    titulo: 'Nova tarefa atribuída',
    mensagem: 'Você foi atribuído à tarefa "Revisar relatório financeiro"',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/tarefas'
  },
  {
    id: '2',
    tipo: 'financeiro',
    titulo: 'Pagamento vencendo',
    mensagem: 'A conta "Fornecedor ABC" vence em 3 dias',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/financeiro/contas-pagar'
  },
  {
    id: '3',
    tipo: 'okr',
    titulo: 'Meta atingida!',
    mensagem: 'O Key Result "Aumentar vendas em 20%" foi concluído',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: '/okr'
  },
  {
    id: '4',
    tipo: 'consultoria',
    titulo: 'Projeto atualizado',
    mensagem: 'O projeto "Implementação ERP" teve uma nova etapa concluída',
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/consultoria'
  },
  {
    id: '5',
    tipo: 'sistema',
    titulo: 'Backup realizado',
    mensagem: 'O backup automático do sistema foi concluído com sucesso',
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '6',
    tipo: 'alerta',
    titulo: 'Atenção: Limite de armazenamento',
    mensagem: 'Você está utilizando 85% do espaço de armazenamento',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    link: '/configuracoes'
  }
]

function getNotificacoesUsuario(userId: string): Notificacao[] {
  if (!notificacoesStorage.has(userId)) {
    notificacoesStorage.set(userId, JSON.parse(JSON.stringify(notificacoesMock)))
  }
  return notificacoesStorage.get(userId) || []
}

function setNotificacoesUsuario(userId: string, notificacoes: Notificacao[]): void {
  notificacoesStorage.set(userId, notificacoes)
}

// PUT: Marcar notificação específica como lida
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const id = params.id
    const userId = session.user.id

    const notificacoes = getNotificacoesUsuario(userId)
    const index = notificacoes.findIndex(n => n.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar notificação
    const body = await request.json().catch(() => ({}))
    const lida = body.lida !== undefined ? body.lida : true

    notificacoes[index] = {
      ...notificacoes[index],
      lida
    }

    setNotificacoesUsuario(userId, notificacoes)

    return NextResponse.json({
      message: 'Notificação atualizada com sucesso',
      notificacao: notificacoes[index]
    })
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar notificação' },
      { status: 500 }
    )
  }
}

// DELETE: Excluir notificação
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const id = params.id
    const userId = session.user.id

    const notificacoes = getNotificacoesUsuario(userId)
    const index = notificacoes.findIndex(n => n.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    // Remover notificação
    const notificacaoRemovida = notificacoes.splice(index, 1)[0]
    setNotificacoesUsuario(userId, notificacoes)

    return NextResponse.json({
      message: 'Notificação excluída com sucesso',
      notificacao: notificacaoRemovida
    })
  } catch (error) {
    console.error('Erro ao excluir notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir notificação' },
      { status: 500 }
    )
  }
}

// GET: Buscar notificação específica
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const id = params.id
    const userId = session.user.id

    const notificacoes = getNotificacoesUsuario(userId)
    const notificacao = notificacoes.find(n => n.id === id)

    if (!notificacao) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(notificacao)
  } catch (error) {
    console.error('Erro ao buscar notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notificação' },
      { status: 500 }
    )
  }
}
