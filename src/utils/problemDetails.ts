import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ProblemDetails } from '../types/rfc7807'

export function isProblemDetails(error: unknown): error is ProblemDetails {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as ProblemDetails).status === 'number' &&
    Array.isArray((error as ProblemDetails).errors)
  )
}

export function mensagemDeErro(error: unknown): string {
  if (!isProblemDetails(error)) return 'Ocorreu um erro inesperado. Tente novamente.'

  switch (true) {
    case error.status === 0:
      return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
    case error.status === 401:
      return 'Credenciais inválidas. Verifique os dados e tente novamente.'
    case error.status === 400 || error.status === 409 || error.status === 422:
      // Mensagem de negócio do back-end, quando houver (ex.: ocorrência inválida para o órgão)
      return error.detail || error.errors[0]?.mensagem || (error.status === 409
        ? 'Já existe uma conta com esses dados.'
        : 'Verifique os dados informados.')
    case error.status >= 500:
      return 'O servidor está com problemas. Tente novamente em instantes.'
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.'
  }
}

/**
 * Aplica no formulário os erros de campo devolvidos pela API.
 * Retorna true se ao menos um erro foi associado a um campo existente.
 */
export function aplicarErrosDeCampo<T extends FieldValues>(
  error: unknown,
  campos: ReadonlyArray<Path<T>>,
  setError: UseFormSetError<T>,
): boolean {
  if (!isProblemDetails(error)) return false

  let aplicou = false
  for (const { campo, mensagem } of error.errors) {
    if ((campos as ReadonlyArray<string>).includes(campo)) {
      setError(campo as Path<T>, { type: 'server', message: mensagem })
      aplicou = true
    }
  }
  return aplicou
}
