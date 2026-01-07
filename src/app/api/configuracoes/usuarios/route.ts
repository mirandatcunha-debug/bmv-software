import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// GET - Listar usuarios da empresa
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
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

    // Verificar permissao
    if (!['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(user.perfil)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const usuarios = await prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        // Nao mostrar usuarios ADMIN_BMV e CONSULTOR_BMV para gestores
        ...(user.perfil === 'GESTOR' && {
          perfil: {
            notIn: ['ADMIN_BMV', 'CONSULTOR_BMV'],
          },
        }),
      },
      orderBy: { nome: 'asc' },
    })

    const usuariosFormatados = usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      ativo: u.ativo,
      primeiroAcesso: u.primeiroAcesso,
      ultimoAcesso: u.ultimoAcesso,
      criadoEm: u.criadoEm,
    }))

    return NextResponse.json(usuariosFormatados)
  } catch (error) {
    console.error('Erro ao listar usuarios:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuarios' },
      { status: 500 }
    )
  }
}
