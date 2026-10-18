import { useEffect, useId, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, MapPin } from 'lucide-react'
import Button from '../components/ui/Button'
import EmergenciaOverlay from '../components/chamados/EmergenciaOverlay'
import OrgaoHeader from '../components/chamados/OrgaoHeader'
import type { TipoChamado } from '../features/chamados/ChamadosService'
import { ORGAOS, isTipoChamado } from '../features/chamados/orgaos'
import { useChamados } from '../hooks/useChamados'
import { LocationError, LocationService } from '../services/LocationService'
import type { Coordinates } from '../services/LocationService'

export interface ResumoChamadoState {
  orgao: TipoChamado
  ocorrenciaId: number
  tituloOcorrencia: string
}

type EstadoLocalizacao =
  | { status: 'obtendo' }
  | { status: 'obtida'; coords: Coordinates }
  | { status: 'erro'; mensagem: string }

/** Acima disso (em metros) avisamos que a localização pode estar imprecisa */
const PRECISAO_BAIXA_METROS = 100

async function obterLocalizacao(): Promise<EstadoLocalizacao> {
  try {
    return { status: 'obtida', coords: await LocationService.getCurrentPosition() }
  } catch (err) {
    const mensagem =
      err instanceof LocationError ? err.message : 'Não foi possível obter sua localização.'
    return { status: 'erro', mensagem }
  }
}

function isResumoState(state: unknown): state is ResumoChamadoState {
  const s = state as Partial<ResumoChamadoState> | null
  return (
    !!s &&
    isTipoChamado(s.orgao) &&
    typeof s.ocorrenciaId === 'number' &&
    typeof s.tituloOcorrencia === 'string'
  )
}

function ResumoChamadoPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const valido = isResumoState(state)
  const { dispararEmergencia, isSubmitting, error, limparErro } = useChamados()
  const [localizacao, setLocalizacao] = useState<EstadoLocalizacao>({ status: 'obtendo' })
  const [detalhe, setDetalhe] = useState('')
  const detalheId = useId()

  useEffect(() => {
    if (!valido) return
    let ativo = true
    obterLocalizacao().then((resultado) => ativo && setLocalizacao(resultado))
    return () => {
      ativo = false
    }
  }, [valido])

  if (!valido) return <Navigate to="/" replace />

  const { orgao: orgaoId, ocorrenciaId, tituloOcorrencia } = state
  const orgao = ORGAOS[orgaoId]

  async function handleTentarLocalizacao() {
    setLocalizacao({ status: 'obtendo' })
    setLocalizacao(await obterLocalizacao())
  }

  async function handleEnviar() {
    const chamado = await dispararEmergencia(false, {
      orgao: orgaoId,
      ocorrenciaId,
      descricao: detalhe.trim() || undefined,
      // Envia exatamente a localização exibida; sem ela, o chamado segue mesmo assim
      localizacao: localizacao.status === 'obtida' ? localizacao.coords : undefined,
    })
    if (chamado) navigate('/historico')
  }

  const coords = localizacao.status === 'obtida' ? localizacao.coords : null
  const precisaoBaixa = coords !== null && coords.precisao > PRECISAO_BAIXA_METROS

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
      <OrgaoHeader orgao={orgao} onVoltar={() => navigate(`/ocorrencias/${orgaoId}`)} />

      <section className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
        <h2 className="text-xl font-bold">Resumo</h2>

        <dl className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 px-3">
          <div className="flex justify-between gap-2 border-b border-slate-200 py-2">
            <dt className="text-slate-600">Órgão</dt>
            <dd className="text-right font-bold">{orgao.nomeCompleto}</dd>
          </div>
          <div className="flex justify-between gap-2 py-2">
            <dt className="text-slate-600">Ocorrência</dt>
            <dd className="text-right font-bold">{tituloOcorrencia}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Localização</h3>
          <div className="overflow-hidden rounded-xl border border-slate-300">
            <div className="grid h-32 place-items-center bg-slate-200">
              <MapPin
                aria-hidden="true"
                className={`h-10 w-10 ${coords ? 'text-primario' : 'text-slate-400'}`}
              />
            </div>
            <p className="bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {coords
                ? `Latitude: ${coords.latitude.toFixed(5)} · Longitude: ${coords.longitude.toFixed(5)} · Precisão: ${Math.round(coords.precisao)} metros`
                : 'Coordenadas indisponíveis'}
            </p>
          </div>

          <div role="status" aria-live="polite">
            {localizacao.status === 'obtendo' && (
              <p className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-slate-400 px-3 py-2">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 flex-none animate-spin rounded-full border-[3px] border-slate-400 border-t-slate-900 motion-reduce:animate-none"
                />
                Obtendo localização…
              </p>
            )}
            {coords && !precisaoBaixa && (
              <p className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-sucesso px-3 py-2">
                <Check aria-hidden="true" className="h-6 w-6 flex-none text-sucesso" />
                Localização obtida
              </p>
            )}
            {precisaoBaixa && (
              <p className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-amber-700 px-3 py-2">
                <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
                Localização com baixa precisão. Pode estar imprecisa.
              </p>
            )}
            {localizacao.status === 'erro' && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-amber-700 px-3 py-2">
                <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
                <span className="flex-1">
                  {localizacao.mensagem} O pedido pode ser enviado sem localização.
                </span>
                <button
                  type="button"
                  onClick={handleTentarLocalizacao}
                  className="min-h-11 rounded-xl border-2 border-primario px-4 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={detalheId} className="text-lg font-semibold">
            Detalhe adicional (opcional)
          </label>
          <textarea
            id={detalheId}
            rows={2}
            maxLength={120}
            value={detalhe}
            onChange={(e) => setDetalhe(e.target.value)}
            placeholder="Ex.: perto do portão azul"
            className="w-full rounded-md border-2 border-gray-500 p-3 text-lg text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
          />
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-2">
          <Button
            onClick={handleEnviar}
            disabled={localizacao.status === 'obtendo' || isSubmitting}
            aria-describedby={localizacao.status === 'obtendo' ? `${detalheId}-dica` : undefined}
          >
            Enviar mensagem
          </Button>
          {localizacao.status === 'obtendo' && (
            <p id={`${detalheId}-dica`} className="text-sm text-slate-600">
              Disponível quando a localização for obtida.
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="min-h-12 rounded-md font-semibold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
          >
            Cancelar
          </button>
        </div>
      </section>

      <EmergenciaOverlay
        aberto={isSubmitting || error !== null}
        confirmacao={false}
        destino={`${orgao.nome} — ${tituloOcorrencia}`}
        isSubmitting={isSubmitting}
        error={error}
        onConfirm={handleEnviar}
        onCancel={limparErro}
      />
    </main>
  )
}

export default ResumoChamadoPage
