export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()
    const buffer = await file.arrayBuffer()

    let colunas: string[] = []
    let linhas: Record<string, string>[] = []
    let totalLinhas = 0

    if (fileName.endsWith('.csv')) {
      // Processar CSV
      const text = new TextDecoder('utf-8').decode(buffer)
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length === 0) {
        return NextResponse.json(
          { message: 'Arquivo vazio' },
          { status: 400 }
        )
      }

      // Detectar separador (vírgula ou ponto e vírgula)
      const firstLine = lines[0]
      const separator = firstLine.includes(';') ? ';' : ','

      // Parse das colunas (primeira linha)
      colunas = firstLine.split(separator).map(col =>
        col.trim().replace(/^["']|["']$/g, '')
      )

      totalLinhas = lines.length - 1

      // Parse das linhas (primeiras 10 para preview)
      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const values = lines[i].split(separator).map(val =>
          val.trim().replace(/^["']|["']$/g, '')
        )

        const row: Record<string, string> = {}
        colunas.forEach((col, idx) => {
          row[col] = values[idx] || ''
        })
        linhas.push(row)
      }

    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Processar Excel com ExcelJS
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(Buffer.from(buffer) as unknown as ExcelJS.Buffer)

      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        return NextResponse.json(
          { message: 'Planilha vazia' },
          { status: 400 }
        )
      }

      // Obter colunas da primeira linha
      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell, colNumber) => {
        const value = cell.value?.toString() || `Coluna ${colNumber}`
        colunas.push(value.trim())
      })

      if (colunas.length === 0) {
        return NextResponse.json(
          { message: 'Não foi possível identificar colunas no arquivo' },
          { status: 400 }
        )
      }

      totalLinhas = worksheet.rowCount - 1

      // Parse das linhas (primeiras 10 para preview)
      for (let rowNumber = 2; rowNumber <= Math.min(worksheet.rowCount, 11); rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        const rowData: Record<string, string> = {}

        colunas.forEach((col, idx) => {
          const cell = row.getCell(idx + 1)
          let value = ''

          if (cell.value !== null && cell.value !== undefined) {
            if (cell.value instanceof Date) {
              value = cell.value.toLocaleDateString('pt-BR')
            } else if (typeof cell.value === 'object' && 'result' in cell.value) {
              // Fórmula
              value = cell.value.result?.toString() || ''
            } else {
              value = cell.value.toString()
            }
          }

          rowData[col] = value.trim()
        })

        if (Object.values(rowData).some(v => v)) {
          linhas.push(rowData)
        }
      }

    } else {
      return NextResponse.json(
        { message: 'Tipo de arquivo não suportado. Use .xlsx, .xls ou .csv' },
        { status: 400 }
      )
    }

    // Identificar automaticamente as colunas com base nos nomes
    const identificacaoAutomatica: Record<string, string> = {}
    colunas.forEach(col => {
      const colLower = col.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      if (colLower.includes('data') || colLower.includes('date')) {
        identificacaoAutomatica[col] = 'data'
      } else if (colLower.includes('descri') || colLower.includes('histor') || colLower.includes('memo')) {
        identificacaoAutomatica[col] = 'descricao'
      } else if (colLower.includes('valor') || colLower.includes('quantia') || colLower.includes('amount') || colLower.includes('value')) {
        identificacaoAutomatica[col] = 'valor'
      } else if (colLower.includes('tipo') || colLower.includes('natureza') || colLower.includes('type')) {
        identificacaoAutomatica[col] = 'tipo'
      } else if (colLower.includes('categ') || colLower.includes('category')) {
        identificacaoAutomatica[col] = 'categoria'
      } else if (colLower.includes('conta') || colLower.includes('account')) {
        identificacaoAutomatica[col] = 'conta'
      } else if (colLower.includes('obs') || colLower.includes('nota') || colLower.includes('note')) {
        identificacaoAutomatica[col] = 'observacao'
      }
    })

    return NextResponse.json({
      colunas,
      linhas,
      totalLinhas,
      identificacaoAutomatica,
    })

  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    return NextResponse.json(
      { message: 'Erro ao processar arquivo' },
      { status: 500 }
    )
  }
}
