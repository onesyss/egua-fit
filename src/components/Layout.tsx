import { NavLink, Outlet } from 'react-router-dom'
import { Activity, Dumbbell, LayoutDashboard, TrendingUp } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/', label: 'Meu Treino', icon: Dumbbell, end: true },
  { to: '/evolucao', label: 'Evolução Física', icon: TrendingUp },
  { to: '/dashboard', label: 'Montar Treino', icon: LayoutDashboard },
]

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="tech-header sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white shadow-sm">
              <Activity className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-[0.06em] text-brand-800 uppercase dark:text-brand-200">
                Égua Fit
              </p>
              <p className="hidden font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase sm:block">
                performance · pará
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold tracking-wide transition-all sm:px-3.5',
                      isActive
                        ? 'tech-nav-active'
                        : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900 dark:hover:text-brand-200',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
