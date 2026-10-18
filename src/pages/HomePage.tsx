import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import EmergenciaOverlay from '../components/chamados/EmergenciaOverlay'
import { EMERGENCIA_IMEDIATA, ORGAOS } from '../features/chamados/orgaos'
import type { TipoChamado } from '../features/chamados/orgaos'
import { useChamados } from '../hooks/useChamados'
import logo from '../assets/logo.svg'

type Disparo = { imediata: true } | { imediata: false; tipo: TipoChamado }

function HomePage() {
  const navigate = useNavigate()
  const { dispararEmergencia, isSubmitting, error, limparErro } = useChamados()
  const ultimoDisparo = useRef<Disparo | null>(null)

  async function disparar(disparo: Disparo) {
    ultimoDisparo.current = disparo
    const chamado = disparo.imediata
      ? await dispararEmergencia(true)
      : await dispararEmergencia(false, { tipo: disparo.tipo })
    if (chamado) navigate('/historico')
  }

  function handleEmergenciaGeral() {
    disparar({ imediata: true })
  }

  function handleChamadoPadrao(tipo: TipoChamado) {
    disparar({ imediata: false, tipo })
  }

  function handleRetry() {
    if (ultimoDisparo.current) disparar(ultimoDisparo.current)
  }

  const { Icon: IconeImediata } = EMERGENCIA_IMEDIATA

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-5 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-[0.14em]">
          <img src={logo} alt="" className="h-7 w-7 invert" />
          SINAL
        </div>
        <button
          type="button"
          aria-label="Configurações"
          className="flex h-12 w-12 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Settings aria-hidden="true" className="h-7 w-7" />
        </button>
      </div>

      <div>
        <h1 className="text-[22px] font-bold">
          Olá <span aria-hidden="true">👋</span>
        </h1>
        <p className="text-slate-300">Como podemos te ajudar?</p>
      </div>

      <button
        type="button"
        onClick={handleEmergenciaGeral}
        disabled={isSubmitting}
        className="flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border-[3px] border-white bg-emergencia px-4 py-3 font-bold leading-tight text-white active:scale-[0.98] active:brightness-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <span className="flex items-center gap-2 text-[21px]">
          <IconeImediata aria-hidden="true" className="h-8 w-8" />
          EMERGÊNCIA IMEDIATA
        </span>
        <small className="text-sm font-medium">{EMERGENCIA_IMEDIATA.descricao}</small>
      </button>

      <div className="grid auto-rows-fr grid-cols-2 gap-3">
        {(Object.keys(ORGAOS) as TipoChamado[]).map((tipo) => {
          const { nome, descricao, Icon, cor } = ORGAOS[tipo]
          return (
            <button
              key={tipo}
              type="button"
              onClick={() => handleChamadoPadrao(tipo)}
              disabled={isSubmitting}
              className={`flex min-h-[150px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-white/40 px-2 py-4 text-center text-white active:scale-[0.97] active:brightness-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${cor}`}
            >
              <Icon aria-hidden="true" className="h-11 w-11" />
              <b className="text-[19px] leading-tight">{nome}</b>
              <span className="text-sm font-semibold">{descricao}</span>
            </button>
          )
        })}
      </div>

      <EmergenciaOverlay
        isSubmitting={isSubmitting}
        error={error}
        onCancel={limparErro}
        onRetry={handleRetry}
      />
    </main>
  )
}

export default HomePage
