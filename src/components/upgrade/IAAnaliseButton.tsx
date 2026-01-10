'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Brain, Loader2, Sparkles, Lock } from 'lucide-react'
import Link from 'next/link'

interface IAAnaliseButtonProps {
  onClick?: () => void
  disabled?: boolean
  bloqueado?: boolean
  className?: string
}

export function IAAnaliseButton({
  onClick,
  disabled = false,
  bloqueado = false,
  className,
}: IAAnaliseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (bloqueado || disabled || isLoading) return

    setIsLoading(true)
    try {
      await onClick?.()
    } finally {
      // Simula processamento da IA
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }
  }

  if (bloqueado) {
    return (
      <Button
        asChild
        variant="outline"
        className={cn(
          'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
          'hover:from-purple-100 hover:to-indigo-100',
          className
        )}
      >
        <Link href="/planos">
          <Lock className="mr-2 h-4 w-4 text-purple-500" />
          <span className="text-purple-700">Desbloquear IA</span>
          <Sparkles className="ml-2 h-4 w-4 text-purple-500" />
        </Link>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'bg-gradient-to-r from-blue-600 to-indigo-600',
        'hover:from-blue-700 hover:to-indigo-700',
        'text-white shadow-md hover:shadow-lg transition-all',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analisando...
        </>
      ) : (
        <>
          <Brain className="mr-2 h-4 w-4" />
          Gerar Nova Análise
          <Sparkles className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}
