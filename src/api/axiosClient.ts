import axios, { AxiosError } from 'axios'
import type { ProblemDetails } from '../types/rfc7807'

export const ACCESS_TOKEN_KEY = '@Sinal:accessToken'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<Partial<ProblemDetails>>) => {
    const data = error.response?.data

    if (data && typeof data.status === 'number') {
      const problem: ProblemDetails = {
        status: data.status,
        code: data.code ?? 'UNKNOWN_ERROR',
        correlationId: data.correlationId,
        errors: data.errors ?? [],
      }
      return Promise.reject(problem)
    }

    // Sem corpo RFC 7807 (ex.: falha de rede, timeout, resposta inesperada)
    const fallback: ProblemDetails = {
      status: error.response?.status ?? 0,
      code: error.response ? 'UNEXPECTED_RESPONSE' : 'NETWORK_ERROR',
      errors: [],
    }
    return Promise.reject(fallback)
  },
)

export default axiosClient
