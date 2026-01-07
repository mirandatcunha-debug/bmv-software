import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Configurações de buckets
const BUCKET_CONFIG: Record<string, { maxSize: number; allowedTypes: string[] }> = {
  logos: {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
  },
  avatars: {
    maxSize: 1 * 1024 * 1024,
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
  anexos: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null
    const path = formData.get('path') as string | null

    // Validações básicas
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!bucket || !BUCKET_CONFIG[bucket]) {
      return NextResponse.json(
        { error: 'Bucket inválido. Use: logos, avatars ou anexos' },
        { status: 400 }
      )
    }

    if (!path) {
      return NextResponse.json({ error: 'Caminho do arquivo não informado' }, { status: 400 })
    }

    const config = BUCKET_CONFIG[bucket]

    // Validar tamanho
    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Tamanho máximo: ${config.maxSize / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!config.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = await createSupabaseServerClient()

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Fazer upload
    const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      console.error('Erro no upload:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
