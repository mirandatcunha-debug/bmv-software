export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTenantFromSession } from '@/lib/get-tenant'
import { parseCSV } from '@/lib/importacao/parser'
import { TipoImportacao } from '@/lib/importacao/templates'

export async function POST(request: Request) {
  const { user } = await getTenantFromSession()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const formData = await request.formData()
    const arquivo = formData.get('arquivo') as File
    const tipo = formData.get('tipo') as TipoImportacao

    if (!arquivo || !tipo) {
      return NextResponse.json({ error: 'Arquivo e tipo são obrigatórios' }, { status: 400 })
    }

    const conteudo = await arquivo.text()
    const resultado = parseCSV(conteudo, tipo)

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Erro ao validar:', error)
    return NextResponse.json({ error: 'Erro ao processar arquivo' }, { status: 500 })
  }
}
