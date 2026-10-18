import { useEffect, useRef } from 'react'
import { AlertTriangle, OctagonAlert } from 'lucide-react'

interface EmergenciaOverlayProps {
  aberto: boolean
  /** Nome do destino exibido na confirmação (ex.: "SAMU") */
  destino?: string
  isSubmitting: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Diálogo de confirmação e envio do chamado, baseado no modal de Emergência Imediata da referência.
 * Fluxo: confirmar → enviando → (erro → tentar novamente | cancelar).
 */
function EmergenciaOverlay({
  aberto,
  destino,
  isSubmitting,
  error,
  onConfirm,
  onCancel,
}: EmergenciaOverlayProps) {
  const acaoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (aberto) acaoRef.current?.focus()
  }, [aberto, error])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isSubmitting) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergencia-titulo"
        aria-describedby="emergencia-descricao"
        className="flex w-full max-w-[400px] flex-col items-center gap-3 rounded-[20px] border-[3px] border-emergencia bg-slate-800 p-6 text-center text-slate-50"
      >
        <OctagonAlert aria-hidden="true" className="h-11 w-11 text-red-400" />
        <h2 id="emergencia-titulo" className="text-xl font-bold">
          Confirmar Emergência?
        </h2>
        <p id="emergencia-descricao">Você está em perigo e deseja enviar sua localização?</p>
        {destino && (
          <p className="text-slate-300">
            Destino: <b className="text-slate-50">{destino}</b>
          </p>
        )}

        <div aria-live="assertive" className="w-full">
          {error && (
            <p className="flex items-center gap-2 rounded-xl border-2 border-amber-700 bg-white p-3 text-left text-slate-900">
              <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
              {error}
            </p>
          )}
          {isSubmitting && <span className="sr-only">Enviando chamado</span>}
        </div>

        <button
          ref={acaoRef}
          type="button"
          onClick={onConfirm}
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
          {isSubmitting ? 'Obtendo localização…' : error ? 'TENTAR NOVAMENTE' : 'ENVIAR AGORA'}
        </button>

        {/* Um envio em andamento não pode ser abortado, então "Cancelar" some durante o envio */}
        {!isSubmitting && (
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
