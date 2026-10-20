import { Suspense, lazy, useState } from 'react'
import { Check, Video } from 'lucide-react'
import { formatarDuracao } from '../../utils/formatters'

// Carregado só ao abrir a chamada: mantém o bundle inicial do app enxuto
const VideochamadaLibrasModal = lazy(() => import('./VideochamadaLibrasModal'))

/** Exibido enquanto o código da videochamada é baixado */
function CarregandoVideochamada() {
  return (
    <div role="status" className="fixed inset-0 z-50 grid place-items-center bg-[#121933] text-white">
      <p className="flex items-center gap-3 text-lg font-semibold">
        <span
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/30 border-t-white motion-reduce:animate-none"
        />
        Abrindo atendimento em LIBRAS…
      </p>
    </div>
  )
}

interface AtendimentoLibrasAcessoProps {
  nomeOrgao?: string
  /**
   * Se o chamado ainda está ativo (`CRIADO` ou `ENCAMINHADO_SIMULADO`).
   * Encerrado, o botão some; uma chamada já aberta não é interrompida.
   */
  disponivel: boolean
}

/**
 * Ponto de acesso à videochamada em LIBRAS (telas de confirmação e acompanhamento):
 * botão de destaque, modal da chamada e aviso discreto após o encerramento.
 */
function AtendimentoLibrasAcesso({ nomeOrgao, disponivel }: AtendimentoLibrasAcessoProps) {
  const [aberto, setAberto] = useState(false)
  const [duracaoUltima, setDuracaoUltima] = useState<number | null>(null)

  function handleEncerrar(duracao: number) {
    setAberto(false)
    setDuracaoUltima(duracao)
  }

  // Chamado encerrado, sem chamada aberta nem aviso a mostrar: nada a renderizar
  if (!disponivel && !aberto && duracaoUltima === null) return null

  return (
    <div className="flex w-full flex-col gap-2">
      {disponivel && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 border-white/80 bg-violet-700 px-4 py-3 text-left text-white shadow-lg hover:bg-violet-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#121933]"
        >
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/15">
            <Video aria-hidden="true" className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight">Atendimento em LIBRAS (Videochamada)</span>
            <span className="block text-sm text-white">Intérprete de plantão 24h</span>
          </span>
        </button>
      )}

      <div role="status">
        {duracaoUltima !== null && !aberto && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-300/60 px-3 py-2 text-sm text-slate-200">
            <Check aria-hidden="true" className="h-4 w-4 flex-none text-emerald-300" />
            Atendimento por vídeo em LIBRAS registrado na simulação ({formatarDuracao(duracaoUltima)}).
          </p>
        )}
      </div>

      {aberto && (
        <Suspense fallback={<CarregandoVideochamada />}>
          <VideochamadaLibrasModal nomeOrgao={nomeOrgao} onEncerrar={handleEncerrar} />
        </Suspense>
      )}
    </div>
  )
}

export default AtendimentoLibrasAcesso
