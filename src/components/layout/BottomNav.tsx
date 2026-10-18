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
      className="fixed bottom-0 w-full border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {ITENS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primario ${
                  isActive ? 'text-primario' : 'text-neutro'
                }`
              }
            >
              <Icon aria-hidden="true" className="h-6 w-6" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
