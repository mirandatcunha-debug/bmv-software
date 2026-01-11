export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

interface MapeamentoColunas {
  [coluna: string]: string // coluna original -> campo do sistema
}

function parseDate(value: string): Date | null {
  if (!value) return null

  // Tentar formato brasileiro DD/MM/YYYY
  const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (brMatch) {
    const day = parseInt(brMatch[1])
    const month = parseInt(brMatch[2]) - 1
    let year = parseInt(brMatch[3])
    if (year < 100) year += 2000
    return new Date(year, month, day)
  }

  // Tentar formato ISO YYYY-MM-DD
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return new Date(value)
  }

  // Tentar formato americano MM/DD/YYYY
  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (usMatch) {
    const month = parseInt(usMatch[1]) - 1
    const day = parseInt(usMatch[2])
    const year = parseInt(usMatch[3])
    return new Date(year, month, day)
  }

  // Tentar parse direto
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

function parseValue(value: string): number {
  if (!value) return 0

  // Remover espaços
  let cleanValue = value.trim()

  // Detectar se é negativo
  const isNegative = cleanValue.startsWith('-') || cleanValue.startsWith('(') || cleanValue.includes('D')

  // Remover símbolos de moeda e caracteres não numéricos (exceto separadores)
  cleanValue = cleanValue.replace(/[R$\s()D]/gi, '')

  // Detectar formato brasileiro (1.234,56) vs americano (1,234.56)
  const hasCommaThenDot = /,\d{3}\./
  const hasDotThenComma = /\.\d{3},/

  if (hasDotThenComma.test(cleanValue) || (cleanValue.includes(',') && !cleanValue.includes('.'))) {
    // Formato brasileiro: pontos são milhares, vírgula é decimal
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
  } else if (hasCommaThenDot.test(cleanValue)) {
    // Formato americano: vírgulas são milhares
    cleanValue = cleanValue.replace(/,/g, '')
  } else if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // Ambíguo - tentar detectar pela posição
    const lastComma = cleanValue.lastIndexOf(',')
    const lastDot = cleanValue.lastIndexOf('.')
    if (lastComma > lastDot) {
      // Vírgula é o decimal
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
    } else {
      // Ponto é o decimal
      cleanValue = cleanValue.replace(/,/g, '')
    }
  }

  const number = parseFloat(cleanValue) || 0
  return isNegative ? -Math.abs(number) : number
}

