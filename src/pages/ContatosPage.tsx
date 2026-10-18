import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import ContatoForm from '../features/contatos/ContatoForm'
import type { ContatoFormData } from '../features/contatos/schemas'
import { useContatos } from '../hooks/useContatos'

type Modo = { tipo: 'novo' } | { tipo: 'editar'; id: number } | null

const ICON_BUTTON =
  'grid h-12 w-12 flex-none place-items-center rounded-xl border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primario focus-visible:ring-offset-1 disabled:opacity-50'

function ContatosPage() {
  const navigate = useNavigate()
  const {
    contatos,
    loading,
    error,
    problema,
    carregarContatos,
    adicionarContato,
    editarContato,
    removerContato,
  } = useContatos()
  const [modo, setModo] = useState<Modo>(null)
  const [removendoId, setRemovendoId] = useState<number | null>(null)
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    carregarContatos().then((ok) => ok && setCarregado(true))
  }, [carregarContatos])

  async function handleAdicionar(dados: ContatoFormData) {
    const ok = await adicionarContato(dados)
    if (ok) setModo(null)
    return ok
  }

  async function handleEditar(id: number, dados: ContatoFormData) {
    // Preserva o parentesco, que não é editado neste formulário
    const parentesco = contatos.find((c) => c.id === id)?.parentesco
    const ok = await editarContato(id, { ...dados, parentesco })
    if (ok) setModo(null)
    return ok
  }

  async function handleRemover(id: number) {
    if (await removerContato(id)) setRemovendoId(null)
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
      <header className="flex flex-col gap-2 px-5 pb-9 pt-3">
        <button
          type="button"
          onClick={() => navigate('/perfil')}
          className="-ml-2 flex min-h-11 items-center gap-1 self-start rounded-lg px-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft aria-hidden="true" className="h-6 w-6" />
          Voltar
        </button>
        <h1 className="text-center text-[22px] font-bold">Meus Contatos de Confiança</h1>
      </header>

      <section className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
        {error && (
          <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-amber-700 p-3">
            <AlertTriangle aria-hidden="true" className="h-6 w-6 flex-none text-amber-700" />
            <span className="flex-1">{error}</span>
            {!carregado && (
              <button
                type="button"
                onClick={() => carregarContatos().then((ok) => ok && setCarregado(true))}
                className="min-h-11 rounded-xl border-2 border-primario px-4 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {modo?.tipo === 'novo' ? (
          <ContatoForm
            titulo="Novo contato"
            textoBotao="Salvar contato"
            problema={problema}
            onSubmit={handleAdicionar}
            onCancel={() => setModo(null)}
          />
        ) : (
          <Button
            onClick={() => {
              setRemovendoId(null)
              setModo({ tipo: 'novo' })
            }}
            disabled={!carregado}
            className="flex items-center justify-center gap-2"
          >
            <Plus aria-hidden="true" className="h-6 w-6" />
            Adicionar Contato
          </Button>
        )}

        {loading && !carregado && (
          <p role="status" className="flex items-center gap-2 text-slate-600">
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-[3px] border-slate-400 border-t-slate-900 motion-reduce:animate-none"
            />
            Carregando contatos…
          </p>
        )}

        {carregado && contatos.length === 0 && modo === null && (
          <p className="text-sm text-slate-600">
            Nenhum contato cadastrado ainda. Adicione uma pessoa de confiança para avisar em uma
            emergência.
          </p>
        )}

        {contatos.length > 0 && (
          <ul className="flex flex-col gap-3">
            {contatos.map((contato) =>
              modo?.tipo === 'editar' && modo.id === contato.id ? (
                <li key={contato.id}>
                  <ContatoForm
                    titulo={`Editar ${contato.nome}`}
                    textoBotao="Salvar alterações"
                    valoresIniciais={{ nome: contato.nome, telefone: contato.telefone }}
                    problema={problema}
                    onSubmit={(dados) => handleEditar(contato.id, dados)}
                    onCancel={() => setModo(null)}
                  />
                </li>
              ) : (
                <li
                  key={contato.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 flex-none place-items-center rounded-full bg-primario font-bold text-white"
                    >
                      {contato.nome.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-lg font-bold text-slate-900">{contato.nome}</p>
                      <p className="text-slate-600">{contato.telefone}</p>
                    </div>
                    {removendoId !== contato.id && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`Editar ${contato.nome}`}
                          disabled={loading}
                          onClick={() => {
                            setRemovendoId(null)
                            setModo({ tipo: 'editar', id: contato.id })
                          }}
                          className={`${ICON_BUTTON} border-slate-300 text-slate-700`}
                        >
                          <Pencil aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover ${contato.nome}`}
                          disabled={loading}
                          onClick={() => setRemovendoId(contato.id)}
                          className={`${ICON_BUTTON} border-red-200 text-emergencia`}
                        >
                          <Trash2 aria-hidden="true" className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {removendoId === contato.id && (
                    <div role="group" aria-label={`Confirmar remoção de ${contato.nome}`} className="flex flex-col gap-2">
                      <p className="font-semibold">Remover {contato.nome} dos seus contatos?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          autoFocus
                          disabled={loading}
                          aria-busy={loading}
                          onClick={() => handleRemover(contato.id)}
                          className="min-h-12 flex-1 rounded-xl bg-emergencia px-4 font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 disabled:opacity-50"
                        >
                          {loading ? 'Removendo...' : 'Remover'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemovendoId(null)}
                          className="min-h-12 flex-1 rounded-xl border-2 border-slate-300 px-4 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ),
            )}
          </ul>
        )}

      </section>
    </main>
  )
}

export default ContatosPage
