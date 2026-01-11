import ExcelJS from 'exceljs'

// Tipos de dados detectados automaticamente
export type TipoDado = 'texto' | 'numero' | 'data' | 'moeda'

// Tipos de importação suportados
export type TipoImportacao = 'clientes' | 'fornecedores' | 'contas_receber' | 'contas_pagar' | 'lancamentos'

// Interface para dados importados
export interface DadosImportacao {
  colunas: string[]
  linhas: Record<string, string | number | Date | null>[]
  totalLinhas: number
  tiposColunas: Record<string, TipoDado>
}

// Interface para mapeamento de colunas
export interface MapeamentoColunas {
  colunaArquivo: string
  campoSistema: string
  tipoDetectado: TipoDado
  confianca: number // 0-1
}

export interface MapeamentoSugerido {
  mapeamentos: MapeamentoColunas[]
  camposObrigatoriosFaltando: string[]
}

// Campos disponíveis por tipo de importação
export const camposPorTipo: Record<TipoImportacao, { campo: string; label: string; obrigatorio: boolean }[]> = {
  clientes: [
    { campo: 'nome', label: 'Nome/Razão Social', obrigatorio: true },
    { campo: 'documento', label: 'CPF/CNPJ', obrigatorio: false },
    { campo: 'email', label: 'E-mail', obrigatorio: false },
    { campo: 'telefone', label: 'Telefone', obrigatorio: false },
    { campo: 'endereco', label: 'Endereço', obrigatorio: false },
    { campo: 'cidade', label: 'Cidade', obrigatorio: false },
    { campo: 'estado', label: 'Estado', obrigatorio: false },
    { campo: 'cep', label: 'CEP', obrigatorio: false },
    { campo: 'observacoes', label: 'Observações', obrigatorio: false },
  ],
  fornecedores: [
    { campo: 'nome', label: 'Nome/Razão Social', obrigatorio: true },
    { campo: 'documento', label: 'CPF/CNPJ', obrigatorio: false },
    { campo: 'email', label: 'E-mail', obrigatorio: false },
    { campo: 'telefone', label: 'Telefone', obrigatorio: false },
    { campo: 'endereco', label: 'Endereço', obrigatorio: false },
    { campo: 'cidade', label: 'Cidade', obrigatorio: false },
    { campo: 'estado', label: 'Estado', obrigatorio: false },
    { campo: 'cep', label: 'CEP', obrigatorio: false },
    { campo: 'observacoes', label: 'Observações', obrigatorio: false },
  ],
  contas_receber: [
    { campo: 'descricao', label: 'Descrição', obrigatorio: true },
    { campo: 'valor', label: 'Valor', obrigatorio: true },
    { campo: 'dataVencimento', label: 'Data de Vencimento', obrigatorio: true },
    { campo: 'cliente', label: 'Cliente', obrigatorio: false },
    { campo: 'categoria', label: 'Categoria', obrigatorio: false },
    { campo: 'status', label: 'Status (Pendente/Pago)', obrigatorio: false },
    { campo: 'dataPagamento', label: 'Data de Pagamento', obrigatorio: false },
    { campo: 'observacoes', label: 'Observações', obrigatorio: false },
  ],
  contas_pagar: [
    { campo: 'descricao', label: 'Descrição', obrigatorio: true },
    { campo: 'valor', label: 'Valor', obrigatorio: true },
    { campo: 'dataVencimento', label: 'Data de Vencimento', obrigatorio: true },
    { campo: 'fornecedor', label: 'Fornecedor', obrigatorio: false },
    { campo: 'categoria', label: 'Categoria', obrigatorio: false },
    { campo: 'status', label: 'Status (Pendente/Pago)', obrigatorio: false },
    { campo: 'dataPagamento', label: 'Data de Pagamento', obrigatorio: false },
    { campo: 'observacoes', label: 'Observações', obrigatorio: false },
  ],
  lancamentos: [
    { campo: 'descricao', label: 'Descrição', obrigatorio: true },
    { campo: 'valor', label: 'Valor', obrigatorio: true },
    { campo: 'data', label: 'Data', obrigatorio: true },
    { campo: 'tipo', label: 'Tipo (Receita/Despesa)', obrigatorio: false },
    { campo: 'categoria', label: 'Categoria', obrigatorio: false },
    { campo: 'subcategoria', label: 'Subcategoria', obrigatorio: false },
    { campo: 'conta', label: 'Conta', obrigatorio: false },
    { campo: 'observacoes', label: 'Observações', obrigatorio: false },
  ],
}

