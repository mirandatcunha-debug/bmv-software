export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const VALID_BUCKETS = ['logos', 'avatars', 'anexos']

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path

    if (!path || path.length < 2) {
      return NextResponse.json(
        { error: 'Caminho inválido. Use: /api/upload/{bucket}/{path}' },
        { status: 400 }
      )
    }

    const [bucket, ...filePath] = path
    const fullPath = filePath.join('/')

    // Validar bucket
    if (!VALID_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { error: 'Bucket inválido. Use: logos, avatars ou anexos' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = await createSupabaseServerClient()

    // Excluir arquivo
    const { error } = await supabase.storage.from(bucket).remove([fullPath])

    if (error) {
      console.error('Erro ao excluir arquivo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
