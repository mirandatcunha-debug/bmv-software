'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileSpreadsheet } from 'lucide-react'

interface BotaoExportarExcelProps {
  tipo?: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'TODOS'
  contaId?: string
  dataInicio?: string
  dataFim?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  label?: string
  showIcon?: boolean
}

export function BotaoExportarExcel({
  tipo,
  contaId,
  dataInicio,
  dataFim,
  variant = 'outline',
  size = 'default',
  className,
  label = 'Exportar Excel',
  showIcon = true,
}: BotaoExportarExcelProps) {
  const [loading, setLoading] = useState(false)

  async function handleExportar() {
    try {
      setLoading(true)

      // Construir URL com parâmetros
      const params = new URLSearchParams()
      if (tipo && tipo !== 'TODOS') params.append('tipo', tipo)
      if (contaId && contaId !== 'TODOS') params.append('contaId', contaId)
      if (dataInicio) params.append('dataInicio', dataInicio)
      if (dataFim) params.append('dataFim', dataFim)

      const queryString = params.toString()
      const url = `/api/exportar/financeiro/excel${queryString ? `?${queryString}` : ''}`

      // Fazer requisição
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao exportar')
      }

      // Obter nome do arquivo do header ou usar padrão
      const contentDisposition = response.headers.get('Content-Disposition')
      let nomeArquivo = 'movimentacoes.xlsx'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) {
          nomeArquivo = match[1]
        }
      }

      // Converter para blob e fazer download
      const blob = await response.blob()
      const urlBlob = window.URL.createObjectURL(blob)

      // Criar link e clicar para download
      const link = document.createElement('a')
      link.href = urlBlob
      link.download = nomeArquivo
      document.body.appendChild(link)
      link.click()

      // Limpar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlBlob)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      alert('Erro ao exportar Excel. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExportar}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          {showIcon && (
            size === 'icon' ? (
              <FileSpreadsheet className="h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )
          )}
          {size !== 'icon' && label}
        </>
      )}
    </Button>
  )
}
