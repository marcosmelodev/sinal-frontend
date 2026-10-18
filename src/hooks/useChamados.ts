import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChamadosService } from '../features/chamados/ChamadosService'
import type {
  AbrirChamadoPayload,
  Chamado,
  Localizacao,
} from '../features/chamados/ChamadosService'
import { LocationService } from '../services/LocationService'
import { isProblemDetails, mensagemDeErro } from '../utils/problemDetails'

type DetalhesChamado = Omit<AbrirChamadoPayload, 'localizacao'>

interface EnvioPendente {
  imediata: boolean
  idempotencyKey: string
  payload: AbrirChamadoPayload
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
        if (!envio || envio.imediata !== imediata) {
          const localizacao = await obterLocalizacao()
          setSemLocalizacao(!localizacao)
          envio = {
            imediata,
            idempotencyKey: uuidv4(),
            payload: imediata ? { localizacao } : { ...detalhes, localizacao },
          }
          pendente.current = envio
        }

        const chamado = imediata
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
  )

  return { dispararEmergencia, isSubmitting, error, semLocalizacao }
}
