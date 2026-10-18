import axiosClient from '../../api/axiosClient'
import type { Page, PageParams } from '../../types/pagination'

/** Enum `TipoChamado` do back-end */
export type TipoChamado = 'POLICIA_MILITAR' | 'CORPO_DE_BOMBEIROS' | 'SAMU'

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
  status: string
  descricao?: string
  localizacao?: Localizacao
  criadoEm: string
}

export interface RegistrarChamadoRequest {
  orgao: TipoChamado
  ocorrenciaId: number
  descricao?: string
  localizacao?: Localizacao
}

export interface EmergenciaImediataPayload {
  localizacao?: Localizacao
  // TODO: remover quando o back-end deixar de exigir estes campos na emergência imediata
  orgao?: TipoChamado
  ocorrenciaId?: number
}

const BASE_URL = '/api/v1/chamados'

async function listarHistorico({ page, size }: PageParams = {}): Promise<Page<Chamado>> {
  const { data } = await axiosClient.get<Page<Chamado>>(BASE_URL, {
    params: { page, size },
  })
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

export const ChamadosService = { listarHistorico, abrirChamadoPadrao, abrirEmergenciaImediata }
