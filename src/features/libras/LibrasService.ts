import axiosClient from '../../api/axiosClient'

/** Espelho de `LibrasChatRequest.java`: obrigatória, até 1000 caracteres */
export interface LibrasChatRequest {
  mensagem: string
}

/** Espelho de `LibrasChatResponse.java` */
export interface LibrasChatResponse {
  resposta: string
}

/** Limite do back-end (`@Size(max = 1000)`) */
export const LIMITE_MENSAGEM_CHAT = 1000

/**
 * Acima dos timeouts do back-end com o Gemini (5 s de conexão + 20 s de resposta),
 * para a interface nunca ficar esperando indefinidamente.
 */
const TIMEOUT_CHAT_MS = 30_000

/**
 * Envia uma mensagem ao chat da Central LIBRAS (respondido pelo Gemini no back-end).
 * O token JWT é injetado pelo interceptor do axiosClient. Falhas chegam como ProblemDetails:
 * o back-end responde 503 `CHAT_INDISPONIVEL` para qualquer problema com a IA.
 */
async function enviarMensagem(mensagem: string, signal?: AbortSignal): Promise<string> {
  const { data } = await axiosClient.post<LibrasChatResponse>(
    '/api/v1/libras/chat',
    { mensagem } satisfies LibrasChatRequest,
    { signal, timeout: TIMEOUT_CHAT_MS },
  )
  return data.resposta
}

export const LibrasService = { enviarMensagem }
