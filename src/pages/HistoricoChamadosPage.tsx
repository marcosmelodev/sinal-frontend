import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { orgaoDoTipo } from '../features/chamados/orgaos'
import { useChamados } from '../hooks/useChamados'

function formatarData(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(',', '')
}

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
          <p className="text-sm text-slate-600">Nenhuma solicitação ainda.</p>
        )}

        {chamados.length > 0 && (
          <ul>
            {chamados.map((chamado) => {
              const { nome, Icon, cor } = orgaoDoTipo(chamado.tipo)
              return (
                <li
                  key={chamado.id}
                  className="flex min-h-16 items-center gap-3 border-b border-slate-200 py-3"
                >
                  <span className={`grid h-10 w-10 flex-none place-items-center rounded-[10px] text-white ${cor}`}>
                    <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                  </span>
                  <span className="min-w-0">
                    <b className="block">{nome}</b>
                    {chamado.descricao && (
                      <small className="block text-sm text-slate-600">{chamado.descricao}</small>
                    )}
                    <small className="block text-sm text-slate-600">
                      {formatarData(chamado.criadoEm)}
                    </small>
                  </span>
                  <span className="ml-auto text-right text-sm font-semibold text-primario">
                    {chamado.status}
                  </span>
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
