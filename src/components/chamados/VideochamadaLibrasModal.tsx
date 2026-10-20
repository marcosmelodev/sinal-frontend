import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Info, MessageSquare, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import CameraUsuario from './videochamada/CameraUsuario'
import type { ResultadoCamera } from './videochamada/CameraUsuario'
import ChatApoio from './videochamada/ChatApoio'
import type { MensagemChat } from './videochamada/ChatApoio'
import InterpreteSimulado from './videochamada/InterpreteSimulado'
import { LibrasService } from '../../features/libras/LibrasService'
import { formatarDuracao } from '../../utils/formatters'
import { isProblemDetails } from '../../utils/problemDetails'

interface VideochamadaLibrasModalProps {
  /** Nome do órgão do chamado atual, exibido no status da conexão */
  nomeOrgao?: string
  /** Chamada encerrada pelo usuário, com a duração em segundos */
  onEncerrar: (duracaoSegundos: number) => void
}

const TEMPO_CONEXAO_MS = 1800
const TEMPO_LEGENDA_MS = 4500

/** Mensagem de sistema quando o chat real falha (rede, timeout ou 503 CHAT_INDISPONIVEL) */
function mensagemFalhaChat(err: unknown): string {
  if (isProblemDetails(err) && err.status === 0) {
    return 'Sem conexão com a Central LIBRAS. Verifique sua internet e tente novamente em instantes.'
  }
  return 'Central LIBRAS indisponível no momento. Tente novamente em instantes. Em risco de vida, use a Emergência Imediata na tela inicial.'
}

function legendas(nomeOrgao?: string): string[] {
  return [
    'Olá! Sou intérprete da Central LIBRAS. Recebemos sua localização.',
    'Você está em local seguro?',
    nomeOrgao
      ? `A equipe do(a) ${nomeOrgao} já foi informada sobre o seu chamado (simulação).`
      : 'A equipe responsável já foi informada sobre o seu chamado (simulação).',
    'Se não puder sinalizar, use o chat para escrever.',
    'Estou aqui com você. Continue olhando para a tela.',
  ]
}

const SELETOR_FOCAVEIS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Videochamada de emergência em LIBRAS com a central de plantão: simulação 100% front-end
 * (sem WebRTC). Conecta em ~2s, exibe o intérprete animado com legendas, a câmera do usuário
 * (opcional, com fallback), chat de apoio e controles de mídia acessíveis.
 */
