import { Navigate, useNavigate, useParams } from 'react-router-dom'
import OrgaoHeader from '../components/chamados/OrgaoHeader'
import { ICONES } from '../features/chamados/icones'
import { OCORRENCIAS, OCORRENCIA_OUTRO } from '../features/chamados/ocorrenciasData'
import type { Ocorrencia } from '../features/chamados/ocorrenciasData'
import { ORGAOS, isTipoChamado } from '../features/chamados/orgaos'
import type { ResumoChamadoState } from './ResumoChamadoPage'

const ITEM_CLASSES =
  'relative flex gap-2 rounded-xl border-2 border-l-8 border-slate-400 bg-white p-3 text-left font-semibold text-slate-900 [overflow-wrap:anywhere] active:scale-[0.97] active:border-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-primario'

function OcorrenciasPage() {
  const { orgaoId } = useParams()
  const navigate = useNavigate()

  if (!isTipoChamado(orgaoId)) return <Navigate to="/" replace />

  const orgao = ORGAOS[orgaoId]
  const outro = OCORRENCIA_OUTRO[orgaoId]

  function selecionar(ocorrencia: Ocorrencia) {
    if (!isTipoChamado(orgaoId)) return
    const state: ResumoChamadoState = {
      orgao: orgaoId,
      ocorrenciaId: ocorrencia.id,
      tituloOcorrencia: ocorrencia.titulo,
    }
    navigate('/resumo', { state })
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
      <OrgaoHeader orgao={orgao} onVoltar={() => navigate('/')} />

      <section className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
        <h2 className="text-xl font-bold">O que está acontecendo?</h2>

        <div className="grid grid-cols-2 gap-4">
          {OCORRENCIAS[orgaoId].map((ocorrencia) => (
            <button
              key={ocorrencia.id}
              type="button"
              onClick={() => selecionar(ocorrencia)}
              className={`${ITEM_CLASSES} ${orgao.borda} min-h-[88px] flex-col items-start`}
            >
              {renderIcone(ocorrencia, orgao.cor)}
              {ocorrencia.titulo}
            </button>
          ))}

          <button
            type="button"
            onClick={() => selecionar(outro)}
            className={`${ITEM_CLASSES} col-span-2 min-h-16 flex-row items-center border-l-neutro`}
          >
            {renderIcone(outro, 'bg-neutro')}
            {outro.titulo}
          </button>
        </div>
      </section>
    </main>
  )
}

export default OcorrenciasPage
