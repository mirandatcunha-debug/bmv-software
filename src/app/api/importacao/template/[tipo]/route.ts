export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { gerarCSVTemplate, TipoImportacao, TEMPLATES } from '@/lib/importacao/templates'

export async function GET(request: Request, { params }: { params: { tipo: string } }) {
  const tipo = params.tipo as TipoImportacao

  if (!TEMPLATES[tipo]) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const csv = gerarCSVTemplate(tipo)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=template_${tipo}.csv`
    }
  })
}
