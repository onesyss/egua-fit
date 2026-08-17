import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, CircleUser, LogOut, Users, X, UsersRound } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useGym } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { colorForStudent } from '../lib/training'

export function Layout() {
  const { pinned, unpinStudent, setActiveId, cloudStatus, cloudError } = useGym()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const dualWide = location.pathname === '/dupla'

  return (
    <div className="min-h-screen">
      <header className="tech-header sticky top-0 z-50 no-print">
        <div
          className={`mx-auto flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 ${dualWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-3 rounded-lg outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label="Égua Fit — voltar para alunos"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white shadow-sm">
                <Activity className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold tracking-[0.06em] text-brand-800 uppercase sm:text-lg dark:text-brand-200">
                  Égua Fit
                </p>
                <p className="hidden font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase sm:block">
                  personal trainer
                </p>
              </div>
            </Link>

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
            <span
              className="hidden max-w-[280px] font-mono text-[10px] leading-tight tracking-wide sm:inline"
              title={cloudError ?? undefined}
            >
              {cloudStatus === 'ok' && (
                <span className="text-emerald-700 dark:text-emerald-400">Conectado</span>
              )}
              {cloudStatus === 'loading' && (
                <span className="text-ink-muted">Conectando…</span>
              )}
              {cloudStatus === 'saving' && (
                <span className="text-ink-muted">Salvando…</span>
              )}
              {cloudStatus === 'error' && (
                <span className="text-danger">{cloudError}</span>
              )}
              {cloudStatus === 'local' && (
                <span className="text-ink-muted">Local</span>
              )}
            </span>
            <ThemeToggle />
            <NavLink
              to="/perfil"
              title="Meu perfil"
              className={({ isActive }) =>
                [
                  'inline-flex max-w-[180px] items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'tech-nav-active'
                    : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900 dark:hover:text-brand-200',
                ].join(' ')
              }
            >
              <CircleUser className="h-4 w-4 shrink-0" />
              <span className="hidden truncate sm:inline">
                {user?.user_metadata?.full_name || user?.email || 'Perfil'}
              </span>
            </NavLink>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
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
        className={`mx-auto min-w-0 px-3 py-5 sm:px-6 sm:py-8 ${dualWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
