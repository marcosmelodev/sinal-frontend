import { useEffect, useId, useRef } from 'react'
import type { CanalCompartilhamento } from '../../features/contatos/compartilhamento'

interface CompartilharViaSheetProps {
  /** Prévia do texto que será enviado */
  previa: string
  onEscolher: (canal: CanalCompartilhamento) => void
  onCancel: () => void
}

const CANAIS: ReadonlyArray<{ canal: CanalCompartilhamento; rotulo: string }> = [
  { canal: 'sms', rotulo: 'SMS' },
  { canal: 'whatsapp', rotulo: 'WhatsApp' },
  { canal: 'telegram', rotulo: 'Telegram' },
]

/** Gaveta inferior "Compartilhar via...", como no protótipo (simula a folha de compartilhamento nativa) */
function CompartilharViaSheet({ previa, onEscolher, onCancel }: CompartilharViaSheetProps) {
  const id = useId()
  const primeiroRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    primeiroRef.current?.focus()
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-previa`}
      onKeyDown={(e) => {
        // Esc fecha só a gaveta, sem fechar o modal de trás
        if (e.key === 'Escape') {
          e.stopPropagation()
          onCancel()
        }
      }}
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-w-[640px] flex-col gap-2 rounded-t-[20px] border-t-4 border-primario bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-slate-900 shadow-2xl"
    >
      <h3 id={`${id}-titulo`} className="font-bold">
        Compartilhar via... (simulação do compartilhamento nativo)
      </h3>
      <p id={`${id}-previa`} className="line-clamp-3 whitespace-pre-line text-sm text-slate-600">
        {previa}
      </p>

      {CANAIS.map(({ canal, rotulo }, i) => (
        <button
          key={canal}
          ref={i === 0 ? primeiroRef : undefined}
          type="button"
          onClick={() => onEscolher(canal)}
          className="min-h-12 w-full rounded-xl border-2 border-primario px-4 text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 active:bg-slate-100"
        >
          {rotulo}
        </button>
      ))}

      <button
        type="button"
        onClick={onCancel}
        className="mx-auto min-h-12 rounded-md px-4 font-semibold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
      >
        Cancelar
      </button>
    </div>
  )
}

export default CompartilharViaSheet
