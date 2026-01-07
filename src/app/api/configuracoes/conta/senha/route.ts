import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server'

// PUT - Alterar senha do usuario
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { senhaAtual, novaSenha } = body

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { message: 'Senha atual e nova senha sao obrigatorias' },
        { status: 400 }
      )
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { message: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar senha atual fazendo login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: senhaAtual,
    })

    if (signInError) {
      return NextResponse.json(
        { message: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: novaSenha,
    })

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      return NextResponse.json(
        { message: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}
