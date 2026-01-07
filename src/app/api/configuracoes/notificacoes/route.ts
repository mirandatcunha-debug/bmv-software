import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Configurações de notificação são armazenadas no localStorage do cliente
// Esta API apenas valida a autenticação e retorna valores padrão

// GET - Obter configurações de notificação padrão
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Retornar configurações padrão - o cliente gerencia via localStorage
    return NextResponse.json({
      emailTarefaAtribuida: true,
      emailPrazoProximo: true,
      emailResumoSemanal: false,
      notificacaoSistema: true,
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de notificação:', error)
    return NextResponse.json({
      emailTarefaAtribuida: true,
      emailPrazoProximo: true,
      emailResumoSemanal: false,
      notificacaoSistema: true,
    })
  }
}

// PUT - Validar configurações de notificação
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailTarefaAtribuida,
      emailPrazoProximo,
      emailResumoSemanal,
      notificacaoSistema,
    } = body

    // Retornar as configurações validadas - armazenamento é feito no cliente
    return NextResponse.json({
      emailTarefaAtribuida: emailTarefaAtribuida ?? true,
      emailPrazoProximo: emailPrazoProximo ?? true,
      emailResumoSemanal: emailResumoSemanal ?? false,
      notificacaoSistema: notificacaoSistema ?? true,
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações de notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
