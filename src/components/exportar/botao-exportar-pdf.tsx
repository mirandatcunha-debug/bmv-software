'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { TipoTransacao } from '@/types/financeiro'

interface BotaoExportarPDFProps {
  dataInicio?: string
  dataFim?: string
  tipo?: TipoTransacao | 'TODOS'
  contaId?: string
  className?: string
}

export function BotaoExportarPDF({
  dataInicio,
  dataFim,
  tipo,
  contaId,
  className,
}: BotaoExportarPDFProps) {
  const [loading, setLoading] = useState(false)

  const handleExportar = async () => {
    try {
      setLoading(true)

      // Construir URL com parâmetros
      const params = new URLSearchParams()
      if (dataInicio) params.append('dataInicio', dataInicio)
      if (dataFim) params.append('dataFim', dataFim)
      if (tipo && tipo !== 'TODOS') params.append('tipo', tipo)
      if (contaId && contaId !== 'TODOS') params.append('contaId', contaId)

      const url = `/api/exportar/financeiro/pdf?${params.toString()}`

      // Fazer requisição para API
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar PDF')
      }

      // Obter o blob do PDF
      const blob = await response.blob()

      // Criar URL temporária para download
      const downloadUrl = window.URL.createObjectURL(blob)

      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'relatorio-financeiro.pdf'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Criar elemento de link temporário para download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Limpar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      alert(error instanceof Error ? error.message : 'Erro ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExportar}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  )
}
