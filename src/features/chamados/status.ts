import type { Chamado, EstadoChamado } from './ChamadosService'

/** Etapas da linha do tempo, na ordem em que o back-end avança o `estado` */
export const ETAPAS_STATUS: ReadonlyArray<{ estado: EstadoChamado; titulo: string }> = [
  { estado: 'CRIADO', titulo: 'Solicitação registrada' },
  { estado: 'ENCAMINHADO_SIMULADO', titulo: 'Simulação de encaminhamento em andamento' },
  { estado: 'ENCERRADO', titulo: 'Simulação encerrada' },
]

/** Posição do estado na linha do tempo; -1 se o back-end enviar um valor desconhecido */
export function indiceStatus(estado: string): number {
  return ETAPAS_STATUS.findIndex((etapa) => etapa.estado === estado)
}

export function tituloStatus(estado: string): string {
  return ETAPAS_STATUS[indiceStatus(estado)]?.titulo ?? estado
}

export function isEncerrado(estado: string): boolean {
  return estado === 'ENCERRADO'
}

/** O back-end já envia `#SIM-<id>`; o fallback cobre respostas antigas */
export function codigoSimulacao(chamado: Pick<Chamado, 'id' | 'codigoSimulacao'>): string {
  return chamado.codigoSimulacao || `#SIM-${chamado.id}`
}
