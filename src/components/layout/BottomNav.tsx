import { Link, useLocation } from 'react-router-dom'
import { Clock, Home, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ItemNav {
  to: string
  label: string
  Icon: LucideIcon
  /** Rotas (prefixos) em que o item também fica ativo */
  ativoEm: string[]
}

const ITENS: ItemNav[] = [
  { to: '/', label: 'Início', Icon: Home, ativoEm: ['/ocorrencias', '/resumo'] },
  { to: '/historico', label: 'Histórico', Icon: Clock, ativoEm: ['/chamado'] },
  { to: '/perfil', label: 'Perfil', Icon: User, ativoEm: ['/contatos'] },
]

function estaAtivo({ to, ativoEm }: ItemNav, pathname: string): boolean {
  if (pathname === to) return true
  return [...(to === '/' ? [] : [to]), ...ativoEm].some(
    (prefixo) => pathname === prefixo || pathname.startsWith(`${prefixo}/`),
  )
}

function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 z-10 w-full border-t border-neutro bg-[#0B1226] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {ITENS.map((item) => {
          const ativo = estaAtivo(item, pathname)
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={ativo ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                  ativo ? 'border-primario font-bold text-white' : 'border-transparent text-slate-300'
                }`}
              >
                <item.Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
