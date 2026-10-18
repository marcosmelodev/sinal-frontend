export interface ProblemDetails {
  status: number
  code: string
  correlationId?: string
  /** Campos padrão do RFC 7807 */
  title?: string
  detail?: string
  errors: Array<{
    campo: string
    mensagem: string
  }>
}
