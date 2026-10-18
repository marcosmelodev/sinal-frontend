import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Share2, Users } from 'lucide-react'
import { useContatos } from '../../hooks/useContatos'

interface CompartilharContatoOverlayProps {
  onClose: () => void
}

const CAMPO_CLASSES =
  'w-full rounded-md border-2 border-gray-500 bg-white p-3 text-lg text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1'

/** Montado apenas enquanto aberto, para que cada abertura comece com o formulário limpo */
function CompartilharContatoOverlay({ onClose }: CompartilharContatoOverlayProps) {
  const { contatos, loading, error, carregarContatos } = useContatos()
  const [contatoId, setContatoId] = useState('')
  const [mensagem, setMensagem] = useState('')
  const selectRef = useRef<HTMLSelectElement>(null)
  const id = useId()

  useEffect(() => {
    carregarContatos().then(() => selectRef.current?.focus())
  }, [carregarContatos])

  function handleCompartilhar() {
    onClose()
    alert('Integração de partilha futura')
  }

  const semContatos = !loading && !error && contatos.length === 0

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        className="flex w-full max-w-[400px] flex-col gap-4 rounded-[20px] border-t-4 border-sucesso bg-white p-6 text-slate-900"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-[10px] bg-sucesso text-white">
            <Users aria-hidden="true" className="h-7 w-7" />
          </span>
          <div>
            <h2 id={`${id}-titulo`} className="text-xl font-bold">
              Avisar contato
            </h2>
            <p className="text-sm text-slate-600">
              Avise uma pessoa de confiança que você precisa de ajuda.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border-2 border-amber-700 p-3">
            {error}
          </p>
        )}

        {semContatos ? (
          <p className="rounded-xl bg-slate-50 p-3">
            Você ainda não tem contatos de confiança.{' '}
            <Link to="/contatos" onClick={onClose} className="font-bold text-primario underline">
              Cadastrar contato
            </Link>
          </p>
        ) : (
          <label className="flex flex-col gap-1 text-lg font-semibold">
            Selecione o contato
            <select
              ref={selectRef}
              value={contatoId}
              onChange={(e) => setContatoId(e.target.value)}
              disabled={loading}
              className={`${CAMPO_CLASSES} font-normal`}
            >
              <option value="">{loading ? 'Carregando contatos…' : 'Selecione…'}</option>
              {contatos.map((contato) => (
                <option key={contato.id} value={contato.id}>
                  {contato.nome} — {contato.telefone}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-lg font-semibold">
          Mensagem (opcional)
          <textarea
            rows={3}
            maxLength={120}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Ex.: Preciso de ajuda."
            className={`${CAMPO_CLASSES} font-normal`}
          />
        </label>

        <button
          type="button"
          onClick={handleCompartilhar}
          disabled={!contatoId}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-md bg-sucesso px-6 text-lg font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 aria-hidden="true" className="h-5 w-5" />
          Compartilhar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-md font-semibold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default CompartilharContatoOverlay
