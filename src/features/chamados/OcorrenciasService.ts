import axiosClient from '../../api/axiosClient'
import type { TipoChamado } from './ChamadosService'

/** Espelho de `OcorrenciaTipoResponse.java` */
export interface OcorrenciaTipoResponse {
  id: number
  codigo: string
  orgao: TipoChamado
  nome: string
  ordem: number
}

async function listarPorOrgao(orgao: TipoChamado): Promise<OcorrenciaTipoResponse[]> {
  const { data } = await axiosClient.get<OcorrenciaTipoResponse[]>('/api/v1/ocorrencias', {
    params: { orgao },
  })
  return data
}

export const OcorrenciasService = { listarPorOrgao }
