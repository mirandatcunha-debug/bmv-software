'use client'
import { AlertTriangle, Building2 } from 'lucide-react'
import Link from 'next/link'

const config = {
  NOT_AUTHENTICATED: { icon: AlertTriangle, title: 'Sessão expirada', desc: 'Faça login novamente.', href: '/login', label: 'Login' },
  USER_NOT_FOUND: { icon: AlertTriangle, title: 'Usuário não encontrado', desc: 'Contate o suporte.', href: '/', label: 'Início' },
  TENANT_NOT_FOUND: { icon: Building2, title: 'Empresa não vinculada', desc: 'Contate o administrador.', href: '/', label: 'Início' }
}

export function TenantError({ type }: { type: keyof typeof config }) {
  const c = config[type]
  const Icon = c.icon
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{c.title}</h2>
        <p className="text-gray-600 mb-6">{c.desc}</p>
        <Link href={c.href} className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg">{c.label}</Link>
      </div>
    </div>
  )
}
