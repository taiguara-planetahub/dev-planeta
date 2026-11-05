'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Componente de tratamento de erro do Next.js App Router.
 * Obrigatório ser Client Component pela especificação do framework.
 * Captura exceções lançadas pelas Server Actions e renderizações.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erro capturado pela aplicação:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Operação não concluída</h2>
        <p className="text-slate-600 text-sm mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-left font-mono">
          {error.message || 'Ocorreu um erro inesperado ao processar a requisição.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors inline-block"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
