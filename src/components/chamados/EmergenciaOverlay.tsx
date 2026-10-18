import { useEffect, useRef } from 'react'
import { AlertTriangle, OctagonAlert } from 'lucide-react'

interface EmergenciaOverlayProps {
  isSubmitting: boolean
  error: string | null
  onCancel: () => void
  onRetry: () => void
}

/** Diálogo de envio do chamado, baseado no modal de Emergência Imediata da referência */
function EmergenciaOverlay({ isSubmitting, error, onCancel, onRetry }: EmergenciaOverlayProps) {
  const acaoRef = useRef<HTMLButtonElement>(null)
  const aberto = isSubmitting || Boolean(error)

  useEffect(() => {
    if (aberto) acaoRef.current?.focus()
  }, [aberto, error])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergencia-titulo"
        className="flex w-full max-w-[400px] flex-col items-center gap-3 rounded-[20px] border-[3px] border-emergencia bg-slate-800 p-6 text-center text-slate-50"
      >
        <OctagonAlert aria-hidden="true" className="h-11 w-11 text-emergencia" />
        <h2 id="emergencia-titulo" className="text-xl font-bold">
          {error ? 'Não foi possível enviar' : 'Enviando sua solicitação'}
        </h2>

        <div aria-live="assertive" className="w-full">
          {error ? (
            <p className="flex items-center gap-2 rounded-xl border-2 border-amber-700 bg-white p-3 text-left text-slate-900">
              <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
              {error}
            </p>
          ) : (
            <p className="text-slate-300">Obtendo sua localização e enviando o chamado…</p>
          )}
        </div>

        <button
          ref={acaoRef}
          type="button"
          onClick={onRetry}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-white bg-emergencia px-4 text-lg font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 disabled:cursor-wait"
        >
          {isSubmitting && (
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white motion-reduce:animate-none"
            />
          )}
          {isSubmitting ? 'Enviando…' : 'Tentar novamente'}
        </button>

        {/* O envio em andamento não pode ser abortado, então "Cancelar" só aparece após falha */}
        {error && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 w-full rounded-xl font-semibold text-slate-300 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

export default EmergenciaOverlay
