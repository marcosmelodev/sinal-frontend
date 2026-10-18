import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import EmergenciaOverlay from '../components/chamados/EmergenciaOverlay'
import { ICONES } from '../features/chamados/icones'
import { OCORRENCIAS, OCORRENCIA_OUTRO } from '../features/chamados/ocorrenciasData'
import type { Ocorrencia } from '../features/chamados/ocorrenciasData'
import { ORGAOS, isTipoChamado } from '../features/chamados/orgaos'
import { useChamados } from '../hooks/useChamados'

const ITEM_CLASSES =
  'relative flex gap-2 rounded-xl border-2 border-l-8 border-slate-400 bg-white p-3 text-left font-semibold text-slate-900 [overflow-wrap:anywhere] active:scale-[0.97] active:border-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-primario'

function OcorrenciasPage() {
  const { orgaoId } = useParams()
  const navigate = useNavigate()
  const { dispararEmergencia, isSubmitting, error, limparErro } = useChamados()
  const [selecionada, setSelecionada] = useState<Ocorrencia | null>(null)

  if (!isTipoChamado(orgaoId)) return <Navigate to="/" replace />

  const orgao = ORGAOS[orgaoId]
  const outro = OCORRENCIA_OUTRO[orgaoId]

  async function handleConfirmar() {
    if (!selecionada || !isTipoChamado(orgaoId)) return
    const chamado = await dispararEmergencia(false, {
      orgao: orgaoId,
      ocorrenciaId: selecionada.id,
    })
    if (chamado) navigate('/historico')
  }

  function handleCancelar() {
    setSelecionada(null)
    limparErro()
  }

  function renderIcone(ocorrencia: Ocorrencia, cor: string) {
    const Icone = ICONES[ocorrencia.icone]
    return (
      <span className={`grid h-10 w-10 flex-none place-items-center rounded-[10px] text-white ${cor}`}>
        <Icone aria-hidden="true" className="h-6 w-6" />
      </span>
    )
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
      <header className={`flex flex-col gap-3 px-5 pb-10 pt-3 text-white ${orgao.cor}`}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="-ml-2 flex min-h-11 items-center gap-1 self-start rounded-lg px-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft aria-hidden="true" className="h-6 w-6" />
          Voltar
        </button>
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 flex-none place-items-center rounded-[10px] bg-white/20">
            <orgao.Icon aria-hidden="true" className="h-10 w-10" />
          </span>
          <div>
            <h1 className="text-[22px] font-bold">{orgao.nomeCompleto}</h1>
            <p className="text-sm">{orgao.subtitulo}</p>
          </div>
        </div>
      </header>

      <section className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
        <h2 className="text-xl font-bold">O que está acontecendo?</h2>

        <div className="grid grid-cols-2 gap-4">
          {OCORRENCIAS[orgaoId].map((ocorrencia) => (
            <button
              key={ocorrencia.id}
              type="button"
              onClick={() => setSelecionada(ocorrencia)}
              className={`${ITEM_CLASSES} ${orgao.borda} min-h-[88px] flex-col items-start`}
            >
              {renderIcone(ocorrencia, orgao.cor)}
              {ocorrencia.titulo}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSelecionada(outro)}
            className={`${ITEM_CLASSES} col-span-2 min-h-16 flex-row items-center border-l-neutro`}
          >
            {renderIcone(outro, 'bg-neutro')}
            {outro.titulo}
          </button>
        </div>
      </section>

      <EmergenciaOverlay
        aberto={selecionada !== null}
        destino={selecionada ? `${orgao.nome} — ${selecionada.titulo}` : undefined}
        isSubmitting={isSubmitting}
        error={error}
        onConfirm={handleConfirmar}
        onCancel={handleCancelar}
      />
    </main>
  )
}

export default OcorrenciasPage
