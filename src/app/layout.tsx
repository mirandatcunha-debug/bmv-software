import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'BM&V Software',
    template: '%s | BM&V',
  },
  description: 'Sistema de gestão financeira, contábil, OKRs e consultoria',
  keywords: ['financeiro', 'contábil', 'OKR', 'consultoria', 'gestão'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