function VideochamadaLibrasModal({ nomeOrgao, onEncerrar }: VideochamadaLibrasModalProps) {
  const id = useId()
  const raizRef = useRef<HTMLDivElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const continuarRef = useRef<HTMLButtonElement>(null)
  const encerrarRef = useRef<HTMLButtonElement>(null)
  // Requisições do chat em andamento, canceladas se o modal fechar
  const requisicoesChat = useRef(new Set<AbortController>())
  const proximoIdMensagem = useRef(0)

  const [conectado, setConectado] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [indiceLegenda, setIndiceLegenda] = useState(0)
  const [mutado, setMutado] = useState(false)
  const [cameraAtiva, setCameraAtiva] = useState(true)
  // Incrementa a cada religada para remontar a câmera (nova tentativa de getUserMedia)
  const [tentativaCamera, setTentativaCamera] = useState(0)
  const [chatAberto, setChatAberto] = useState(false)
  const [mensagens, setMensagens] = useState<MensagemChat[]>([])
  // Contador (e não booleano): o usuário pode enviar várias mensagens antes da primeira resposta
  const [respostasPendentes, setRespostasPendentes] = useState(0)
  const [confirmandoEncerrar, setConfirmandoEncerrar] = useState(false)
  const [anuncio, setAnuncio] = useState('Conectando à central de LIBRAS')

  const frases = legendas(nomeOrgao)

  // Foco inicial, bloqueio da rolagem da página e devolução do foco ao fechar
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    tituloRef.current?.focus()
    const requisicoes = requisicoesChat.current
    return () => {
      document.body.style.overflow = overflow
      requisicoes.forEach((controller) => controller.abort())
      anterior?.focus?.()
    }
  }, [])

  // Fase de conexão simulada
  useEffect(() => {
    const t = window.setTimeout(() => {
      setConectado(true)
      setAnuncio(`Conectado com intérprete de LIBRAS${nomeOrgao ? `. Chamado: ${nomeOrgao}` : ''}`)
    }, TEMPO_CONEXAO_MS)
    return () => window.clearTimeout(t)
  }, [nomeOrgao])

  // Cronômetro e rotação das legendas, só depois de conectar
  useEffect(() => {
    if (!conectado) return
    const cronometro = window.setInterval(() => setSegundos((s) => s + 1), 1000)
    const legenda = window.setInterval(
      () => setIndiceLegenda((i) => (i + 1) % frases.length),
      TEMPO_LEGENDA_MS,
    )
    return () => {
      window.clearInterval(cronometro)
      window.clearInterval(legenda)
    }
  }, [conectado, frases.length])

  useEffect(() => {
    if (confirmandoEncerrar) continuarRef.current?.focus()
  }, [confirmandoEncerrar])

  const handleResultadoCamera = useCallback((resultado: ResultadoCamera) => {
    setAnuncio(resultado === 'ativa' ? 'Câmera ativada' : 'Câmera indisponível. Exibindo simulação.')
  }, [])

  function alternarMicrofone() {
    const novo = !mutado
    setMutado(novo)
    setAnuncio(novo ? 'Microfone desativado' : 'Microfone ativado')
  }

  function alternarCamera() {
    if (cameraAtiva) {
      setCameraAtiva(false)
      setAnuncio('Câmera desativada')
    } else {
      setCameraAtiva(true)
      setTentativaCamera((n) => n + 1)
      setAnuncio('Ligando câmera')
    }
  }

  function alternarChat() {
    const novo = !chatAberto
    setChatAberto(novo)
    setAnuncio(novo ? 'Chat de apoio aberto' : 'Chat de apoio fechado')
  }

  function adicionarMensagem(autor: MensagemChat['autor'], texto: string) {
    const id = proximoIdMensagem.current++
    setMensagens((atual) => [...atual, { id, autor, texto }])
  }

  /** Mensagem aparece na hora; a resposta vem de POST /api/v1/libras/chat (Gemini no back-end) */
  async function enviarMensagem(texto: string) {
    adicionarMensagem('voce', texto)
    setRespostasPendentes((n) => n + 1)
    const controller = new AbortController()
    requisicoesChat.current.add(controller)
    try {
      const resposta = await LibrasService.enviarMensagem(texto, controller.signal)
      if (!controller.signal.aborted) adicionarMensagem('central', resposta)
    } catch (err) {
      if (!controller.signal.aborted) adicionarMensagem('sistema', mensagemFalhaChat(err))
    } finally {
      requisicoesChat.current.delete(controller)
      if (!controller.signal.aborted) setRespostasPendentes((n) => n - 1)
    }
  }

  function pedirEncerramento() {
    setConfirmandoEncerrar(true)
    setAnuncio('Confirme se deseja encerrar o atendimento')
  }

  function cancelarEncerramento() {
    setConfirmandoEncerrar(false)
    requestAnimationFrame(() => encerrarRef.current?.focus())
  }

  // Esc nunca encerra direto: fecha o chat ou pede confirmação. Tab fica preso no modal.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (confirmandoEncerrar) cancelarEncerramento()
      else if (chatAberto) alternarChat()
      else pedirEncerramento()
      return
    }
    if (e.key !== 'Tab' || !raizRef.current) return
    const focaveis = Array.from(raizRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS))
    if (focaveis.length === 0) return
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primeiro.focus()
    }
  }

  const BOTAO =
    'flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#121933]'
  const LIGADO = 'border-white/70 bg-white/10 text-white'
  const DESLIGADO = 'border-white bg-white text-slate-900'

  return (
    <div
      ref={raizRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-titulo`}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex flex-col bg-[#121933] text-white"
    >
      <p className="flex items-center gap-2 border-b-2 border-white/70 bg-slate-700 px-4 py-2 text-sm font-semibold">
        <Info aria-hidden="true" className="h-5 w-5 flex-none" />
        PROTÓTIPO ACADÊMICO — Simulação de Central de Intérpretes de LIBRAS
      </p>

      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <h1 ref={tituloRef} id={`${id}-titulo`} tabIndex={-1} className="text-lg font-bold focus:outline-none">
            Atendimento em LIBRAS
          </h1>
          {conectado ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <span aria-hidden="true" className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
              </span>
              Conectado com Central LIBRAS (24h){nomeOrgao ? ` · ${nomeOrgao}` : ''}
            </p>
          ) : (
            <p className="text-sm text-slate-300">Conectando…</p>
          )}
        </div>
        <p className="rounded-lg bg-black/40 px-3 py-1 font-mono text-lg tabular-nums" aria-label={`Duração da chamada: ${formatarDuracao(segundos)}`}>
          {formatarDuracao(segundos)}
        </p>
      </header>

      <div className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-3">
        {conectado ? (
          <InterpreteSimulado legenda={frases[indiceLegenda]} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/15 text-center">
            <span aria-hidden="true" className="relative grid h-20 w-20 place-items-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-primario/40 motion-reduce:animate-none" />
              <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white motion-reduce:animate-none" />
            </span>
            <p className="max-w-xs text-lg font-semibold">Conectando ao intérprete de LIBRAS da central...</p>
          </div>
        )}

        <div className="absolute bottom-3 right-6 z-10">
          <CameraUsuario key={tentativaCamera} ligada={cameraAtiva} onResultado={handleResultadoCamera} />
        </div>
      </div>

      {chatAberto && (
        <div className="mx-auto w-full max-w-3xl px-3 pt-3">
          <ChatApoio
            mensagens={mensagens}
            centralDigitando={respostasPendentes > 0}
            onEnviar={enviarMensagem}
            onFechar={alternarChat}
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
        {confirmandoEncerrar ? (
          <div role="group" aria-labelledby={`${id}-confirmar`} className="flex flex-col gap-2 rounded-2xl bg-white p-3 text-slate-900">
            <p id={`${id}-confirmar`} className="text-center font-bold">
              Encerrar o atendimento em LIBRAS?
            </p>
            <div className="flex gap-2">
              <button
                ref={continuarRef}
                type="button"
                onClick={cancelarEncerramento}
                className="min-h-[48px] flex-1 rounded-xl border-2 border-primario px-3 font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              >
                Continuar chamada
              </button>
              <button
                type="button"
                onClick={() => onEncerrar(segundos)}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-800 px-3 font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
              >
                <PhoneOff aria-hidden="true" className="h-5 w-5" />
                Encerrar
              </button>
            </div>
          </div>
        ) : (
          <div role="toolbar" aria-label="Controles da chamada" className="flex items-stretch justify-center gap-3">
            <button
              type="button"
              onClick={alternarMicrofone}
              aria-pressed={mutado}
              aria-label={mutado ? 'Ativar microfone' : 'Desativar microfone'}
              className={`${BOTAO} ${mutado ? DESLIGADO : LIGADO}`}
            >
              {mutado ? <MicOff aria-hidden="true" className="h-6 w-6" /> : <Mic aria-hidden="true" className="h-6 w-6" />}
              {mutado ? 'Mudo' : 'Microfone'}
            </button>
            <button
              type="button"
              onClick={alternarCamera}
              aria-pressed={!cameraAtiva}
              aria-label={cameraAtiva ? 'Desligar câmera' : 'Ligar câmera'}
              className={`${BOTAO} ${cameraAtiva ? LIGADO : DESLIGADO}`}
            >
              {cameraAtiva ? <Video aria-hidden="true" className="h-6 w-6" /> : <VideoOff aria-hidden="true" className="h-6 w-6" />}
              {cameraAtiva ? 'Câmera' : 'Sem câmera'}
            </button>
            <button
              type="button"
              onClick={alternarChat}
              aria-pressed={chatAberto}
              aria-label={chatAberto ? 'Fechar chat de apoio' : 'Abrir chat de apoio'}
              className={`${BOTAO} ${chatAberto ? 'border-white bg-blue-800 text-white' : LIGADO}`}
            >
              <MessageSquare aria-hidden="true" className="h-6 w-6" />
              Chat
            </button>
            <button
              ref={encerrarRef}
              type="button"
              onClick={pedirEncerramento}
              aria-label="Encerrar chamada"
              className={`${BOTAO} border-white bg-red-800 text-white`}
            >
              <PhoneOff aria-hidden="true" className="h-6 w-6" />
              Encerrar
            </button>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite" role="status">
        {anuncio}
      </p>
    </div>
  )
}

export default VideochamadaLibrasModal
