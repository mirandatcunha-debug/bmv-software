import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// GET - Obter dados da conta do usuário
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      avatarUrl: user.avatarUrl,
      perfil: user.perfil,
      primeiroAcesso: user.primeiroAcesso,
      ultimoAcesso: user.ultimoAcesso,
    })
  } catch (error) {
    console.error('Erro ao buscar dados da conta:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da conta' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar dados da conta
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { nome } = body

    const updateData: { nome?: string } = {}
    if (nome !== undefined) updateData.nome = nome

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({
      id: updatedUser.id,
      nome: updatedUser.nome,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      perfil: updatedUser.perfil,
    })
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar conta' },
      { status: 500 }
    )
  }
}
