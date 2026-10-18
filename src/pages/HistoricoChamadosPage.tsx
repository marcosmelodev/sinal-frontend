import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Inbox } from 'lucide-react'
import { buscarOcorrencia } from '../features/chamados/ocorrenciasData'
import { isTipoChamado, orgaoDoTipo } from '../features/chamados/orgaos'
import { isEncerrado, tituloStatus } from '../features/chamados/status'
import { useChamados } from '../hooks/useChamados'
import { formatarData } from '../utils/formatters'

function HistoricoChamadosPage() {
  const { listarHistorico, historico, carregandoHistorico, erroHistorico } = useChamados()

  useEffect(() => {
    listarHistorico()
  }, [listarHistorico])

  const chamados = historico?.content ?? []

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
      <header className="px-5 pb-9 pt-5 text-center">
        <h1 className="text-[22px] font-bold">Histórico</h1>
      </header>

      <section className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
        {carregandoHistorico && !historico && (
          <p role="status" className="flex items-center gap-2 text-slate-600">
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-[3px] border-slate-400 border-t-slate-900 motion-reduce:animate-none"
            />
            Carregando histórico…
          </p>
        )}

        {erroHistorico && (
          <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-amber-700 p-3">
            <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
            <span className="flex-1">{erroHistorico}</span>
            <button
              type="button"
              onClick={() => listarHistorico()}
              className="min-h-11 rounded-xl border-2 border-primario px-4 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {historico && chamados.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
            <Inbox aria-hidden="true" className="h-20 w-20 text-slate-300" strokeWidth={1.5} />
            <p className="text-lg font-semibold text-slate-600">Nenhuma solicitação ainda.</p>
          </div>
        )}

        {chamados.length > 0 && (
          <ul>
            {chamados.map((chamado) => {
              const { nome, Icon, cor } = orgaoDoTipo(chamado.orgao)
              const ocorrencia = isTipoChamado(chamado.orgao)
                ? buscarOcorrencia(chamado.orgao, chamado.ocorrenciaId)
                : undefined
              const detalhe = ocorrencia?.titulo ?? chamado.descricao
              return (
                <li key={chamado.id} className="border-b border-slate-200">
                  <Link
                    to={`/chamado/${chamado.id}/acompanhamento`}
                    state={{ chamado }}
                    className="flex min-h-16 items-center gap-3 py-3 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primario active:bg-slate-100"
                  >
                    <span className={`grid h-10 w-10 flex-none place-items-center rounded-[10px] text-white ${cor}`}>
                      <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                    </span>
                    <span className="min-w-0">
                      <b className="block">{nome}</b>
                      {detalhe && <small className="block text-sm text-slate-600">{detalhe}</small>}
                      <small className="block text-sm text-slate-600">
                        {formatarData(chamado.criadoEm)}
                      </small>
                    </span>
                    <span
                      className={`ml-auto max-w-[45%] text-right text-sm font-semibold ${
                        isEncerrado(chamado.status) ? 'text-neutro' : 'text-primario'
                      }`}
                    >
                      {tituloStatus(chamado.status)}
                      <span className="mt-0.5 block text-primario">Ver acompanhamento ›</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

export default HistoricoChamadosPage
