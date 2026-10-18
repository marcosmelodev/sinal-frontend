import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Users } from 'lucide-react'
import EmergenciaOverlay from '../components/chamados/EmergenciaOverlay'
import CompartilharContatoOverlay from '../components/contatos/CompartilharContatoOverlay'
import { EMERGENCIA_IMEDIATA, ORGAOS } from '../features/chamados/orgaos'
import type { TipoChamado } from '../features/chamados/ChamadosService'
import { useChamados } from '../hooks/useChamados'
import logo from '../assets/logo.svg'

const CARD_CLASSES =
  'flex min-h-[150px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-white/40 px-2 py-4 text-center text-white active:scale-[0.97] active:brightness-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

function HomePage() {
  const navigate = useNavigate()
  const { dispararEmergencia, isSubmitting, error, limparErro } = useChamados()
  const [confirmandoEmergencia, setConfirmandoEmergencia] = useState(false)
  const [compartilhando, setCompartilhando] = useState(false)

  function handleEmergenciaGeral() {
    setConfirmandoEmergencia(true)
  }

  async function handleConfirmar() {
    const chamado = await dispararEmergencia(true)
    if (chamado) {
      navigate(`/chamado/${chamado.id}/registrado`, {
        state: { chamado, tituloOcorrencia: EMERGENCIA_IMEDIATA.nome },
      })
    }
  }

  function handleCancelar() {
    setConfirmandoEmergencia(false)
    limparErro()
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
          Olá, Marcos <span aria-hidden="true">👋</span>
        </h1>
        <p className="text-slate-300">Como podemos te ajudar?</p>
      </div>

      <button
        type="button"
        onClick={handleEmergenciaGeral}
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
              onClick={() => navigate(`/ocorrencias/${tipo}`)}
              className={`${CARD_CLASSES} ${cor}`}
            >
              <Icon aria-hidden="true" className="h-11 w-11" />
              <b className="text-[19px] leading-tight">{nome}</b>
              <span className="text-sm font-semibold">{descricao}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setCompartilhando(true)}
          className={`${CARD_CLASSES} bg-sucesso`}
        >
          <Users aria-hidden="true" className="h-11 w-11" />
          <b className="text-[19px] leading-tight">Avisar contato</b>
          <span className="text-sm font-semibold">Pessoa de confiança</span>
        </button>
      </div>

      <EmergenciaOverlay
        aberto={confirmandoEmergencia}
        isSubmitting={isSubmitting}
        error={error}
        onConfirm={handleConfirmar}
        onCancel={handleCancelar}
      />
      {compartilhando && <CompartilharContatoOverlay onClose={() => setCompartilhando(false)} />}
    </main>
  )
}

export default HomePage
