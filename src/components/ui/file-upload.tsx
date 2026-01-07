'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Upload, X, FileIcon, ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Progress } from './progress'

export interface FileUploadProps {
  bucket: 'logos' | 'avatars' | 'anexos'
  path?: string
  accept?: string
  maxSize?: number
  onUploadComplete?: (url: string, path: string) => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
  preview?: boolean
  value?: string
}

const DEFAULT_ACCEPT: Record<string, string> = {
  logos: 'image/png,image/jpeg,image/svg+xml,image/webp',
  avatars: 'image/png,image/jpeg,image/webp',
  anexos:
    'image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx',
}

const DEFAULT_MAX_SIZE: Record<string, number> = {
  logos: 2 * 1024 * 1024,
  avatars: 1 * 1024 * 1024,
  anexos: 10 * 1024 * 1024,
}

export function FileUpload({
  bucket,
  path,
  accept,
  maxSize,
  onUploadComplete,
  onError,
  className,
  disabled = false,
  preview = true,
  value,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const acceptTypes = accept || DEFAULT_ACCEPT[bucket]
  const maxFileSize = maxSize || DEFAULT_MAX_SIZE[bucket]

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `Arquivo muito grande. Tamanho máximo: ${maxFileSize / 1024 / 1024}MB`
      }

      const allowedTypes = acceptTypes.split(',').map((t) => t.trim())
      const isValidType = allowedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type)
        }
        return file.type === type || file.type.startsWith(type.replace('*', ''))
      })

      if (!isValidType) {
        return 'Tipo de arquivo não permitido'
      }

      return null
    },
    [acceptTypes, maxFileSize]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        onError?.(validationError)
        return
      }

      setIsUploading(true)
      setProgress(0)
      setFileName(file.name)

      // Simular progresso inicial
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', bucket)

        // Gerar path único se não fornecido
        const uploadPath =
          path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        formData.append('path', uploadPath)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao fazer upload')
        }

        const data = await response.json()
        setProgress(100)

        // Mostrar preview para imagens
        if (file.type.startsWith('image/') && preview) {
          setPreviewUrl(data.url)
        }

        onUploadComplete?.(data.url, data.path)
      } catch (error) {
        clearInterval(progressInterval)
        setProgress(0)
        onError?.(error instanceof Error ? error.message : 'Erro ao fazer upload')
      } finally {
        setIsUploading(false)
      }
    },
    [bucket, path, validateFile, onUploadComplete, onError, preview]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || isUploading) return

      const file = e.dataTransfer.files[0]
      if (file) {
        uploadFile(file)
      }
    },
    [disabled, isUploading, uploadFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
      // Reset input para permitir selecionar o mesmo arquivo
      e.target.value = ''
    },
    [uploadFile]
  )

  const handleRemove = useCallback(() => {
    setPreviewUrl(null)
    setFileName(null)
    setProgress(0)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading])

  const isImage = previewUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
                  previewUrl?.includes('image')

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {previewUrl && preview ? (
        <div className="relative rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            {isImage ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-background">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-background">
                <FileIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium truncate">
                {fileName || 'Arquivo enviado'}
              </p>
              <p className="text-xs text-muted-foreground">Upload concluído</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-50',
            isUploading && 'pointer-events-none'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 p-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2" />
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Enviando... {progress}%
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              {bucket === 'anexos' ? (
                <FileIcon className="h-10 w-10 text-muted-foreground" />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Arraste um arquivo ou clique para selecionar
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tamanho máximo: {maxFileSize / 1024 / 1024}MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
