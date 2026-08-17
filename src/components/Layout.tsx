import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, CircleUser, LogOut, Users, X, UsersRound } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useGym } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { colorForStudent } from '../lib/training'

const iconBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900 dark:hover:text-brand-200'

export function Layout() {
  const { pinned, unpinStudent, setActiveId, cloudStatus, cloudError } = useGym()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const dualWide = location.pathname === '/dupla'
  const cloudLabel =
    cloudStatus === 'ok'
      ? 'Conectado'
      : cloudStatus === 'loading'
        ? 'Conectando…'
        : cloudStatus === 'saving'
          ? 'Salvando…'
          : cloudStatus === 'error'
            ? cloudError
            : 'Local'

  return (
    <div className="min-h-screen">
      <header className="tech-header sticky top-0 z-50 no-print">
        <div
          className={`mx-auto min-w-0 px-3 py-2 sm:px-6 sm:py-3 ${dualWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2 rounded-lg outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-400 sm:gap-3"
              aria-label="Égua Fit — voltar para alunos"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white shadow-sm">
                <Activity className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold tracking-[0.06em] text-brand-800 uppercase sm:text-lg dark:text-brand-200">
                  Égua Fit
                </p>
                <p className="hidden font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase sm:block">
                  personal trainer
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
              <span
                className="hidden max-w-[280px] font-mono text-[10px] leading-tight tracking-wide sm:inline"
                title={cloudError ?? undefined}
              >
                {cloudStatus === 'ok' && (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Conectado
                  </span>
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
              <span
                className={`h-2 w-2 shrink-0 rounded-full sm:hidden ${
                  cloudStatus === 'ok'
                    ? 'bg-emerald-500'
                    : cloudStatus === 'error'
                      ? 'bg-danger'
                      : cloudStatus === 'saving' || cloudStatus === 'loading'
                        ? 'bg-amber-400'
                        : 'bg-slate-400'
                }`}
                title={cloudLabel ?? undefined}
              />
              <ThemeToggle />
              <NavLink
                to="/perfil"
                title="Meu perfil"
                className={({ isActive }) =>
                  [
                    iconBtn,
                    'sm:h-auto sm:w-auto sm:max-w-[180px] sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-sm sm:font-semibold',
                    isActive
                      ? 'tech-nav-active'
                      : '',
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
                className={`${iconBtn} sm:h-auto sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-sm sm:font-semibold`}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
              <NavLink
                to="/"
                end
                title="Alunos"
                className={({ isActive }) =>
                  [
                    iconBtn,
                    'sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:font-semibold',
                    isActive ? 'tech-nav-active' : '',
                  ].join(' ')
                }
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Alunos</span>
              </NavLink>
            </div>
          </div>

          {pinned.length > 0 && (
            <div className="-mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {pinned.map((s) => {
                const color = colorForStudent(s.student)
                return (
                  <NavLink
                    key={s.student.id}
                    to={`/aluno/${s.student.id}`}
                    onClick={() => setActiveId(s.student.id)}
                    className={({ isActive }) =>
                      [
                        'flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                        isActive
                          ? 'bg-white shadow-sm dark:bg-slate-900'
                          : 'border-transparent bg-brand-50/70 dark:bg-slate-900/70',
                      ].join(' ')
                    }
                    style={{ borderColor: color }}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="max-w-[7rem] truncate" style={{ color }}>
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
                      'inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold',
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
      </header>

      <main
        className={`mx-auto min-w-0 px-3 py-5 sm:px-6 sm:py-8 ${dualWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
