export interface ProblemDetails {
  status: number
  code: string
  correlationId?: string
  errors: Array<{
    campo: string
    mensagem: string
  }>
}
