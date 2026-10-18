import { useCallback, useState } from 'react'
import { ContatosService } from '../features/contatos/ContatosService'
import type { Contato, ContatoPayload } from '../features/contatos/ContatosService'
import { mensagemDeErro } from '../utils/problemDetails'

/**
 * Estado e operações de contatos de confiança.
 * As funções de escrita retornam true em caso de sucesso; em falha,
 * a mensagem amigável fica em `error` e o erro bruto em `problema`
 * (útil para `aplicarErrosDeCampo` nos formulários).
 */
export function useContatos() {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [problema, setProblema] = useState<unknown>(null)

  const executar = useCallback(async (operacao: () => Promise<void>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    setProblema(null)
    try {
      await operacao()
      return true
    } catch (err) {
      setError(mensagemDeErro(err))
      setProblema(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarContatos = useCallback(
    () =>
      executar(async () => {
        setContatos(await ContatosService.listar())
      }),
    [executar],
  )

  const adicionarContato = useCallback(
    (contato: ContatoPayload) =>
      executar(async () => {
        const novo = await ContatosService.adicionar(contato)
        setContatos((atual) => [...atual, novo])
      }),
    [executar],
  )

  const editarContato = useCallback(
    (id: number, contato: ContatoPayload) =>
      executar(async () => {
        const atualizado = await ContatosService.editar(id, contato)
        setContatos((atual) => atual.map((c) => (c.id === id ? atualizado : c)))
      }),
    [executar],
  )

  const removerContato = useCallback(
    (id: number) =>
      executar(async () => {
        await ContatosService.remover(id)
        setContatos((atual) => atual.filter((c) => c.id !== id))
      }),
    [executar],
  )

  return {
    contatos,
    loading,
    error,
    problema,
    carregarContatos,
    adicionarContato,
    editarContato,
    removerContato,
  }
}
