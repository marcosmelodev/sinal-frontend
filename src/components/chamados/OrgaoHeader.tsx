import { ChevronLeft } from 'lucide-react'
import type { Orgao } from '../../features/chamados/orgaos'

interface OrgaoHeaderProps {
  orgao: Orgao
  onVoltar: () => void
}

/** Cabeçalho colorido do órgão (telas de ocorrência e resumo) */
function OrgaoHeader({ orgao, onVoltar }: OrgaoHeaderProps) {
  return (
    <header className={`flex flex-col gap-3 px-5 pb-10 pt-3 text-white ${orgao.cor}`}>
      <button
        type="button"
        onClick={onVoltar}
        className="-ml-2 flex min-h-11 items-center gap-1 self-start rounded-lg px-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronLeft aria-hidden="true" className="h-6 w-6" />
        Voltar
      </button>
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 flex-none place-items-center rounded-[10px] bg-white/20">
          <orgao.Icon aria-hidden="true" className="h-10 w-10" />
        </span>
        <div>
          <h1 className="text-[22px] font-bold">{orgao.nomeCompleto}</h1>
          <p className="text-sm">{orgao.subtitulo}</p>
        </div>
      </div>
    </header>
  )
}

export default OrgaoHeader
