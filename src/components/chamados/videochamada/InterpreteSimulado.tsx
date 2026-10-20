import { ShieldCheck } from 'lucide-react'

interface InterpreteSimuladoProps {
  /** Frase que o intérprete está "sinalizando" no momento */
  legenda: string
}

/** Mão estilizada (palma + dedos), desenhada com o pulso na origem */
function Mao() {
  return (
    <g fill="#F1C7A3" stroke="#121933" strokeWidth="2">
      <rect x="-14" y="-30" width="28" height="34" rx="10" />
      <rect x="-13" y="-52" width="7" height="26" rx="3.5" />
      <rect x="-4.5" y="-56" width="7" height="30" rx="3.5" />
      <rect x="4" y="-52" width="7" height="26" rx="3.5" />
      <rect x="12" y="-30" width="7" height="18" rx="3.5" transform="rotate(35 12 -30)" />
    </g>
  )
}

/**
 * Feed de vídeo simulado do intérprete de plantão: figura em SVG com mãos animadas
 * (sinalização), ondas visuais e legenda da interpretação. Puramente ilustrativo.
 */
function InterpreteSimulado({ legenda }: InterpreteSimuladoProps) {
  return (
    <figure className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#1B2550] to-[#121933]">
      <figcaption className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-300" />
        Transmissão Segura em LIBRAS • Intérprete de Plantão
      </figcaption>

      <svg
        viewBox="0 0 240 240"
        className="h-auto w-full max-w-[280px]"
        role="img"
        aria-label="Ilustração do intérprete de LIBRAS sinalizando (simulação)"
      >
        {/* Ondas de sinalização */}
        <circle cx="120" cy="120" r="90" fill="none" stroke="#60A5FA" strokeWidth="2" className="libras-onda" style={{ transformOrigin: '120px 120px' }} />
        <circle cx="120" cy="120" r="90" fill="none" stroke="#34D399" strokeWidth="2" className="libras-onda" style={{ transformOrigin: '120px 120px', animationDelay: '1.2s' }} />

        {/* Tronco e cabeça */}
        <path d="M60 240 C60 185 90 165 120 165 C150 165 180 185 180 240 Z" fill="#334155" />
        <path d="M108 165 L120 182 L132 165 Z" fill="#E2E8F0" />
        <rect x="111" y="140" width="18" height="22" rx="6" fill="#E3B48F" />
        <circle cx="120" cy="112" r="34" fill="#F1C7A3" />
        <path d="M86 108 C86 80 104 70 120 70 C140 70 156 82 154 108 C146 94 132 90 120 90 C106 90 94 96 86 108 Z" fill="#1E293B" />
        <circle cx="108" cy="114" r="3.5" fill="#121933" />
        <circle cx="132" cy="114" r="3.5" fill="#121933" />
        <path d="M110 128 Q120 136 130 128" fill="none" stroke="#121933" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mãos sinalizando */}
        <g className="libras-mao-esq">
          <g transform="translate(70 168)">
            <Mao />
          </g>
        </g>
        <g className="libras-mao-dir">
          <g transform="translate(170 168) scale(-1 1)">
            <Mao />
          </g>
        </g>
      </svg>

      <p className="mx-3 mb-3 mt-2 max-w-md rounded-xl bg-black/65 px-4 py-2 text-center text-base font-medium leading-snug text-white">
        <span className="font-bold text-emerald-300">Intérprete sinalizando:</span> {legenda}
      </p>
    </figure>
  )
}

export default InterpreteSimulado
