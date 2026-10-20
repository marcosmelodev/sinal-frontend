import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Check, Info } from 'lucide-react'
import Button from '../components/ui/Button'
import AtendimentoLibrasAcesso from '../components/chamados/AtendimentoLibrasAcesso'
import LinhaResumo from '../components/chamados/LinhaResumo'
import type { Chamado } from '../features/chamados/ChamadosService'
import { orgaoDoTipo } from '../features/chamados/orgaos'
import {
  ETAPAS_STATUS,
  codigoSimulacao,
  indiceStatus,
  isEncerrado,
  tituloStatus,
} from '../features/chamados/status'
import { useChamados } from '../hooks/useChamados'
import { parseId } from '../utils/formatters'
import { isProblemDetails, mensagemDeErro } from '../utils/problemDetails'

const INTERVALO_POLLING_MS = 5000

function AcompanhamentoChamadoPage() {
  const navigate = useNavigate()
  const id = parseId(useParams().id)
  const { state } = useLocation()
  const { buscarChamadoPorId } = useChamados()

  // Usa o chamado vindo da tela anterior para exibir algo imediatamente
  const inicial = (state as { chamado?: Chamado } | null)?.chamado
  const [chamado, setChamado] = useState<Chamado | null>(inicial?.id === id ? inicial : null)
  const [erro, setErro] = useState<string | null>(null)
  // Erros 4xx (ex.: chamado inexistente) não se resolvem sozinhos: param o polling
  const [falhaDefinitiva, setFalhaDefinitiva] = useState(false)

  const encerrado = chamado ? isEncerrado(chamado.estado) : false

  useEffect(() => {
    if (id === null || encerrado || falhaDefinitiva) return
    const chamadoId = id
    let ativo = true
    let emVoo = false

    async function atualizar() {
      // Evita requisições sobrepostas e economiza bateria com a aba em segundo plano
      if (emVoo || document.visibilityState === 'hidden') return
      emVoo = true
      try {
        const atual = await buscarChamadoPorId(chamadoId)
        if (!ativo) return
        setChamado(atual)
        setErro(null)
      } catch (err) {
        if (!ativo) return
        setErro(mensagemDeErro(err))
        if (isProblemDetails(err) && err.status >= 400 && err.status < 500) {
          setFalhaDefinitiva(true)
        }
      } finally {
        emVoo = false
      }
    }

    atualizar()
    const timer = setInterval(atualizar, INTERVALO_POLLING_MS)
    return () => {
      ativo = false
      clearInterval(timer)
    }
  }, [id, encerrado, falhaDefinitiva, buscarChamadoPorId])

  if (id === null) return <Navigate to="/" replace />

  const indiceAtual = chamado ? indiceStatus(chamado.estado) : -1
  const orgao = chamado ? orgaoDoTipo(chamado.orgao) : null

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
      {/* Bloco em fluxo normal (não sticky/fixed) para nunca cobrir o título ou os alertas */}
      <p className="flex items-center gap-2 border-b-[3px] border-white bg-neutro px-5 py-3 font-semibold text-white">
        <Info aria-hidden="true" className="h-6 w-6 flex-none" />
        PROTÓTIPO ACADÊMICO — Nenhuma central real foi acionada.
      </p>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-4">
        <h1 className="text-[22px] font-bold">Acompanhamento</h1>

        {erro && (
          <p role="alert" className="flex items-center gap-2 rounded-xl border-2 border-amber-700 bg-white p-3 text-slate-900">
            <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
            {erro}
          </p>
        )}

        {!chamado && !erro && (
          <p role="status" className="flex items-center gap-2 text-slate-300">
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-[3px] border-slate-500 border-t-white motion-reduce:animate-none"
            />
            Carregando acompanhamento…
          </p>
        )}

        {chamado && orgao && (
          <>
            <section className="rounded-2xl bg-white p-4 text-slate-900">
              <h2 className="sr-only">Status</h2>
              <p className="sr-only" aria-live="polite">
                Status atual: {tituloStatus(chamado.estado)}
              </p>
              <ol className="flex flex-col gap-4">
                {ETAPAS_STATUS.map((etapa, i) => {
                  const concluida = i < indiceAtual || (encerrado && i === indiceAtual)
                  const atual = i === indiceAtual && !encerrado
                  return (
                    <li key={etapa.estado} className="flex min-h-11 items-center gap-3 font-semibold">
                      <span
                        aria-hidden="true"
                        className={`grid h-8 w-8 flex-none place-items-center rounded-full border-[3px] ${
                          concluida
                            ? 'border-sucesso bg-sucesso text-white'
                            : atual
                              ? 'border-primario bg-primario text-white'
                              : 'border-slate-400'
                        }`}
                      >
                        {concluida && <Check className="h-4 w-4" strokeWidth={3} />}
                        {atual && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </span>
                      <span className={concluida || atual ? '' : 'text-slate-600'}>
                        {etapa.titulo}
                        <small className="block text-sm font-normal text-slate-600">
                          {concluida ? 'Concluído' : atual ? 'Atual' : 'Aguardando'}
                        </small>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* Videochamada só para chamados ativos (CRIADO / ENCAMINHADO_SIMULADO) */}
            <AtendimentoLibrasAcesso nomeOrgao={orgao.nomeCompleto} disponivel={!encerrado} />

            <section className="rounded-2xl bg-white p-4 text-slate-900">
              <h2 className="sr-only">Resumo</h2>
              <dl>
                <LinhaResumo
                  rotulo="Órgão"
                  valor={
                    chamado.modalidade === 'EMERGENCIA_IMEDIATA'
                      ? `Emergência Imediata → ${orgao.nomeCompleto}`
                      : orgao.nomeCompleto
                  }
                />
                {/* Todo chamado é registrado com localização (obrigatória no back-end) */}
                <LinhaResumo
                  rotulo="Localização"
                  valor={chamado.baixaPrecisao ? 'Enviada · baixa precisão' : 'Enviada'}
                />
                <LinhaResumo rotulo="Código da simulação" valor={codigoSimulacao(chamado)} />
              </dl>
            </section>

            <p className="text-center text-sm text-slate-300">
              {encerrado
                ? 'Acompanhamento encerrado.'
                : falhaDefinitiva
                  ? 'Atualização automática interrompida.'
                  : 'Atualizando automaticamente a cada 5 segundos.'}
            </p>
          </>
        )}

        <div className="mt-auto">
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
      </div>
    </main>
  )
}

export default AcompanhamentoChamadoPage
