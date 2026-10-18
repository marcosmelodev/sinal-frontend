import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Check } from 'lucide-react'
import Button from '../components/ui/Button'
import LinhaResumo from '../components/chamados/LinhaResumo'
import type { Chamado, Localizacao } from '../features/chamados/ChamadosService'
import { buscarOcorrencia } from '../features/chamados/ocorrenciasData'
import { isTipoChamado, orgaoDoTipo } from '../features/chamados/orgaos'
import { codigoSimulacao } from '../features/chamados/status'
import { useChamados } from '../hooks/useChamados'
import { formatarCoordenadas, formatarData, parseId } from '../utils/formatters'
import { mensagemDeErro } from '../utils/problemDetails'

export interface SolicitacaoRegistradaState {
  chamado: Chamado
  tituloOcorrencia?: string
  /** Localização enviada, caso a resposta da API não a devolva */
  localizacaoEnviada?: Localizacao
}

function isRegistradaState(state: unknown): state is SolicitacaoRegistradaState {
  const s = state as Partial<SolicitacaoRegistradaState> | null
  return !!s && typeof s.chamado?.id === 'number'
}

function SolicitacaoRegistadaPage() {
  const navigate = useNavigate()
  const id = parseId(useParams().id)
  const { state } = useLocation()
  const doRouter = isRegistradaState(state) && state.chamado.id === id ? state : null
  const { buscarChamadoPorId } = useChamados()
  // Sem state (ex.: link aberto direto), busca o chamado na API
  const [chamado, setChamado] = useState<Chamado | null>(doRouter?.chamado ?? null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (id === null || chamado) return
    buscarChamadoPorId(id)
      .then(setChamado)
      .catch((err) => setErro(mensagemDeErro(err)))
  }, [id, chamado, buscarChamadoPorId])

  if (id === null) return <Navigate to="/" replace />

  const orgao = chamado ? orgaoDoTipo(chamado.orgao) : null
  const tituloOcorrencia =
    doRouter?.tituloOcorrencia ??
    chamado?.ocorrenciaNome ??
    (chamado && isTipoChamado(chamado.orgao)
      ? buscarOcorrencia(chamado.orgao, chamado.ocorrenciaId)?.titulo
      : undefined)
  const localizacao = chamado?.localizacao ?? doRouter?.localizacaoEnviada

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col items-center gap-4 px-5 pb-6 pt-4">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-sucesso">
          <Check aria-hidden="true" className="h-10 w-10 text-white" strokeWidth={3} />
        </span>
        <h1 className="text-[22px] font-bold">Solicitação registrada</h1>
        {orgao && <p className="text-slate-300">{orgao.nomeCompleto}</p>}
        <p className="rounded-lg border border-neutro px-2 py-0.5 text-sm text-slate-300">
          Protótipo acadêmico — nenhuma central real foi acionada.
        </p>
      </div>

      {erro && (
        <p role="alert" className="flex w-full items-center gap-2 rounded-xl border-2 border-amber-700 bg-white p-3 text-slate-900">
          <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
          {erro}
        </p>
      )}

      {chamado && orgao && (
        <section className="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 text-slate-900">
          <h2 className="font-bold">Você solicitou:</h2>
          <dl>
            <LinhaResumo rotulo="Órgão" valor={orgao.nomeCompleto} />
            <LinhaResumo rotulo="Ocorrência" valor={tituloOcorrencia ?? '—'} />
            <LinhaResumo
              rotulo="Localização"
              valor={
                localizacao
                  ? `${formatarCoordenadas(localizacao)}${chamado.baixaPrecisao ? ' (baixa precisão)' : ''}`
                  : 'Enviada'
              }
            />
            <LinhaResumo rotulo="Horário" valor={formatarData(chamado.dataCriacao)} />
            <LinhaResumo rotulo="Código da simulação" valor={codigoSimulacao(chamado)} />
          </dl>
        </section>
      )}

      <div className="mt-auto flex w-full flex-col gap-1">
        <Button
          onClick={() =>
            navigate(`/chamado/${id}/acompanhamento`, chamado ? { state: { chamado } } : undefined)
          }
        >
          Ver acompanhamento
        </Button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-12 rounded-md font-semibold text-slate-300 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Voltar para o início
        </button>
      </div>
    </main>
  )
}

export default SolicitacaoRegistadaPage
