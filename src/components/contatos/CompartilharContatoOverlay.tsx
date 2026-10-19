import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check, MapPin, Share2, Users } from 'lucide-react'
import { useContatos } from '../../hooks/useContatos'
import { LocationError, LocationService } from '../../services/LocationService'
import type { Coordinates } from '../../services/LocationService'
import {
  formatarTelefone,
  montarLinkCompartilhamento,
  montarMensagem,
  telefoneValido,
} from '../../features/contatos/compartilhamento'
import type { CanalCompartilhamento } from '../../features/contatos/compartilhamento'
import CompartilharViaSheet from './CompartilharViaSheet'

interface CompartilharContatoOverlayProps {
  onClose: () => void
}

type EstadoLocalizacao =
  | { status: 'obtendo' }
  | { status: 'obtida'; coords: Coordinates }
  | { status: 'erro'; mensagem: string }

const CAMPO_CLASSES =
  'w-full rounded-md border-2 border-gray-500 bg-white p-3 text-lg text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1'

const NOME_CANAL: Record<CanalCompartilhamento, string> = {
  sms: 'no aplicativo de SMS',
  whatsapp: 'no WhatsApp',
  telegram: 'no Telegram',
}

async function obterLocalizacao(): Promise<EstadoLocalizacao> {
  try {
    return { status: 'obtida', coords: await LocationService.getCurrentPosition() }
  } catch (err) {
    const mensagem =
      err instanceof LocationError ? err.message : 'Não foi possível obter sua localização.'
    return { status: 'erro', mensagem }
  }
}

