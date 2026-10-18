import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChamadosService } from '../features/chamados/ChamadosService'
import type {
  Chamado,
  EmergenciaImediataPayload,
  Localizacao,
  RegistrarChamadoRequest,
} from '../features/chamados/ChamadosService'
import { LocationService } from '../services/LocationService'
import type { Page, PageParams } from '../types/pagination'
import { isProblemDetails, mensagemDeErro } from '../utils/problemDetails'

/**
 * Se `localizacao` vier preenchida (mesmo que como undefined), o hook usa esse valor
 * em vez de consultar o GPS de novo, mantendo o que o usuário viu na tela.
 */
export type DetalhesChamado = RegistrarChamadoRequest

// TODO: valores provisórios enquanto o back-end exigir órgão/ocorrência na emergência imediata
const EMERGENCIA_IMEDIATA_PROVISORIO = { orgao: 'SAMU', ocorrenciaId: 1 } as const

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

async function obterLocalizacao(): Promise<Localizacao | undefined> {
  try {
    return await LocationService.getCurrentPosition()
  } catch {
    // Sem localização o chamado ainda deve ser enviado
    return undefined
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
              envio.payload.descricao === detalhes?.descricao)

        if (!envio || !mesmoDisparo) {
          const localizacao =
            detalhes && 'localizacao' in detalhes ? detalhes.localizacao : await obterLocalizacao()
          setSemLocalizacao(!localizacao)
          const idempotencyKey = uuidv4()
          envio =
            imediata || !detalhes
              ? {
                  imediata: true,
                  idempotencyKey,
                  payload: { ...EMERGENCIA_IMEDIATA_PROVISORIO, localizacao },
                }
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

  return {
    dispararEmergencia,
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
