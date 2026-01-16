export interface ConfigERP {
  tipo: TipoERP
  nome: string
  descricao: string
  logo: string
  campos: CampoConfig[]
  recursos: string[]
  documentacao: string
}

export interface CampoConfig {
  nome: string
  campo: string
  tipo: 'text' | 'password' | 'select'
  obrigatorio: boolean
  placeholder?: string
  ajuda?: string
}

export type TipoERP = 'OMIE' | 'BLING' | 'TINY' | 'CONTAAZUL' | 'NFEIO'

export interface ResultadoSync {
  sucesso: boolean
  tipo: string
  criados: number
  atualizados: number
  erros: number
  mensagem?: string
}

export const ERPS_DISPONIVEIS: ConfigERP[] = [
  {
    tipo: 'OMIE',
    nome: 'Omie',
    descricao: 'ERP completo para gestão empresarial',
    logo: '/erps/omie.png',
    campos: [
      { nome: 'App Key', campo: 'appKey', tipo: 'text', obrigatorio: true, placeholder: 'Sua App Key', ajuda: 'Encontre em Omie > API > Chaves' },
      { nome: 'App Secret', campo: 'appSecret', tipo: 'password', obrigatorio: true, placeholder: 'Seu App Secret' }
    ],
    recursos: ['Clientes', 'Fornecedores', 'Contas a Receber', 'Contas a Pagar', 'Produtos'],
    documentacao: 'https://developer.omie.com.br/'
  },
  {
    tipo: 'BLING',
    nome: 'Bling',
    descricao: 'ERP para e-commerce e varejo',
    logo: '/erps/bling.png',
    campos: [
      { nome: 'API Key', campo: 'apiKey', tipo: 'password', obrigatorio: true, placeholder: 'Sua API Key', ajuda: 'Encontre em Bling > Usuários > API' }
    ],
    recursos: ['Clientes', 'Fornecedores', 'Contas a Receber', 'Contas a Pagar', 'Produtos', 'Pedidos'],
    documentacao: 'https://developer.bling.com.br/'
  },
  {
    tipo: 'TINY',
    nome: 'Tiny ERP',
    descricao: 'ERP simples para pequenas empresas',
    logo: '/erps/tiny.png',
    campos: [
      { nome: 'Token', campo: 'token', tipo: 'password', obrigatorio: true, placeholder: 'Seu Token de API', ajuda: 'Encontre em Tiny > Configurações > Tokens' }
    ],
    recursos: ['Clientes', 'Fornecedores', 'Contas a Receber', 'Contas a Pagar'],
    documentacao: 'https://tiny.com.br/api'
  },
  {
    tipo: 'CONTAAZUL',
    nome: 'ContaAzul',
    descricao: 'Gestão financeira para PMEs',
    logo: '/erps/contaazul.png',
    campos: [
      { nome: 'Client ID', campo: 'clientId', tipo: 'text', obrigatorio: true, placeholder: 'Client ID' },
      { nome: 'Client Secret', campo: 'clientSecret', tipo: 'password', obrigatorio: true, placeholder: 'Client Secret' },
      { nome: 'Access Token', campo: 'accessToken', tipo: 'password', obrigatorio: true, placeholder: 'Access Token' }
    ],
    recursos: ['Clientes', 'Fornecedores', 'Vendas', 'Compras'],
    documentacao: 'https://developers.contaazul.com/'
  },
  {
    tipo: 'NFEIO',
    nome: 'NFe.io',
    descricao: 'Emissão de notas fiscais',
    logo: '/erps/nfeio.png',
    campos: [
      { nome: 'API Key', campo: 'apiKey', tipo: 'password', obrigatorio: true, placeholder: 'Sua API Key' },
      { nome: 'Company ID', campo: 'companyId', tipo: 'text', obrigatorio: true, placeholder: 'ID da Empresa' }
    ],
    recursos: ['Notas Fiscais', 'Clientes'],
    documentacao: 'https://nfe.io/docs/'
  }
]

export function getERPConfig(tipo: TipoERP): ConfigERP | undefined {
  return ERPS_DISPONIVEIS.find(e => e.tipo === tipo)
}
