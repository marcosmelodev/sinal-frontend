import axiosClient from '../../api/axiosClient'

export interface Contato {
  id: number
  nome: string
  telefone: string
  parentesco?: string
}

export type ContatoPayload = Omit<Contato, 'id'>

const BASE_URL = '/api/v1/contatos-confianca'

async function listar(): Promise<Contato[]> {
  const { data } = await axiosClient.get<Contato[]>(BASE_URL)
  return data
}

async function adicionar(contato: ContatoPayload): Promise<Contato> {
  const { data } = await axiosClient.post<Contato>(BASE_URL, contato)
  return data
}

async function editar(id: number, contato: ContatoPayload): Promise<Contato> {
  const { data } = await axiosClient.put<Contato>(`${BASE_URL}/${id}`, contato)
  return data
}

async function remover(id: number): Promise<void> {
  await axiosClient.delete(`${BASE_URL}/${id}`)
}

export const ContatosService = { listar, adicionar, editar, remover }
