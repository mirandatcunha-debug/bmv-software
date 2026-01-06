import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Obter configuracoes de aparencia do usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Buscar ou criar configuracoes de aparencia
    let config = await prisma.appearanceSettings.findUnique({
      where: { userId: user.id },
    })

    if (!config) {
      // Criar configuracoes padrao
      config = await prisma.appearanceSettings.create({
        data: {
          userId: user.id,
          tema: 'system',
          corPrimaria: '#1a365d',
          densidade: 'normal',
        },
      })
    }

    return NextResponse.json({
      tema: config.tema,
      corPrimaria: config.corPrimaria,
      densidade: config.densidade,
    })
  } catch (error) {
    console.error('Erro ao buscar configuracoes de aparencia:', error)
    // Retornar valores padrao em caso de erro
    return NextResponse.json({
      tema: 'system',
      corPrimaria: '#1a365d',
      densidade: 'normal',
    })
  }
}

// PUT - Atualizar configuracoes de aparencia
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { tema, corPrimaria, densidade } = body

    // Validar tema
    const temasValidos = ['light', 'dark', 'system']
    if (tema && !temasValidos.includes(tema)) {
      return NextResponse.json(
        { message: 'Tema invalido' },
        { status: 400 }
      )
    }

    // Validar densidade
    const densidadesValidas = ['compact', 'normal', 'comfortable']
    if (densidade && !densidadesValidas.includes(densidade)) {
      return NextResponse.json(
        { message: 'Densidade invalida' },
        { status: 400 }
      )
    }

    // Upsert configuracoes
    const config = await prisma.appearanceSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tema: tema ?? 'system',
        corPrimaria: corPrimaria ?? '#1a365d',
        densidade: densidade ?? 'normal',
      },
      update: {
        tema,
        corPrimaria,
        densidade,
      },
    })

    return NextResponse.json({
      tema: config.tema,
      corPrimaria: config.corPrimaria,
      densidade: config.densidade,
    })
  } catch (error) {
    console.error('Erro ao atualizar configuracoes de aparencia:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configuracoes' },
      { status: 500 }
    )
  }
}