// Parser para arquivos Excel (.xlsx, .xls)
export async function parseExcel(file: File): Promise<DadosImportacao> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('Planilha vazia ou não encontrada')
  }

  const colunas: string[] = []
  const linhas: Record<string, string | number | Date | null>[] = []

  // Ler cabeçalho (primeira linha)
  const headerRow = worksheet.getRow(1)
  headerRow.eachCell((cell, colNumber) => {
    const valor = cell.value?.toString().trim() || `Coluna ${colNumber}`
    colunas.push(valor)
  })

  if (colunas.length === 0) {
    throw new Error('Nenhuma coluna encontrada na planilha')
  }

  // Ler dados (a partir da segunda linha)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // Pular cabeçalho

    const linha: Record<string, string | number | Date | null> = {}
    let temDados = false

    colunas.forEach((coluna, index) => {
      const cell = row.getCell(index + 1)
      const valor = extrairValorCelula(cell)
      linha[coluna] = valor
      if (valor !== null && valor !== '') {
        temDados = true
      }
    })

    if (temDados) {
      linhas.push(linha)
    }
  })

  // Detectar tipos de cada coluna
  const tiposColunas = detectarTiposColunasAuto(colunas, linhas)

  return {
    colunas,
    linhas,
    totalLinhas: linhas.length,
    tiposColunas,
  }
}

// Parser para arquivos CSV
export async function parseCSV(file: File): Promise<DadosImportacao> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(line => line.trim())

  if (lines.length === 0) {
    throw new Error('Arquivo CSV vazio')
  }

  // Detectar separador (vírgula, ponto-e-vírgula ou tab)
  const separador = detectarSeparadorCSV(lines[0])

  // Ler cabeçalho
  const colunas = parseCSVLine(lines[0], separador)

  if (colunas.length === 0) {
    throw new Error('Nenhuma coluna encontrada no CSV')
  }

  // Ler dados
  const linhas: Record<string, string | number | Date | null>[] = []

  for (let i = 1; i < lines.length; i++) {
    const valores = parseCSVLine(lines[i], separador)
    const linha: Record<string, string | number | Date | null> = {}
    let temDados = false

    colunas.forEach((coluna, index) => {
      const valorStr = valores[index]?.trim() || ''
      const valor = converterValorCSV(valorStr)
      linha[coluna] = valor
      if (valor !== null && valor !== '') {
        temDados = true
      }
    })

    if (temDados) {
      linhas.push(linha)
    }
  }

  // Detectar tipos de cada coluna
  const tiposColunas = detectarTiposColunasAuto(colunas, linhas)

  return {
    colunas,
    linhas,
    totalLinhas: linhas.length,
    tiposColunas,
  }
}

// Detectar tipo de dado baseado nos valores
export function detectarTipoDado(valores: (string | number | Date | null)[]): TipoDado {
  const valoresValidos = valores.filter(v => v !== null && v !== '')

  if (valoresValidos.length === 0) {
    return 'texto'
  }

  let countData = 0
  let countMoeda = 0
  let countNumero = 0
  let countTexto = 0

  for (const valor of valoresValidos) {
    if (valor instanceof Date) {
      countData++
      continue
    }

    const str = String(valor).trim()

    // Verificar se é data (formatos comuns brasileiros e internacionais)
    if (isDateString(str)) {
      countData++
      continue
    }

    // Verificar se é moeda (R$, $, etc ou formato brasileiro de número)
    if (isMoedaString(str)) {
      countMoeda++
      continue
    }

    // Verificar se é número
    if (isNumeroString(str)) {
      countNumero++
      continue
    }

    countTexto++
  }

  const total = valoresValidos.length
  const threshold = 0.6 // 60% dos valores devem ser do mesmo tipo

  if (countData / total >= threshold) return 'data'
  if (countMoeda / total >= threshold) return 'moeda'
  if (countNumero / total >= threshold) return 'numero'
  return 'texto'
}

