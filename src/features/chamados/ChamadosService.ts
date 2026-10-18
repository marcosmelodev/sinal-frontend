import axiosClient from '../../api/axiosClient'
import type { Page, PageParams } from '../../types/pagination'

export interface Localizacao {
  latitude: number
  longitude: number
  precisao?: number
}

export interface Chamado {
  id: string
  tipo: string
  status: string
  descricao?: string
  localizacao?: Localizacao
  criadoEm: string
}

export interface AbrirChamadoPayload {
  tipo: string
  descricao?: string
  localizacao?: Localizacao
}

export interface EmergenciaImediataPayload {
  localizacao?: Localizacao
}

const BASE_URL = '/api/v1/chamados'

async function listarHistorico({ page, size }: PageParams = {}): Promise<Page<Chamado>> {
  const { data } = await axiosClient.get<Page<Chamado>>(BASE_URL, {
    params: { page, size },
  })
  return data
}

async function abrirChamadoPadrao(
  payload: AbrirChamadoPayload,
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
