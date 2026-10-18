import { Ambulance, CircleHelp, Flame, OctagonAlert, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TipoChamado } from './ChamadosService'

export interface Orgao {
  /** Nome curto, usado nos cards da Home */
  nome: string
  descricao: string
  /** Nome e subtítulo do cabeçalho da tela de ocorrências */
  nomeCompleto: string
  subtitulo: string
  Icon: LucideIcon
  /** Classes do Tailwind com a cor oficial (strings completas para o JIT detectar) */
  cor: string
  borda: string
}

/** Ordem igual à grade da tela inicial na referência visual */
export const ORGAOS: Record<TipoChamado, Orgao> = {
  SAMU: {
    nome: 'SAMU',
    descricao: 'Atendimento médico',
    nomeCompleto: 'SAMU',
    subtitulo: 'Serviço de Atendimento Móvel de Urgência',
    Icon: Ambulance,
    cor: 'bg-emergencia',
    borda: 'border-l-emergencia',
  },
  CORPO_DE_BOMBEIROS: {
    nome: 'Bombeiros',
    descricao: 'Incêndios e resgates',
    nomeCompleto: 'Corpo de Bombeiros',
    subtitulo: 'Combate a incêndios e resgates',
    Icon: Flame,
    cor: 'bg-alerta',
    borda: 'border-l-alerta',
  },
  POLICIA_MILITAR: {
    nome: 'Polícia Militar',
    descricao: 'Segurança e ocorrências',
    nomeCompleto: 'Polícia Militar',
    subtitulo: 'Segurança pública e ocorrências',
    Icon: Shield,
    cor: 'bg-primario',
    borda: 'border-l-primario',
  },
}

export const EMERGENCIA_IMEDIATA = {
  nome: 'Emergência Imediata',
  descricao: 'Perigo imediato',
  Icon: OctagonAlert,
}

const DESCONHECIDO: Orgao = {
  nome: 'Chamado',
  descricao: '',
  nomeCompleto: 'Chamado',
  subtitulo: '',
  Icon: CircleHelp,
  cor: 'bg-neutro',
  borda: 'border-l-neutro',
}

export function isTipoChamado(valor: string | undefined): valor is TipoChamado {
  return valor !== undefined && valor in ORGAOS
}

/** Resolve o visual de um chamado vindo da API pelo seu órgão */
export function orgaoDoTipo(tipo: string | undefined): Orgao {
  if (isTipoChamado(tipo)) return ORGAOS[tipo]
  return tipo ? { ...DESCONHECIDO, nome: tipo } : DESCONHECIDO
}
