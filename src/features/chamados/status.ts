import type { Chamado, StatusChamado } from './ChamadosService'

/** Etapas da linha do tempo, na ordem em que o back-end avança o status */
export const ETAPAS_STATUS: ReadonlyArray<{ status: StatusChamado; titulo: string }> = [
  { status: 'CRIADO', titulo: 'Solicitação registrada' },
  { status: 'ENCAMINHADO_SIMULADO', titulo: 'Simulação de encaminhamento em andamento' },
  { status: 'ENCERRADO', titulo: 'Simulação encerrada' },
]

/** Posição do status na linha do tempo; -1 se o back-end enviar um valor desconhecido */
export function indiceStatus(status: string): number {
  return ETAPAS_STATUS.findIndex((etapa) => etapa.status === status)
}

export function tituloStatus(status: string): string {
  return ETAPAS_STATUS[indiceStatus(status)]?.titulo ?? status
}

export function isEncerrado(status: string): boolean {
  return status === 'ENCERRADO'
}

export function codigoSimulacao(chamado: Pick<Chamado, 'id' | 'codigoSimulacao'>): string {
  return chamado.codigoSimulacao ?? `#SIM-${chamado.id}`
}
