import type { ReactNode } from 'react'
import LogoSinal from '../ui/LogoSinal'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Layout das telas de entrada (login e cadastro), como na referência visual:
 * topo azul-marinho sólido (mesma cor do fundo do logo) e o conteúdo num painel branco arredondado.
 */
function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#121933]">
      <main className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex flex-col items-center px-5 pb-10 pt-10 text-white">
          <LogoSinal tamanho="grande" />
        </div>
        <section className="-mt-6 flex flex-1 flex-col rounded-t-[28px] bg-white px-5 pb-7 pt-6 text-slate-900">
          {children}
        </section>
      </main>
    </div>
  )
}

export default AuthLayout
