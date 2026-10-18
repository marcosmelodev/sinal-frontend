import { AlertTriangle, Ambulance, Flame, Settings, Shield, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ORGAOS: Array<{ nome: string; Icon: LucideIcon; cor: string }> = [
  { nome: 'Polícia Militar', Icon: Shield, cor: 'bg-primario' },
  { nome: 'SAMU', Icon: Ambulance, cor: 'bg-emergencia' },
  { nome: 'Bombeiros', Icon: Flame, cor: 'bg-alerta' },
  { nome: 'Informar Familiar', Icon: Users, cor: 'bg-sucesso' },
]

function HomePage() {
  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá <span aria-hidden="true">👋</span>
        </h1>
        <button
          type="button"
          aria-label="Configurações"
          onClick={() => console.log('Configurações')}
          className="flex h-12 w-12 items-center justify-center rounded-full text-neutro hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
        >
          <Settings aria-hidden="true" className="h-7 w-7" />
        </button>
      </header>

      <button
        type="button"
        onClick={() => console.log('Emergência Geral')}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-emergencia py-8 text-white shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-emergencia focus-visible:ring-offset-2"
      >
        <AlertTriangle aria-hidden="true" className="h-14 w-14" strokeWidth={2.5} />
        <span className="text-3xl font-bold">Emergência Geral</span>
      </button>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {ORGAOS.map(({ nome, Icon, cor }) => (
          <button
            key={nome}
            type="button"
            onClick={() => console.log(nome)}
            className={`flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl p-3 text-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${cor}`}
          >
            <Icon aria-hidden="true" className="h-12 w-12" strokeWidth={2.25} />
            <span className="text-center text-xl font-bold leading-tight">{nome}</span>
          </button>
        ))}
      </div>
    </main>
  )
}

export default HomePage
