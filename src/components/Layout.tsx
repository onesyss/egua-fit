import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, Users, X, UsersRound } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useGym } from '../context/DataContext'
import { colorForStudent } from '../lib/training'

export function Layout() {
  const { pinned, unpinStudent, setActiveId } = useGym()
  const location = useLocation()
  const dualWide = location.pathname === '/dupla'

  return (
    <div className="min-h-screen">
      <header className="tech-header sticky top-0 z-50 no-print">
        <div
          className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 ${dualWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white shadow-sm">
              <Activity className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold tracking-[0.06em] text-brand-800 uppercase dark:text-brand-200">
                EquaFit
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
                personal trainer
              </p>
            </div>

            {pinned.length > 0 && (
              <div className="ml-1 flex min-w-0 items-center gap-1 overflow-x-auto">
                {pinned.map((s) => {
                  const color = colorForStudent(s.student)
                  return (
                    <NavLink
                      key={s.student.id}
                      to={`/aluno/${s.student.id}`}
                      onClick={() => setActiveId(s.student.id)}
                      className={({ isActive }) =>
                        [
                          'group flex max-w-[160px] items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold transition',
                          isActive
                            ? 'bg-white shadow-sm dark:bg-slate-900'
                            : 'border-transparent hover:bg-white/70 dark:hover:bg-slate-900/70',
                        ].join(' ')
                      }
                      style={{ borderColor: color }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate" style={{ color }}>
                        {s.student.name.split(' ')[0]}
                      </span>
                      <button
                        type="button"
                        title="Fechar guia"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          unpinStudent(s.student.id)
                        }}
                        className="rounded p-0.5 text-ink-muted opacity-60 hover:bg-slate-100 hover:opacity-100 dark:hover:bg-slate-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </NavLink>
                  )
                })}
                {pinned.length === 2 && (
                  <NavLink
                    to="/dupla"
                    className={({ isActive }) =>
                      [
                        'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold',
                        isActive
                          ? 'bg-[#2c4566] text-white'
                          : 'text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-900',
                      ].join(' ')
                    }
                  >
                    <UsersRound className="h-3.5 w-3.5" />
                    Dupla
                  </NavLink>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition-all',
                    isActive
                      ? 'tech-nav-active'
                      : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900 dark:hover:text-brand-200',
                  ].join(' ')
                }
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Alunos</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto px-4 py-6 sm:px-6 sm:py-8 ${dualWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
