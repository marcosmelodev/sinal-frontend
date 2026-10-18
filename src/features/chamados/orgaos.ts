import { Ambulance, CircleHelp, Flame, OctagonAlert, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TipoChamado } from './ChamadosService'

export interface Orgao {
  nome: string
  descricao: string
  Icon: LucideIcon
  /** Classe de fundo do Tailwind com a cor oficial */
  cor: string
}

/** Ordem igual à grade da tela inicial na referência visual */
export const ORGAOS: Record<TipoChamado, Orgao> = {
  SAMU: { nome: 'SAMU', descricao: 'Atendimento médico', Icon: Ambulance, cor: 'bg-emergencia' },
  CORPO_DE_BOMBEIROS: {
    nome: 'Bombeiros',
    descricao: 'Incêndios e resgates',
    Icon: Flame,
    cor: 'bg-alerta',
  },
  POLICIA_MILITAR: {
    nome: 'Polícia Militar',
    descricao: 'Segurança e ocorrências',
    Icon: Shield,
    cor: 'bg-primario',
  },
}

export const EMERGENCIA_IMEDIATA: Orgao = {
  nome: 'Emergência Imediata',
  descricao: 'Perigo imediato',
  Icon: OctagonAlert,
  cor: 'bg-emergencia',
}

const DESCONHECIDO: Orgao = { nome: 'Chamado', descricao: '', Icon: CircleHelp, cor: 'bg-neutro' }

/** Resolve o visual de um chamado vindo da API pelo seu `tipo` */
export function orgaoDoTipo(tipo: string | undefined): Orgao {
  if (tipo && tipo in ORGAOS) return ORGAOS[tipo as TipoChamado]
  return tipo ? { ...DESCONHECIDO, nome: tipo } : DESCONHECIDO
}