// Mapear colunas automaticamente
export function mapearColunas(
  colunas: string[],
  tipoImportacao: TipoImportacao,
  tiposColunas: Record<string, TipoDado>
): MapeamentoSugerido {
  const camposDisponiveis = camposPorTipo[tipoImportacao]
  const mapeamentos: MapeamentoColunas[] = []
  const camposMapeados = new Set<string>()

  // Palavras-chave para cada campo
  const palavrasChave: Record<string, string[]> = {
    nome: ['nome', 'razao', 'razão', 'social', 'cliente', 'fornecedor', 'name'],
    documento: ['cpf', 'cnpj', 'documento', 'doc', 'inscricao', 'ie'],
    email: ['email', 'e-mail', 'mail', 'correio'],
    telefone: ['telefone', 'tel', 'celular', 'fone', 'phone', 'whatsapp', 'whats'],
    endereco: ['endereco', 'endereço', 'rua', 'logradouro', 'address'],
    cidade: ['cidade', 'municipio', 'município', 'city'],
    estado: ['estado', 'uf', 'state'],
    cep: ['cep', 'codigo postal', 'zip'],
    observacoes: ['obs', 'observacao', 'observação', 'observacoes', 'observações', 'notas', 'notes'],
    descricao: ['descricao', 'descrição', 'historico', 'histórico', 'description', 'memo'],
    valor: ['valor', 'value', 'quantia', 'amount', 'total', 'preco', 'preço'],
    data: ['data', 'date', 'dt', 'movimento', 'lancamento', 'lançamento'],
    dataVencimento: ['vencimento', 'venc', 'due', 'prazo'],
    dataPagamento: ['pagamento', 'pago', 'paid', 'quitacao', 'quitação'],
    tipo: ['tipo', 'type', 'natureza', 'operacao', 'operação'],
    categoria: ['categoria', 'category', 'cat', 'grupo'],
    subcategoria: ['subcategoria', 'sub', 'subcat'],
    conta: ['conta', 'account', 'banco', 'bank'],
    cliente: ['cliente', 'customer', 'client', 'sacado'],
    fornecedor: ['fornecedor', 'supplier', 'vendor', 'cedente'],
    status: ['status', 'situacao', 'situação', 'state'],
  }

  for (const coluna of colunas) {
    const colunaLower = coluna.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let melhorMatch: { campo: string; confianca: number } | null = null

    for (const campoInfo of camposDisponiveis) {
      const { campo } = campoInfo
      const keywords = palavrasChave[campo] || []

      for (const keyword of keywords) {
        const keywordNormalized = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        // Match exato
        if (colunaLower === keywordNormalized) {
          if (!camposMapeados.has(campo)) {
            melhorMatch = { campo, confianca: 1.0 }
            break
          }
        }

        // Match parcial (contém a palavra)
        if (colunaLower.includes(keywordNormalized) || keywordNormalized.includes(colunaLower)) {
          const confianca = 0.7
          if (!camposMapeados.has(campo) && (!melhorMatch || confianca > melhorMatch.confianca)) {
            melhorMatch = { campo, confianca }
          }
        }
      }

      if (melhorMatch?.confianca === 1.0) break
    }

    if (melhorMatch) {
      camposMapeados.add(melhorMatch.campo)
      mapeamentos.push({
        colunaArquivo: coluna,
        campoSistema: melhorMatch.campo,
        tipoDetectado: tiposColunas[coluna] || 'texto',
        confianca: melhorMatch.confianca,
      })
    } else {
      mapeamentos.push({
        colunaArquivo: coluna,
        campoSistema: '',
        tipoDetectado: tiposColunas[coluna] || 'texto',
        confianca: 0,
      })
    }
  }

  // Verificar campos obrigatórios não mapeados
  const camposObrigatorios = camposDisponiveis.filter(c => c.obrigatorio).map(c => c.campo)
  const camposObrigatoriosFaltando = camposObrigatorios.filter(c => !camposMapeados.has(c))

  return {
    mapeamentos,
    camposObrigatoriosFaltando,
  }
}

// Funções auxiliares

function extrairValorCelula(cell: ExcelJS.Cell): string | number | Date | null {
  const valor = cell.value

  if (valor === null || valor === undefined) {
    return null
  }

  // Se for booleano, converter para string
  if (typeof valor === 'boolean') {
    return valor ? 'Sim' : 'Não'
  }

  // Se for um objeto de data do ExcelJS
  if (valor instanceof Date) {
    return valor
  }

  // Se for um objeto com resultado de fórmula
  if (typeof valor === 'object') {
    if ('result' in valor) {
      const result = valor.result
      if (typeof result === 'boolean') {
        return result ? 'Sim' : 'Não'
      }
      return result as string | number
    }
    if ('richText' in valor) {
      return (valor as ExcelJS.CellRichTextValue).richText.map(rt => rt.text).join('')
    }
    if ('text' in valor) {
      return (valor as ExcelJS.CellHyperlinkValue).text
    }
    return String(valor)
  }

  return valor as string | number
}

