import { createSupabaseBrowserClient } from './supabase'

// Tipos de bucket disponíveis
export type StorageBucket = 'logos' | 'avatars' | 'anexos'

// Configurações de cada bucket
const BUCKET_CONFIG: Record<StorageBucket, { maxSize: number; allowedTypes: string[] }> = {
  logos: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
  },
  avatars: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
  anexos: {
    maxSize: 10 * 1024 * 1024, // 10MB
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

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<UploadResult> {
  try {
    const config = BUCKET_CONFIG[bucket]

    // Validar tamanho
    if (file.size > config.maxSize) {
      return {
        success: false,
        error: `Arquivo muito grande. Tamanho máximo: ${config.maxSize / 1024 / 1024}MB`,
      }
    }

    // Validar tipo
    if (!config.allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes.join(', ')}`,
      }
    }

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    const url = getPublicUrl(bucket, data.path)

    return {
      success: true,
      url,
      path: data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload',
    }
  }
}

/**
 * Exclui um arquivo do Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('Erro ao excluir arquivo:', error.message)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error)
    return false
  }
}

/**
 * Retorna a URL pública de um arquivo
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

/**
 * Gera um nome de arquivo único baseado em timestamp
 */
export function generateFilePath(prefix: string, filename: string): string {
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9-_]/g, '')
  return `${sanitizedPrefix}/${timestamp}.${ext}`
}

/**
 * Valida se um arquivo é válido para upload em um bucket específico
 */
export function validateFile(
  bucket: StorageBucket,
  file: File
): { valid: boolean; error?: string } {
  const config = BUCKET_CONFIG[bucket]

  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${config.maxSize / 1024 / 1024}MB`,
    }
  }

  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Retorna as configurações de um bucket
 */
export function getBucketConfig(bucket: StorageBucket) {
  return BUCKET_CONFIG[bucket]
}
