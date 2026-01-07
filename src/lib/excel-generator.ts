import ExcelJS from 'exceljs'

export interface MovimentacaoExcel {
  id: string
  tipo: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
  categoria: string
  subcategoria?: string
  descricao: string
  valor: number
  dataMovimento: Date | string
  conta?: {
    nome: string
  }
  observacoes?: string
}

export interface ExportacaoConfig {
  periodo?: {
    inicio: Date
    fim: Date
  }
  tipo?: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
  contaId?: string
  titulo?: string
}

export async function gerarExcelMovimentacoes(
  movimentacoes: MovimentacaoExcel[],
  config?: ExportacaoConfig
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BMV Software'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('Movimentações', {
    properties: { tabColor: { argb: '1a365d' } },
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  })

  // Configurar colunas
  worksheet.columns = [
    { header: 'Data', key: 'data', width: 12 },
    { header: 'Tipo', key: 'tipo', width: 14 },
    { header: 'Categoria', key: 'categoria', width: 18 },
    { header: 'Subcategoria', key: 'subcategoria', width: 18 },
    { header: 'Descrição', key: 'descricao', width: 35 },
    { header: 'Conta', key: 'conta', width: 20 },
    { header: 'Valor', key: 'valor', width: 15 },
    { header: 'Observações', key: 'observacoes', width: 30 },
  ]

  // Estilo do cabeçalho
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1a365d' }
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 25

  // Adicionar dados
  let totalReceitas = 0
  let totalDespesas = 0
  let totalTransferencias = 0

  movimentacoes.forEach((mov, index) => {
    const rowNumber = index + 2
    const valor = Number(mov.valor)

    // Acumular totais
    if (mov.tipo === 'RECEITA') totalReceitas += valor
    else if (mov.tipo === 'DESPESA') totalDespesas += valor
    else totalTransferencias += valor

    const row = worksheet.addRow({
      data: new Date(mov.dataMovimento),
      tipo: tipoLabel(mov.tipo),
      categoria: mov.categoria,
      subcategoria: mov.subcategoria || '-',
      descricao: mov.descricao,
      conta: mov.conta?.nome || '-',
      valor: valor,
      observacoes: mov.observacoes || '-'
    })

    // Cor baseada no tipo
    const corFundo = mov.tipo === 'RECEITA'
      ? 'e6ffed'  // Verde claro
      : mov.tipo === 'DESPESA'
        ? 'ffe6e6'  // Vermelho claro
        : 'e6f0ff'  // Azul claro

    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: corFundo }
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'cccccc' } },
        left: { style: 'thin', color: { argb: 'cccccc' } },
        bottom: { style: 'thin', color: { argb: 'cccccc' } },
        right: { style: 'thin', color: { argb: 'cccccc' } }
      }
    })

    // Formatação específica
    const dataCell = row.getCell(1)
    dataCell.numFmt = 'dd/mm/yyyy'

    const valorCell = row.getCell(7)
    valorCell.numFmt = '"R$"#,##0.00'
    valorCell.alignment = { horizontal: 'right' }

    // Cor do texto do valor
    if (mov.tipo === 'RECEITA') {
      valorCell.font = { color: { argb: '16a34a' }, bold: true }
    } else if (mov.tipo === 'DESPESA') {
      valorCell.font = { color: { argb: 'dc2626' }, bold: true }
    } else {
      valorCell.font = { color: { argb: '2563eb' }, bold: true }
    }
  })

  // Linha vazia antes do resumo
  const resumoStartRow = movimentacoes.length + 3
  worksheet.addRow([])

  // Resumo
  const resumoHeader = worksheet.addRow(['', '', '', '', '', 'RESUMO', '', ''])
  resumoHeader.font = { bold: true, size: 12 }
  resumoHeader.getCell(6).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1a365d' }
  }
  resumoHeader.getCell(6).font = { bold: true, color: { argb: 'FFFFFF' } }

  // Total Receitas
  const rowReceitas = worksheet.addRow(['', '', '', '', '', 'Total Receitas:', totalReceitas, ''])
  rowReceitas.getCell(6).font = { bold: true }
  rowReceitas.getCell(7).numFmt = '"R$"#,##0.00'
  rowReceitas.getCell(7).font = { bold: true, color: { argb: '16a34a' } }
  rowReceitas.getCell(7).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'e6ffed' }
  }

  // Total Despesas
  const rowDespesas = worksheet.addRow(['', '', '', '', '', 'Total Despesas:', totalDespesas, ''])
  rowDespesas.getCell(6).font = { bold: true }
  rowDespesas.getCell(7).numFmt = '"R$"#,##0.00'
  rowDespesas.getCell(7).font = { bold: true, color: { argb: 'dc2626' } }
  rowDespesas.getCell(7).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffe6e6' }
  }

  // Total Transferências (se houver)
  if (totalTransferencias > 0) {
    const rowTransf = worksheet.addRow(['', '', '', '', '', 'Total Transferências:', totalTransferencias, ''])
    rowTransf.getCell(6).font = { bold: true }
    rowTransf.getCell(7).numFmt = '"R$"#,##0.00'
    rowTransf.getCell(7).font = { bold: true, color: { argb: '2563eb' } }
    rowTransf.getCell(7).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'e6f0ff' }
    }
  }

  // Saldo (Receitas - Despesas)
  const saldo = totalReceitas - totalDespesas
  const rowSaldo = worksheet.addRow(['', '', '', '', '', 'Saldo:', saldo, ''])
  rowSaldo.getCell(6).font = { bold: true, size: 12 }
  rowSaldo.getCell(7).numFmt = '"R$"#,##0.00'
  rowSaldo.getCell(7).font = {
    bold: true,
    size: 12,
    color: { argb: saldo >= 0 ? '16a34a' : 'dc2626' }
  }
  rowSaldo.getCell(6).border = {
    top: { style: 'medium', color: { argb: '1a365d' } },
    bottom: { style: 'medium', color: { argb: '1a365d' } }
  }
  rowSaldo.getCell(7).border = {
    top: { style: 'medium', color: { argb: '1a365d' } },
    bottom: { style: 'medium', color: { argb: '1a365d' } }
  }

  // Fórmulas de soma (para manter atualizado se editado)
  const dataRowEnd = movimentacoes.length + 1

  // Adicionar filtro automático
  worksheet.autoFilter = {
    from: 'A1',
    to: `H${dataRowEnd}`
  }

  // Congelar primeira linha
  worksheet.views = [
    { state: 'frozen', ySplit: 1 }
  ]

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

function tipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    RECEITA: 'Receita',
    DESPESA: 'Despesa',
    TRANSFERENCIA: 'Transferência'
  }
  return labels[tipo] || tipo
}

export function gerarNomeArquivo(config?: ExportacaoConfig): string {
  const data = new Date()
  const dataStr = data.toISOString().split('T')[0].replace(/-/g, '')
  const titulo = config?.titulo || 'movimentacoes'
  const tipoSuffix = config?.tipo ? `_${config.tipo.toLowerCase()}` : ''

  return `${titulo}${tipoSuffix}_${dataStr}.xlsx`
}
