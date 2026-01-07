import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { Movimentacao, TipoTransacao, tipoTransacaoLabels } from '@/types/financeiro'

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  periodo: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 9,
    color: '#4B5563',
  },
  colData: {
    width: '12%',
  },
  colDescricao: {
    width: '30%',
  },
  colCategoria: {
    width: '18%',
  },
  colTipo: {
    width: '12%',
  },
  colConta: {
    width: '15%',
  },
  colValor: {
    width: '13%',
    textAlign: 'right',
  },
  receita: {
    color: '#059669',
  },
  despesa: {
    color: '#DC2626',
  },
  transferencia: {
    color: '#2563EB',
  },
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
  },
  resumoCard: {
    width: '30%',
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  resumoCardReceita: {
    backgroundColor: '#ECFDF5',
  },
  resumoCardDespesa: {
    backgroundColor: '#FEF2F2',
  },
  resumoCardSaldo: {
    backgroundColor: '#EFF6FF',
  },
  resumoLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumoValorReceita: {
    color: '#059669',
  },
  resumoValorDespesa: {
    color: '#DC2626',
  },
  resumoValorSaldo: {
    color: '#2563EB',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  noData: {
    textAlign: 'center',
    padding: 20,
    color: '#6B7280',
    fontSize: 12,
  },
})

// Função para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Função para formatar data
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

// Interface para os dados do relatório
export interface RelatorioFinanceiroData {
  movimentacoes: Movimentacao[]
  periodo: {
    inicio: string
    fim: string
  }
  filtros?: {
    tipo?: TipoTransacao
    conta?: string
  }
  totais: {
    receitas: number
    despesas: number
    saldo: number
  }
}

// Componente do documento PDF
const RelatorioFinanceiroPDF: React.FC<{ data: RelatorioFinanceiroData }> = ({ data }) => {
  const { movimentacoes, periodo, filtros, totais } = data
  const dataGeracao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const getTipoStyle = (tipo: TipoTransacao) => {
    switch (tipo) {
      case 'RECEITA':
        return styles.receita
      case 'DESPESA':
        return styles.despesa
      case 'TRANSFERENCIA':
        return styles.transferencia
      default:
        return {}
    }
  }

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.logo }, 'BMV'),
          React.createElement(Text, { style: styles.logoSubtitle }, 'Software de Gestao')
        ),
        React.createElement(
          View,
          { style: styles.headerRight },
          React.createElement(Text, { style: styles.title }, 'Relatorio Financeiro'),
          React.createElement(
            Text,
            { style: styles.subtitle },
            `Gerado em: ${dataGeracao}`
          ),
          React.createElement(
            Text,
            { style: styles.periodo },
            `Periodo: ${periodo.inicio} a ${periodo.fim}`
          ),
          filtros?.tipo &&
            React.createElement(
              Text,
              { style: styles.periodo },
              `Tipo: ${tipoTransacaoLabels[filtros.tipo]}`
            ),
          filtros?.conta &&
            React.createElement(
              Text,
              { style: styles.periodo },
              `Conta: ${filtros.conta}`
            )
        )
      ),
      // Tabela de movimentações
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Movimentacoes'),
        movimentacoes.length > 0
          ? React.createElement(
              View,
              { style: styles.table },
              // Header da tabela
              React.createElement(
                View,
                { style: styles.tableHeader },
                React.createElement(
                  Text,
                  { style: [styles.tableHeaderCell, styles.colData] },
                  'Data'
                ),
                React.createElement(
                  Text,
                  { style: [styles.tableHeaderCell, styles.colDescricao] },
                  'Descricao'
                ),
                React.createElement(
                  Text,
                  { style: [styles.tableHeaderCell, styles.colCategoria] },
                  'Categoria'
                ),
                React.createElement(
                  Text,
                  { style: [styles.tableHeaderCell, styles.colTipo] },
                  'Tipo'
                ),
                React.createElement(
                  Text,
                  { style: [styles.tableHeaderCell, styles.colConta] },
                  'Conta'
                ),
                React.createElement(
                  Text,
                  { style: [styles.tableHeaderCell, styles.colValor] },
                  'Valor'
                )
              ),
              // Linhas da tabela
              ...movimentacoes.map((mov, index) =>
                React.createElement(
                  View,
                  {
                    key: mov.id,
                    style: [styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}],
                  },
                  React.createElement(
                    Text,
                    { style: [styles.tableCell, styles.colData] },
                    formatDate(mov.dataMovimento)
                  ),
                  React.createElement(
                    Text,
                    { style: [styles.tableCell, styles.colDescricao] },
                    mov.descricao
                  ),
                  React.createElement(
                    Text,
                    { style: [styles.tableCell, styles.colCategoria] },
                    mov.categoria
                  ),
                  React.createElement(
                    Text,
                    { style: [styles.tableCell, styles.colTipo, getTipoStyle(mov.tipo)] },
                    tipoTransacaoLabels[mov.tipo]
                  ),
                  React.createElement(
                    Text,
                    { style: [styles.tableCell, styles.colConta] },
                    mov.conta?.nome || '-'
                  ),
                  React.createElement(
                    Text,
                    { style: [styles.tableCell, styles.colValor, getTipoStyle(mov.tipo)] },
                    formatCurrency(mov.valor)
                  )
                )
              )
            )
          : React.createElement(
              Text,
              { style: styles.noData },
              'Nenhuma movimentacao encontrada no periodo selecionado.'
            )
      ),
      // Resumo
      React.createElement(
        View,
        { style: styles.resumoContainer },
        React.createElement(
          View,
          { style: [styles.resumoCard, styles.resumoCardReceita] },
          React.createElement(Text, { style: styles.resumoLabel }, 'Total Receitas'),
          React.createElement(
            Text,
            { style: [styles.resumoValor, styles.resumoValorReceita] },
            formatCurrency(totais.receitas)
          )
        ),
        React.createElement(
          View,
          { style: [styles.resumoCard, styles.resumoCardDespesa] },
          React.createElement(Text, { style: styles.resumoLabel }, 'Total Despesas'),
          React.createElement(
            Text,
            { style: [styles.resumoValor, styles.resumoValorDespesa] },
            formatCurrency(totais.despesas)
          )
        ),
        React.createElement(
          View,
          { style: [styles.resumoCard, styles.resumoCardSaldo] },
          React.createElement(Text, { style: styles.resumoLabel }, 'Saldo do Periodo'),
          React.createElement(
            Text,
            { style: [styles.resumoValor, styles.resumoValorSaldo] },
            formatCurrency(totais.saldo)
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          'BMV Software - Sistema de Gestao Empresarial'
        ),
        React.createElement(
          Text,
          { style: styles.footerText },
          `Pagina 1 de 1`
        )
      )
    )
  )
}

// Função principal para gerar o PDF
export async function gerarRelatorioFinanceiroPDF(
  data: RelatorioFinanceiroData
): Promise<Buffer> {
  const document = React.createElement(RelatorioFinanceiroPDF, { data })
  const buffer = await renderToBuffer(document)
  return Buffer.from(buffer)
}

// Função para calcular totais
export function calcularTotaisMovimentacoes(movimentacoes: Movimentacao[]): {
  receitas: number
  despesas: number
  saldo: number
} {
  const receitas = movimentacoes
    .filter((m) => m.tipo === 'RECEITA')
    .reduce((acc, m) => acc + m.valor, 0)

  const despesas = movimentacoes
    .filter((m) => m.tipo === 'DESPESA')
    .reduce((acc, m) => acc + m.valor, 0)

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
  }
}
