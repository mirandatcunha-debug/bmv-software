'use client'
import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
            <p className="text-gray-600 mb-6">Estamos trabalhando para resolver. Tente novamente.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg">
                <RefreshCw className="w-4 h-4" /> Recarregar
              </button>
              <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                <Home className="w-4 h-4" /> Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
