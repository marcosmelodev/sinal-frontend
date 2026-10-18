import { NavLink } from 'react-router-dom'
import { Clock, Home, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ITENS: Array<{ to: string; label: string; Icon: LucideIcon }> = [
  { to: '/', label: 'Início', Icon: Home },
  { to: '/historico', label: 'Histórico', Icon: Clock },
  { to: '/contatos', label: 'Perfil/Contatos', Icon: User },
]

function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 z-10 w-full border-t border-neutro bg-[#0B1226] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {ITENS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                  isActive
                    ? 'border-primario font-bold text-white'
                    : 'border-transparent text-slate-300'
                }`
              }
            >
              <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
