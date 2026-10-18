import axiosClient from '../../api/axiosClient'
import type { Page, PageParams } from '../../types/pagination'

/** Enum `TipoChamado` do back-end */
export type TipoChamado = 'POLICIA_MILITAR' | 'CORPO_DE_BOMBEIROS' | 'SAMU'

/** Status do chamado no back-end, em ordem de progresso */
export type StatusChamado = 'CRIADO' | 'ENCAMINHADO_SIMULADO' | 'ENCERRADO'

export interface Localizacao {
  latitude: number
  longitude: number
  precisao: number
  /** ISO 8601 */
  timestamp: string
}

export interface Chamado {
  id: number
  orgao: TipoChamado
  ocorrenciaId?: number
  status: StatusChamado
  /** Código exibido ao usuário; se ausente, a UI usa `#SIM-<id>` */
  codigoSimulacao?: string
  descricao?: string
  localizacao?: Localizacao
  criadoEm: string
}

/** Espelho de `RegistrarChamadoRequest.java`: a localização é obrigatória (@NotNull) */
export interface RegistrarChamadoRequest {
  orgao: TipoChamado
  ocorrenciaId: number
  /** Até 500 caracteres após aparar (validado pelo domínio) */
  detalheAdicional?: string
  localizacao: Localizacao
}

/** Espelho de `RegistrarEmergenciaImediataRequest.java`: somente a localização */
export interface EmergenciaImediataPayload {
  localizacao: Localizacao
}

const BASE_URL = '/api/v1/chamados'

async function listarHistorico({ page, size }: PageParams = {}): Promise<Page<Chamado>> {
  const { data } = await axiosClient.get<Page<Chamado>>(BASE_URL, {
    params: { page, size },
  })
  return data
}

async function buscarPorId(id: number): Promise<Chamado> {
  const { data } = await axiosClient.get<Chamado>(`${BASE_URL}/${id}`)
  return data
}

async function abrirChamadoPadrao(
  payload: RegistrarChamadoRequest,
  idempotencyKey: string,
): Promise<Chamado> {
  const { data } = await axiosClient.post<Chamado>(BASE_URL, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

async function abrirEmergenciaImediata(
  payload: EmergenciaImediataPayload,
  idempotencyKey: string,
): Promise<Chamado> {
  const { data } = await axiosClient.post<Chamado>(`${BASE_URL}/emergencia-imediata`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

export const ChamadosService = {
  listarHistorico,
  buscarPorId,
  abrirChamadoPadrao,
  abrirEmergenciaImediata,
}
