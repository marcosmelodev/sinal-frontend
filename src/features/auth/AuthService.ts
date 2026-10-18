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

/** Espelho de `CadastrarUsuarioResponse.java` */
export interface CadastroResponse {
  id: number
  nome: string
  cpfMascarado: string
  email: string
  dataCadastro: string
  ativo: boolean
}

async function cadastro(dados: CadastroFormData): Promise<CadastroResponse> {
  const { data } = await axiosClient.post<CadastroResponse>('/api/v1/usuarios', {
    ...dados,
    cpf: dados.cpf.replace(/\D/g, ''),
  })
  return data
}

export const AuthService = { login, cadastro }
