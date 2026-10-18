import { CircleHelp, OctagonAlert, Shield, Ambulance, Flame, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TipoChamado = 'SAMU' | 'BOMBEIROS' | 'POLICIA_MILITAR' | 'CONTATO_CONFIANCA'

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
  BOMBEIROS: { nome: 'Bombeiros', descricao: 'Incêndios e resgates', Icon: Flame, cor: 'bg-alerta' },
  POLICIA_MILITAR: {
    nome: 'Polícia Militar',
    descricao: 'Segurança e ocorrências',
    Icon: Shield,
    cor: 'bg-primario',
  },
  CONTATO_CONFIANCA: {
    nome: 'Avisar contato',
    descricao: 'Pessoa de confiança',
    Icon: Users,
    cor: 'bg-sucesso',
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
  if (!tipo) return DESCONHECIDO
  if (tipo in ORGAOS) return ORGAOS[tipo as TipoChamado]
  if (tipo === 'EMERGENCIA_IMEDIATA') return EMERGENCIA_IMEDIATA
  return { ...DESCONHECIDO, nome: tipo }
}
