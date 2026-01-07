export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Configurações de aparência são armazenadas no localStorage do cliente
// Esta API apenas valida a autenticação e retorna valores padrão

// GET - Obter configurações de aparência padrão
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Retornar configurações padrão - o cliente gerencia via localStorage
    return NextResponse.json({
      tema: 'system',
      corPrimaria: '#1a365d',
      densidade: 'normal',
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de aparência:', error)
    return NextResponse.json({
      tema: 'system',
      corPrimaria: '#1a365d',
      densidade: 'normal',
    })
  }
}

// PUT - Validar configurações de aparência
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tema, corPrimaria, densidade } = body

    // Validar tema
    const temasValidos = ['light', 'dark', 'system']
    if (tema && !temasValidos.includes(tema)) {
      return NextResponse.json(
        { message: 'Tema inválido' },
        { status: 400 }
      )
    }

    // Validar densidade
    const densidadesValidas = ['compact', 'normal', 'comfortable']
    if (densidade && !densidadesValidas.includes(densidade)) {
      return NextResponse.json(
        { message: 'Densidade inválida' },
        { status: 400 }
      )
    }

    // Retornar as configurações validadas - armazenamento é feito no cliente
    return NextResponse.json({
      tema: tema ?? 'system',
      corPrimaria: corPrimaria ?? '#1a365d',
      densidade: densidade ?? 'normal',
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações de aparência:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
