import axiosClient from '../../api/axiosClient'
import type { CadastroFormData, LoginFormData } from './schemas'

export interface LoginResponse {
  accessToken: string
  expiraEm: string
}

async function login(dados: LoginFormData): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>('/api/v1/auth/login', dados)
  return { accessToken: data.accessToken, expiraEm: data.expiraEm }
}

async function cadastro(dados: CadastroFormData): Promise<void> {
  await axiosClient.post('/api/v1/usuarios', {
    ...dados,
    cpf: dados.cpf.replace(/\D/g, ''),
  })
}

export const AuthService = { login, cadastro }
