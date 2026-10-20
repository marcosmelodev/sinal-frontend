import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Send, X } from 'lucide-react'

export interface MensagemChat {
  id: number
  /** 'sistema': aviso do app (ex.: central indisponível), não uma fala da central */
  autor: 'voce' | 'central' | 'sistema'
  texto: string
}

interface ChatApoioProps {
  mensagens: MensagemChat[]
  /** Central "digitando" a resposta simulada */
  centralDigitando: boolean
  onEnviar: (texto: string) => void
  onFechar: () => void
}

const ROTULO_AUTOR: Record<MensagemChat['autor'], string> = {
  voce: 'Você',
  central: 'Central LIBRAS',
  sistema: 'Aviso',
}

const ESTILO_AUTOR: Record<MensagemChat['autor'], string> = {
  voce: 'self-end rounded-br-sm bg-blue-800 text-white',
  central: 'self-start rounded-bl-sm bg-slate-100 text-slate-900',
  sistema: 'self-stretch border-2 border-amber-700 bg-amber-50 text-slate-900',
}

const MENSAGENS_RAPIDAS = [
  'Não consigo falar',
  'Estou escondido',
  'Preciso de ambulância urgente',
  'Há uma pessoa ferida',
  'Estou em local seguro',
]

/** Painel compacto de mensagens rápidas durante a videochamada */
function ChatApoio({ mensagens, centralDigitando, onEnviar, onFechar }: ChatApoioProps) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const primeiroChipRef = useRef<HTMLButtonElement>(null)
  const fimRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    primeiroChipRef.current?.focus()
  }, [])

  // Mantém a mensagem mais recente visível
  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensagens.length, centralDigitando])

  function enviarDigitada(e: FormEvent) {
    e.preventDefault()
    const limpo = texto.trim()
    if (!limpo) return
    onEnviar(limpo)
    setTexto('')
  }

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="flex max-h-[55vh] flex-col gap-2 rounded-2xl border-t-4 border-primario bg-white p-3 text-slate-900 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <h2 id={`${id}-titulo`} className="font-bold">
          Chat de apoio com a Central LIBRAS
        </h2>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar chat"
          className="grid min-h-[48px] min-w-[48px] place-items-center rounded-xl text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <ul role="log" aria-live="polite" aria-label="Mensagens" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {mensagens.length === 0 && (
          <li className="text-sm text-slate-600">Toque numa mensagem rápida ou escreva abaixo.</li>
        )}
        {mensagens.map((m) => (
          <li
            key={m.id}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 ${ESTILO_AUTOR[m.autor]}`}
          >
            <span className="block text-xs font-semibold opacity-90">
              {ROTULO_AUTOR[m.autor]}
            </span>
            {m.texto}
          </li>
        ))}
        {centralDigitando && (
          <li className="flex items-center gap-2 self-start text-sm italic text-slate-600">
            <span aria-hidden="true" className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 motion-reduce:animate-none" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:150ms] motion-reduce:animate-none" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:300ms] motion-reduce:animate-none" />
            </span>
            Atendente LIBRAS está respondendo...
          </li>
        )}
        <li ref={fimRef} aria-hidden="true" />
      </ul>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Mensagens rápidas">
        {MENSAGENS_RAPIDAS.map((rapida, i) => (
          <button
            key={rapida}
            ref={i === 0 ? primeiroChipRef : undefined}
            type="button"
            onClick={() => onEnviar(rapida)}
            className="min-h-[48px] rounded-full border-2 border-primario px-3 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 active:bg-slate-100"
          >
            {rapida}
          </button>
        ))}
      </div>

      <form onSubmit={enviarDigitada} className="flex gap-2">
        <label htmlFor={`${id}-texto`} className="sr-only">
          Mensagem curta
        </label>
        <input
          id={`${id}-texto`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={120}
          placeholder="Escreva uma mensagem curta"
          className="min-h-[48px] min-w-0 flex-1 rounded-xl border-2 border-gray-500 px-3 text-base focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          aria-label="Enviar mensagem"
          disabled={!texto.trim()}
          className="grid min-h-[48px] min-w-[48px] place-items-center rounded-xl bg-primario text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-50"
        >
          <Send aria-hidden="true" className="h-5 w-5" />
        </button>
      </form>
    </section>
  )
}

export default ChatApoio
