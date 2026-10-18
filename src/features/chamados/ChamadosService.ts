import axiosClient from '../../api/axiosClient'

/** Enum `OrgaoSeguranca` do back-end */
export type TipoChamado = 'POLICIA_MILITAR' | 'CORPO_DE_BOMBEIROS' | 'SAMU'

/** Enum `EstadoChamado` do back-end, em ordem de progresso */
export type EstadoChamado = 'CRIADO' | 'ENCAMINHADO_SIMULADO' | 'ENCERRADO'

/** Enum `ModalidadeChamado` do back-end */
export type ModalidadeChamado = 'PADRAO' | 'EMERGENCIA_IMEDIATA'

export interface Localizacao {
  latitude: number
  longitude: number
  precisao: number
  /** ISO 8601 */
  timestamp: string
}

// ---------- Contrato da API (espelho dos records Java em ../sinal) ----------

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

/** `ChamadoResponse.java`: resposta do registro (POST) */
interface ChamadoResponse {
  id: number
  codigoSimulacao: string
  modalidade: ModalidadeChamado
  orgao: TipoChamado
  ocorrenciaId: number | null
  localizacao: Localizacao | null
  baixaPrecisao: boolean | null
  detalheAdicional: string | null
  estado: EstadoChamado
  dataCriacao: string
}

/** `ChamadoHistoricoResponse.java`: item do histórico (sem localização nem detalhe) */
interface ChamadoHistoricoResponse {
  id: number
  codigoSimulacao: string
  modalidade: ModalidadeChamado
  orgao: TipoChamado
  ocorrencia: { id: number; nome: string } | null
  estado: EstadoChamado
  baixaPrecisao: boolean | null
  dataCriacao: string
}

/** `PaginaDeHistoricoResponse.java`: `proximoCursor` nulo indica a última página */
interface PaginaDeHistoricoResponse {
  itens: ChamadoHistoricoResponse[]
  proximoCursor: string | null
}

// ---------- Modelo usado pela UI ----------

/** Chamado normalizado: une a resposta do registro e o item do histórico */
export interface Chamado {
  id: number
  codigoSimulacao: string
  modalidade: ModalidadeChamado
  orgao: TipoChamado
  ocorrenciaId?: number
  /** Nome da ocorrência vindo do back-end (só no histórico) */
  ocorrenciaNome?: string
  estado: EstadoChamado
  /** ISO 8601 */
  dataCriacao: string
  baixaPrecisao: boolean
  /** Só vem na resposta do registro */
  localizacao?: Localizacao
  detalheAdicional?: string
}

export interface PaginaHistorico {
  itens: Chamado[]
  proximoCursor: string | null
}

export interface ParametrosHistorico {
  /** 1 a 50 (padrão do back-end: 20) */
  limite?: number
  cursor?: string
}

function normalizarRegistro(r: ChamadoResponse): Chamado {
  return {
    id: r.id,
    codigoSimulacao: r.codigoSimulacao,
    modalidade: r.modalidade,
    orgao: r.orgao,
    ocorrenciaId: r.ocorrenciaId ?? undefined,
    estado: r.estado,
    dataCriacao: r.dataCriacao,
    baixaPrecisao: r.baixaPrecisao ?? false,
    localizacao: r.localizacao ?? undefined,
    detalheAdicional: r.detalheAdicional ?? undefined,
  }
}

function normalizarItemHistorico(r: ChamadoHistoricoResponse): Chamado {
  return {
    id: r.id,
    codigoSimulacao: r.codigoSimulacao,
    modalidade: r.modalidade,
    orgao: r.orgao,
    ocorrenciaId: r.ocorrencia?.id,
    ocorrenciaNome: r.ocorrencia?.nome,
    estado: r.estado,
    dataCriacao: r.dataCriacao,
    baixaPrecisao: r.baixaPrecisao ?? false,
  }
}

const BASE_URL = '/api/v1/chamados'

async function listarHistorico({ limite, cursor }: ParametrosHistorico = {}): Promise<PaginaHistorico> {
  const { data } = await axiosClient.get<PaginaDeHistoricoResponse>(BASE_URL, {
    params: { limite, cursor },
  })
  return { itens: data.itens.map(normalizarItemHistorico), proximoCursor: data.proximoCursor }
}

/** Páginas percorridas no máximo ao procurar um chamado (o histórico vem do mais recente ao mais antigo) */
const MAX_PAGINAS_BUSCA = 5

/**
 * O back-end não expõe `GET /api/v1/chamados/{id}`: procura o chamado no histórico do usuário.
 * Lança um ProblemDetails 404 se ele não for encontrado.
 */
async function buscarPorId(id: number): Promise<Chamado> {
  let cursor: string | undefined
  for (let pagina = 0; pagina < MAX_PAGINAS_BUSCA; pagina++) {
    const { itens, proximoCursor } = await listarHistorico({ limite: 20, cursor })
    const chamado = itens.find((item) => item.id === id)
    if (chamado) return chamado
    if (!proximoCursor) break
    cursor = proximoCursor
  }
  throw {
    status: 404,
    code: 'CHAMADO_NAO_ENCONTRADO',
    detail: 'Chamado não encontrado no seu histórico.',
    errors: [],
  }
}

async function abrirChamadoPadrao(
  payload: RegistrarChamadoRequest,
  idempotencyKey: string,
): Promise<Chamado> {
  const { data } = await axiosClient.post<ChamadoResponse>(BASE_URL, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return normalizarRegistro(data)
}

async function abrirEmergenciaImediata(
  payload: EmergenciaImediataPayload,
  idempotencyKey: string,
): Promise<Chamado> {
  const { data } = await axiosClient.post<ChamadoResponse>(`${BASE_URL}/emergencia-imediata`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return normalizarRegistro(data)
}

export const ChamadosService = {
  listarHistorico,
  buscarPorId,
  abrirChamadoPadrao,
  abrirEmergenciaImediata,
}
