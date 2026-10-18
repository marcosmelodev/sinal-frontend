import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChamadosService } from '../features/chamados/ChamadosService'
import type {
  Chamado,
  EmergenciaImediataPayload,
  Localizacao,
  RegistrarChamadoRequest,
} from '../features/chamados/ChamadosService'
import { LocationError, LocationService } from '../services/LocationService'
import type { Page, PageParams } from '../types/pagination'
import { isProblemDetails, mensagemDeErro } from '../utils/problemDetails'

/**
 * Se `localizacao` vier preenchida, o hook usa esse valor em vez de consultar o GPS
 * de novo, mantendo o que o usuário viu na tela.
 */
export type DetalhesChamado = Omit<RegistrarChamadoRequest, 'localizacao'> & {
  localizacao?: Localizacao
}

type EnvioPendente = { idempotencyKey: string } & (
  | { imediata: true; payload: EmergenciaImediataPayload }
  | { imediata: false; payload: RegistrarChamadoRequest }
)

interface DispararEmergencia {
  (imediata: true): Promise<Chamado | null>
  (imediata: false, detalhes: DetalhesChamado): Promise<Chamado | null>
}

/**
 * Falha "ambígua": o servidor pode ter recebido o chamado (rede caiu, timeout, 5xx).
 * Nesses casos a nova tentativa reaproveita a mesma Idempotency-Key e o mesmo payload,
 * para que o back-end não registre o chamado em duplicidade.
 */
function falhaAmbigua(err: unknown): boolean {
  return !isProblemDetails(err) || err.status === 0 || err.status >= 500
}

/** O back-end exige a localização em todo chamado, então sem ela não há envio */
async function obterLocalizacao(): Promise<Localizacao> {
  try {
    return await LocationService.getCurrentPosition()
  } catch (err) {
    const motivo = err instanceof LocationError ? err.message : 'Não foi possível obter sua localização.'
    throw new Error(`${motivo} A localização é necessária para enviar o pedido.`)
  }
}

export function useChamados() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [semLocalizacao, setSemLocalizacao] = useState(false)
  const emAndamento = useRef(false)
  const pendente = useRef<EnvioPendente | null>(null)

  const dispararEmergencia = useCallback(
    async (imediata: boolean, detalhes?: DetalhesChamado): Promise<Chamado | null> => {
      // Evita disparos duplicados por toques repetidos no botão
      if (emAndamento.current) return null
      emAndamento.current = true
      setIsSubmitting(true)
      setError(null)

      try {
        let envio = pendente.current
        const mesmoDisparo =
          envio !== null &&
          (envio.imediata
            ? imediata
            : !imediata &&
              envio.payload.orgao === detalhes?.orgao &&
              envio.payload.ocorrenciaId === detalhes?.ocorrenciaId &&
              envio.payload.detalheAdicional === detalhes?.detalheAdicional)

        if (!envio || !mesmoDisparo) {
          let localizacao: Localizacao
          try {
            localizacao = detalhes?.localizacao ?? (await obterLocalizacao())
            setSemLocalizacao(false)
          } catch (err) {
            setSemLocalizacao(true)
            setError(err instanceof Error ? err.message : 'Não foi possível obter sua localização.')
            return null
          }
          const idempotencyKey = uuidv4()
          envio =
            imediata || !detalhes
              ? { imediata: true, idempotencyKey, payload: { localizacao } }
              : { imediata: false, idempotencyKey, payload: { ...detalhes, localizacao } }
          pendente.current = envio
        }

        const chamado = envio.imediata
          ? await ChamadosService.abrirEmergenciaImediata(envio.payload, envio.idempotencyKey)
          : await ChamadosService.abrirChamadoPadrao(envio.payload, envio.idempotencyKey)

        pendente.current = null
        return chamado
      } catch (err) {
        if (!falhaAmbigua(err)) pendente.current = null
        setError(mensagemDeErro(err))
        return null
      } finally {
        emAndamento.current = false
        setIsSubmitting(false)
      }
    },
    [],
  ) as DispararEmergencia

  const limparErro = useCallback(() => setError(null), [])

  const [historico, setHistorico] = useState<Page<Chamado> | null>(null)
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)
  const [erroHistorico, setErroHistorico] = useState<string | null>(null)

  const listarHistorico = useCallback(async (params?: PageParams) => {
    setCarregandoHistorico(true)
    setErroHistorico(null)
    try {
      const pagina: unknown = await ChamadosService.listarHistorico(params)
      // Tolera a API devolvendo uma lista simples em vez de Page<Chamado>
      if (Array.isArray(pagina)) {
        setHistorico({
          content: pagina,
          totalElements: pagina.length,
          totalPages: 1,
          number: 0,
          size: pagina.length,
          first: true,
          last: true,
        })
      } else if (pagina && Array.isArray((pagina as Page<Chamado>).content)) {
        setHistorico(pagina as Page<Chamado>)
      } else {
        console.error('[useChamados] Resposta inesperada do histórico:', pagina)
        setErroHistorico('Não foi possível ler o histórico recebido do servidor.')
      }
    } catch (err) {
      console.error('[useChamados] Falha ao listar histórico:', err)
      setErroHistorico(mensagemDeErro(err))
    } finally {
      setCarregandoHistorico(false)
    }
  }, [])

  /**
   * Busca um chamado pelo id. Não guarda estado nem trata o erro: quem chama decide
   * (ex.: o polling do acompanhamento ignora falhas temporárias e para nas definitivas).
   */
  const buscarChamadoPorId = useCallback((id: number) => ChamadosService.buscarPorId(id), [])

  return {
    dispararEmergencia,
    buscarChamadoPorId,
    isSubmitting,
    error,
    semLocalizacao,
    limparErro,
    listarHistorico,
    historico,
    carregandoHistorico,
    erroHistorico,
  }
}
