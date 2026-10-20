import { useEffect, useRef, useState } from 'react'
import { VideoOff } from 'lucide-react'

export type ResultadoCamera = 'ativa' | 'indisponivel'

interface CameraUsuarioProps {
  /** Se false, nenhuma câmera é solicitada e o placeholder "Câmera Desativada" é exibido */
  ligada: boolean
  /** Avisado quando a tentativa de abrir a câmera termina */
  onResultado: (resultado: ResultadoCamera) => void
}

const suportaCamera = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

/**
 * Miniatura (PiP) da câmera do usuário. Usa getUserMedia de forma opcional:
 * sem suporte, com permissão negada ou sem webcam, cai para um placeholder.
 * O stream é sempre encerrado ao desligar ou desmontar.
 * O pai deve remontar o componente (via `key`) a cada vez que a câmera é religada.
 */
function CameraUsuario({ ligada, onResultado }: CameraUsuarioProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [resultado, setResultado] = useState<ResultadoCamera | null>(null)
  const suportada = suportaCamera()

  useEffect(() => {
    if (!ligada) return
    if (!suportada) {
      onResultado('indisponivel')
      return
    }
    let stream: MediaStream | null = null
    let ativo = true

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        if (!ativo) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
        setResultado('ativa')
        onResultado('ativa')
      })
      .catch(() => {
        if (!ativo) return
        setResultado('indisponivel')
        onResultado('indisponivel')
      })

    return () => {
      ativo = false
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [ligada, suportada, onResultado])

  const ativa = ligada && resultado === 'ativa'
  const texto = !ligada
    ? 'Câmera Desativada'
    : !suportada || resultado === 'indisponivel'
      ? 'Sua Câmera (Simulação)'
      : 'Iniciando câmera…'

  return (
    <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-xl border-2 border-white/80 bg-slate-800 shadow-lg sm:w-32">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Prévia da sua câmera"
        className={`h-full w-full -scale-x-100 object-cover ${ativa ? '' : 'hidden'}`}
      />
      {!ativa && (
        <div className="flex h-full flex-col items-center justify-center gap-1 p-1 text-center text-xs font-semibold text-slate-200">
          <VideoOff aria-hidden="true" className="h-6 w-6" />
          {texto}
        </div>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[11px] font-semibold text-white">
        Você
      </span>
    </div>
  )
}

export default CameraUsuario