function detectTipo(value: string, valorNumerico: number): 'RECEITA' | 'DESPESA' {
  const valueLower = value.toLowerCase()

  if (valueLower.includes('receita') || valueLower.includes('entrada') ||
      valueLower.includes('crédito') || valueLower.includes('credito') ||
      valueLower === 'c' || valueLower === 'r') {
    return 'RECEITA'
  }

  if (valueLower.includes('despesa') || valueLower.includes('saída') ||
      valueLower.includes('débito') || valueLower.includes('debito') ||
      valueLower === 'd' || valueLower === 's') {
    return 'DESPESA'
  }

  // Se não identificar pelo texto, usar o sinal do valor
  return valorNumerico >= 0 ? 'RECEITA' : 'DESPESA'
}

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

    // Buscar usuário e tenant
    const usuario = await prisma.user.findUnique({
      where: { authId: session.user.id },
      include: { tenant: true },
    })

    if (!usuario || !usuario.tenantId) {
      return NextResponse.json(
        { message: 'Usuário não encontrado ou sem empresa vinculada' },
        { status: 400 }
      )
    }

    // Verificar permissão
    const canManage = ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(usuario.perfil)
    if (!canManage) {
      return NextResponse.json(
        { message: 'Sem permissão para importar dados' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const mapeamentoStr = formData.get('mapeamento') as string

    if (!file || !mapeamentoStr) {
      return NextResponse.json(
        { message: 'Arquivo ou mapeamento não fornecido' },
        { status: 400 }
      )
    }

    const mapeamento: MapeamentoColunas = JSON.parse(mapeamentoStr)
    const fileName = file.name.toLowerCase()
    const buffer = await file.arrayBuffer()

    // Inverter mapeamento: campo -> coluna
    const campoParaColuna: Record<string, string> = {}
    Object.entries(mapeamento).forEach(([coluna, campo]) => {
      if (campo) {
        campoParaColuna[campo] = coluna
      }
    })

    // Verificar campos obrigatórios
    if (!campoParaColuna['data'] || !campoParaColuna['valor']) {
      return NextResponse.json(
        { message: 'É necessário mapear pelo menos os campos Data e Valor' },
        { status: 400 }
      )
    }

    let linhas: Record<string, string>[] = []
    let colunas: string[] = []

    if (fileName.endsWith('.csv')) {
      const text = new TextDecoder('utf-8').decode(buffer)
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        return NextResponse.json(
          { message: 'Arquivo CSV vazio ou sem dados' },
          { status: 400 }
        )
      }

      const firstLine = lines[0]
      const separator = firstLine.includes(';') ? ';' : ','

      colunas = firstLine.split(separator).map(col =>
        col.trim().replace(/^["']|["']$/g, '')
      )

      for (let i = 1; i < lines.length; i++) {
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
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(Buffer.from(buffer) as unknown as ExcelJS.Buffer)

      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        return NextResponse.json(
          { message: 'Planilha vazia' },
          { status: 400 }
        )
      }

      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell, colNumber) => {
        const value = cell.value?.toString() || `Coluna ${colNumber}`
        colunas.push(value.trim())
      })

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        const rowData: Record<string, string> = {}

        colunas.forEach((col, idx) => {
          const cell = row.getCell(idx + 1)
          let value = ''

          if (cell.value !== null && cell.value !== undefined) {
            if (cell.value instanceof Date) {
              value = cell.value.toLocaleDateString('pt-BR')
            } else if (typeof cell.value === 'object' && 'result' in cell.value) {
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
    }

    // Processar e inserir dados
    let importados = 0
    let erros = 0
    const errosDetalhes: string[] = []

    // Buscar conta bancária padrão do tenant (se existir)
    const contaPadrao = await prisma.bankAccount.findFirst({
      where: { tenantId: usuario.tenantId },
    })

    if (!contaPadrao) {
      return NextResponse.json(
        { message: 'É necessário ter pelo menos uma conta bancária cadastrada para importar transações' },
        { status: 400 }
      )
    }

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i]

      try {
        // Extrair dados mapeados
        const dataStr = linha[campoParaColuna['data']] || ''
        const valorStr = linha[campoParaColuna['valor']] || ''
        const descricao = linha[campoParaColuna['descricao']] || 'Importado'
        const tipoStr = linha[campoParaColuna['tipo']] || ''
        const categoriaStr = linha[campoParaColuna['categoria']] || 'Importação'
        const observacao = linha[campoParaColuna['observacao']] || ''

        // Parse dos valores
        const data = parseDate(dataStr)
        if (!data) {
          erros++
          errosDetalhes.push(`Linha ${i + 2}: Data inválida "${dataStr}"`)
          continue
        }

        const valor = parseValue(valorStr)
        if (valor === 0) {
          erros++
          errosDetalhes.push(`Linha ${i + 2}: Valor inválido "${valorStr}"`)
          continue
        }

        const tipo = tipoStr ? detectTipo(tipoStr, valor) : (valor >= 0 ? 'RECEITA' : 'DESPESA')

        // Criar transação
        await prisma.transaction.create({
          data: {
            descricao,
            valor: Math.abs(valor),
            tipo,
            categoria: categoriaStr,
            dataMovimento: data,
            observacoes: observacao || null,
            contaId: contaPadrao.id,
            tenantId: usuario.tenantId,
          },
        })

        importados++
      } catch (error) {
        erros++
        errosDetalhes.push(`Linha ${i + 2}: Erro ao processar`)
        console.error(`Erro na linha ${i + 2}:`, error)
      }
    }

    return NextResponse.json({
      importados,
      erros,
      total: linhas.length,
      errosDetalhes: errosDetalhes.slice(0, 10), // Limitar a 10 erros no retorno
    })

  } catch (error) {
    console.error('Erro ao processar importação:', error)
    return NextResponse.json(
      { message: 'Erro ao processar importação' },
      { status: 500 }
    )
  }
}