function abrirLink(canal: CanalCompartilhamento, url: string) {
  if (canal === 'sms') {
    // Protocolo nativo: abre o app de mensagens sem deixar uma aba em branco
    window.location.href = url
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/** Montado apenas enquanto aberto, para que cada abertura comece com o formulário limpo */
function CompartilharContatoOverlay({ onClose }: CompartilharContatoOverlayProps) {
  const { contatos, loading, error, carregarContatos } = useContatos()
  const [contatoId, setContatoId] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [localizacao, setLocalizacao] = useState<EstadoLocalizacao>({ status: 'obtendo' })
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const [abertoEm, setAbertoEm] = useState<CanalCompartilhamento | null>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const compartilharRef = useRef<HTMLButtonElement>(null)
  const id = useId()

  useEffect(() => {
    carregarContatos().then(() => selectRef.current?.focus())
  }, [carregarContatos])

  // A localização é buscada ao abrir, para já estar pronta quando o usuário compartilhar
  useEffect(() => {
    let ativo = true
    obterLocalizacao().then((resultado) => ativo && setLocalizacao(resultado))
    return () => {
      ativo = false
    }
  }, [])

  const contato = contatos.find((c) => String(c.id) === contatoId)
  const coords = localizacao.status === 'obtida' ? localizacao.coords : null
  const mensagemAjuda = montarMensagem(mensagem, coords)

  async function handleTentarLocalizacao() {
    setLocalizacao({ status: 'obtendo' })
    setLocalizacao(await obterLocalizacao())
  }

  function handleCompartilhar() {
    setAbertoEm(null)
    if (!contato) {
      setErroValidacao('Selecione um contato para compartilhar.')
      selectRef.current?.focus()
      return
    }
    if (!telefoneValido(contato.telefone)) {
      setErroValidacao(
        `O telefone de ${contato.nome} está vazio ou é inválido. Corrija-o em Contatos de confiança.`,
      )
      return
    }
    setErroValidacao(null)
    setGavetaAberta(true)
  }

  function fecharGaveta() {
    setGavetaAberta(false)
    // Devolve o foco ao botão que abriu a gaveta
    requestAnimationFrame(() => compartilharRef.current?.focus())
  }

  function handleEscolherCanal(canal: CanalCompartilhamento) {
    if (!contato) return
    abrirLink(canal, montarLinkCompartilhamento(canal, contato.telefone, mensagemAjuda))
    setAbertoEm(canal)
    fecharGaveta()
  }

  const semContatos = !loading && !error && contatos.length === 0

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        // Enquanto a gaveta está aberta, o modal de trás não recebe foco nem cliques
        inert={gavetaAberta}
        className="flex max-h-full w-full max-w-[400px] flex-col gap-4 overflow-y-auto rounded-[20px] border-t-4 border-sucesso bg-white p-6 text-slate-900"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-[10px] bg-sucesso text-white">
            <Users aria-hidden="true" className="h-7 w-7" />
          </span>
          <div>
            <h2 id={`${id}-titulo`} className="text-xl font-bold">
              Avisar contato
            </h2>
            <p className="text-sm text-slate-600">
              Avise uma pessoa de confiança que você precisa de ajuda.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border-2 border-amber-700 p-3">
            {error}
          </p>
        )}

        {semContatos ? (
          <p className="rounded-xl bg-slate-50 p-3">
            Você ainda não tem contatos de confiança.{' '}
            <Link to="/contatos" onClick={onClose} className="font-bold text-primario underline">
              Cadastrar contato
            </Link>
          </p>
        ) : (
          <label className="flex flex-col gap-1 text-lg font-semibold">
            Selecione o contato
            <select
              ref={selectRef}
              value={contatoId}
              onChange={(e) => {
                setContatoId(e.target.value)
                setErroValidacao(null)
              }}
              disabled={loading}
              aria-invalid={erroValidacao ? true : undefined}
              aria-describedby={erroValidacao ? `${id}-erro` : undefined}
              className={`${CAMPO_CLASSES} font-normal`}
            >
              <option value="">{loading ? 'Carregando contatos…' : 'Selecione…'}</option>
              {contatos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {formatarTelefone(c.telefone)}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-lg font-semibold">
          Mensagem (opcional)
          <textarea
            rows={3}
            maxLength={120}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Ex.: Preciso de ajuda."
            className={`${CAMPO_CLASSES} font-normal`}
          />
        </label>

        <div role="status" aria-live="polite">
          {localizacao.status === 'obtendo' && (
            <p className="flex items-center gap-2 text-slate-600">
              <span
                aria-hidden="true"
                className="h-5 w-5 flex-none animate-spin rounded-full border-[3px] border-slate-400 border-t-slate-900 motion-reduce:animate-none"
              />
              Obtendo sua localização…
            </p>
          )}
          {localizacao.status === 'obtida' && (
            <p className="flex items-center gap-2 text-slate-700">
              <MapPin aria-hidden="true" className="h-5 w-5 flex-none text-sucesso" />
              Sua localização será incluída automaticamente.
            </p>
          )}
          {localizacao.status === 'erro' && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-amber-700 p-3">
              <AlertTriangle aria-hidden="true" className="h-5 w-5 flex-none text-amber-700" />
              <span className="flex-1">
                {localizacao.mensagem} A mensagem será enviada sem a localização.
              </span>
              <button
                type="button"
                onClick={handleTentarLocalizacao}
                className="min-h-11 rounded-xl border-2 border-primario px-3 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        {erroValidacao && (
          <p
            id={`${id}-erro`}
            role="alert"
            className="flex items-center gap-2 rounded-xl border-2 border-red-700 bg-red-50 p-3 font-medium text-red-800"
          >
            <AlertTriangle aria-hidden="true" className="h-5 w-5 flex-none" />
            {erroValidacao}
          </p>
        )}

        {abertoEm && (
          <p role="status" className="flex items-center gap-2 rounded-xl border-2 border-sucesso p-3">
            <Check aria-hidden="true" className="h-5 w-5 flex-none text-sucesso" />
            Mensagem pronta {NOME_CANAL[abertoEm]}. Confirme o envio por lá.
          </p>
        )}

        <button
          ref={compartilharRef}
          type="button"
          onClick={handleCompartilhar}
          disabled={loading}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-md bg-sucesso px-6 text-lg font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 aria-hidden="true" className="h-5 w-5" />
          Compartilhar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-md font-semibold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
        >
          {abertoEm ? 'Fechar' : 'Cancelar'}
        </button>
      </div>

      {gavetaAberta && (
        <CompartilharViaSheet
          previa={mensagemAjuda.completa}
          onEscolher={handleEscolherCanal}
          onCancel={fecharGaveta}
        />
      )}
    </div>
  )
}

export default CompartilharContatoOverlay