function detectarSeparadorCSV(linha: string): string {
  const separadores = [';', ',', '\t', '|']
  let melhorSeparador = ','
  let maiorCount = 0

  for (const sep of separadores) {
    const count = (linha.match(new RegExp(`\\${sep}`, 'g')) || []).length
    if (count > maiorCount) {
      maiorCount = count
      melhorSeparador = sep
    }
  }

  return melhorSeparador
}

function parseCSVLine(linha: string, separador: string): string[] {
  const resultado: string[] = []
  let atual = ''
  let dentroAspas = false

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i]

    if (char === '"') {
      if (dentroAspas && linha[i + 1] === '"') {
        atual += '"'
        i++
      } else {
        dentroAspas = !dentroAspas
      }
    } else if (char === separador && !dentroAspas) {
      resultado.push(atual.trim())
      atual = ''
    } else {
      atual += char
    }
  }

  resultado.push(atual.trim())
  return resultado
}

function converterValorCSV(valor: string): string | number | Date | null {
  if (!valor || valor === '') {
    return null
  }

  // Tentar converter para número
  const numLimpo = valor.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(numLimpo)
  if (!isNaN(num) && isFinite(num)) {
    return num
  }

  // Tentar converter para data
  const data = parseDataString(valor)
  if (data) {
    return data
  }

  return valor
}

function detectarTiposColunasAuto(
  colunas: string[],
  linhas: Record<string, string | number | Date | null>[]
): Record<string, TipoDado> {
  const tipos: Record<string, TipoDado> = {}

  for (const coluna of colunas) {
    const valores = linhas.map(l => l[coluna])
    tipos[coluna] = detectarTipoDado(valores)
  }

  return tipos
}

function isDateString(str: string): boolean {
  // Formatos comuns: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, dd/mm/yy
  const datePatterns = [
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, // dd/mm/yyyy ou dd-mm-yyyy
    /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/, // yyyy-mm-dd
  ]

  for (const pattern of datePatterns) {
    if (pattern.test(str)) {
      return true
    }
  }

  return false
}

function isMoedaString(str: string): boolean {
  // R$ 1.234,56 ou $ 1,234.56 ou 1234.56 ou 1.234,56
  const moedaPatterns = [
    /^R?\$?\s*[\d.,]+$/, // Com ou sem R$
    /^[\d.]+,\d{2}$/, // Formato brasileiro: 1.234,56
    /^-?[\d,]+\.\d{2}$/, // Formato americano: 1,234.56
  ]

  for (const pattern of moedaPatterns) {
    if (pattern.test(str.trim())) {
      return true
    }
  }

  return false
}

function isNumeroString(str: string): boolean {
  const numLimpo = str.replace(/[.,\s]/g, '')
  return /^-?\d+$/.test(numLimpo)
}

function parseDataString(str: string): Date | null {
  // dd/mm/yyyy
  let match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (match) {
    let [, dia, mes, ano] = match
    if (ano.length === 2) {
      ano = parseInt(ano) > 50 ? `19${ano}` : `20${ano}`
    }
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
    if (!isNaN(data.getTime())) {
      return data
    }
  }

  // yyyy-mm-dd
  match = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (match) {
    const [, ano, mes, dia] = match
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
    if (!isNaN(data.getTime())) {
      return data
    }
  }

  return null
}

// Exportar arquivo de exemplo/template
export async function gerarTemplateImportacao(tipoImportacao: TipoImportacao): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BMV Software'
  workbook.created = new Date()

  const campos = camposPorTipo[tipoImportacao]
  const worksheet = workbook.addWorksheet('Dados')

  // Configurar colunas
  worksheet.columns = campos.map(campo => ({
    header: campo.label + (campo.obrigatorio ? ' *' : ''),
    key: campo.campo,
    width: 20,
  }))

  // Estilo do cabeçalho
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0891b2' }, // cyan-600
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 25

  // Adicionar linha de exemplo
  const exemploRow: Record<string, string> = {}
  campos.forEach(campo => {
    exemploRow[campo.campo] = `Exemplo ${campo.label}`
  })
  worksheet.addRow(exemploRow)

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
