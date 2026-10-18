import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users } from 'lucide-react'
import { atualizarPerfilAtual, encerrarSessao, getPerfilAtual } from '../features/auth/sessao'
import AlterarSenhaSection from '../features/perfil/AlterarSenhaSection'
import MeusDadosSection from '../features/perfil/MeusDadosSection'
import type { MeusDadosFormData } from '../features/perfil/schemas'

function PerfilPage() {
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(getPerfilAtual)

  const nome = perfil?.nome || 'Usuário'

  function handleSalvarDados(dados: MeusDadosFormData) {
    atualizarPerfilAtual(dados)
    setPerfil(getPerfilAtual())
  }

  function handleSair() {
    encerrarSessao()
    navigate('/login', { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
      <header className="px-5 pb-9 pt-5 text-center">
        <h1 className="text-[22px] font-bold">Perfil</h1>
      </header>

      <section className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 flex-none place-items-center rounded-full bg-primario text-xl font-bold text-white"
          >
            {nome.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="break-words text-lg font-bold">{nome}</p>
            {perfil?.email && <p className="break-words text-slate-600">{perfil.email}</p>}
          </div>
        </div>

        <MeusDadosSection perfil={perfil} onSalvar={handleSalvarDados} />
        <AlterarSenhaSection />

        <button
          type="button"
          onClick={() => navigate('/contatos')}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-primario px-4 text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        >
          <Users aria-hidden="true" className="h-5 w-5" />
          Gerenciar contatos
        </button>

        <button
          type="button"
          onClick={handleSair}
          className="mx-auto flex min-h-12 items-center gap-2 rounded-md px-4 font-semibold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
        >
          <LogOut aria-hidden="true" className="h-5 w-5" />
          Sair
        </button>

        <p className="mt-auto pt-4 text-center text-sm text-slate-600">SINAL — protótipo acadêmico</p>
      </section>
    </main>
  )
}

export default PerfilPage
