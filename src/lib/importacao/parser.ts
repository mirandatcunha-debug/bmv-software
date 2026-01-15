import { TEMPLATES, TipoImportacao } from './templates'

export interface LinhaImportacao {
  linha: number
  dados: Record<string, any>
  erros: string[]
  valido: boolean
}

export interface ResultadoParse {
  tipo: TipoImportacao
  total: number
  validos: number
  invalidos: number
  linhas: LinhaImportacao[]
}

function parseData(valor: string): Date | null {
  // Tenta formato DD/MM/YYYY
  const partes = valor.split('/')
  if (partes.length === 3) {
    const [dia, mes, ano] = partes.map(p => parseInt(p, 10))
    if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
      const data = new Date(ano, mes - 1, dia)
      if (!isNaN(data.getTime())) {
        return data
      }
    }
  }

  // Tenta formato YYYY-MM-DD
  const dataISO = new Date(valor)
  if (!isNaN(dataISO.getTime())) {
    return dataISO
  }

  return null
}

export function parseCSV(conteudo: string, tipo: TipoImportacao): ResultadoParse {
  const template = TEMPLATES[tipo]
  const linhasRaw = conteudo.split('\n').filter(l => l.trim())

  if (linhasRaw.length < 2) {
    return { tipo, total: 0, validos: 0, invalidos: 0, linhas: [] }
  }

  // Detectar separador (vírgula ou ponto-e-vírgula)
  const primeiraLinha = linhasRaw[0]
  const separador = primeiraLinha.includes(';') ? ';' : ','

  // Headers
  const headers = linhasRaw[0].split(separador).map(h => h.trim().toLowerCase())

  // Mapear headers para campos
  const mapeamento: Record<number, string> = {}
  headers.forEach((header, index) => {
    const coluna = template.colunas.find(c =>
      c.label.toLowerCase() === header ||
      c.campo.toLowerCase() === header ||
      header.includes(c.campo.toLowerCase())
    )
    if (coluna) {
      mapeamento[index] = coluna.campo
    }
  })

  // Processar linhas
  const linhas: LinhaImportacao[] = []
  const colunasObrigatorias = template.colunas.filter(c => c.obrigatorio).map(c => c.campo)

  for (let i = 1; i < linhasRaw.length; i++) {
    const valores = linhasRaw[i].split(separador).map(v => v.trim())
    const dados: Record<string, any> = {}
    const erros: string[] = []

    // Mapear valores
    valores.forEach((valor, index) => {
      const campo = mapeamento[index]
      if (campo && valor) {
        dados[campo] = valor
      }
    })

    // Validar obrigatórios
    colunasObrigatorias.forEach(campo => {
      if (!dados[campo]) {
        const coluna = template.colunas.find(c => c.campo === campo)
        erros.push(`Campo "${coluna?.label}" é obrigatório`)
      }
    })

    // Validar tipos específicos
    if (dados.valor) {
      const valorNum = parseFloat(dados.valor.replace(',', '.').replace(/[^\d.-]/g, ''))
      if (isNaN(valorNum)) {
        erros.push('Valor inválido')
      } else {
        dados.valor = valorNum
      }
    }

    if (dados.dataVencimento) {
      const data = parseData(dados.dataVencimento)
      if (!data) {
        erros.push('Data de vencimento inválida')
      } else {
        dados.dataVencimento = data
      }
    }

    if (dados.dataEmissao) {
      const data = parseData(dados.dataEmissao)
      if (data) dados.dataEmissao = data
    }

    if (dados.data) {
      const data = parseData(dados.data)
      if (!data) {
        erros.push('Data inválida')
      } else {
        dados.data = data
      }
    }

    if (dados.tipo) {
      dados.tipo = dados.tipo.toUpperCase()
      if (!['RECEITA', 'DESPESA'].includes(dados.tipo)) {
        erros.push('Tipo deve ser RECEITA ou DESPESA')
      }
    }

    linhas.push({
      linha: i + 1,
      dados,
      erros,
      valido: erros.length === 0
    })
  }

  return {
    tipo,
    total: linhas.length,
    validos: linhas.filter(l => l.valido).length,
    invalidos: linhas.filter(l => !l.valido).length,
    linhas
  }
}

export function validarLinha(dados: Record<string, any>, tipo: TipoImportacao): string[] {
  const template = TEMPLATES[tipo]
  const erros: string[] = []

  const colunasObrigatorias = template.colunas.filter(c => c.obrigatorio)

  colunasObrigatorias.forEach(coluna => {
    if (!dados[coluna.campo]) {
      erros.push(`Campo "${coluna.label}" é obrigatório`)
    }
  })

  return erros
}
