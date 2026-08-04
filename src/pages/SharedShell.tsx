import { NavLink, Navigate, Outlet, useParams } from 'react-router-dom'
import { Activity, Dumbbell, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { DataProvider } from '../context/DataContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { resolveShare } from '../lib/share'

export function SharedShell() {
  const { shareId } = useParams()
  const share = useMemo(
    () => resolveShare(shareId, window.location.hash),
    [shareId],
  )

  if (!share) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="tech-panel max-w-md p-8 text-center">
          <p className="tech-label text-brand-600 dark:text-brand-300">
            link inválido
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            Treino não encontrado
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Este link expirou, é inválido ou foi gerado em outro dispositivo sem
            payload portátil. Peça um novo link ao seu professor.
          </p>
        </div>
      </div>
    )
  }

  const base = `/treino/${share.id}`

  return (
    <DataProvider seed={share.data} readOnly>
      <div className="min-h-screen">
        <header className="tech-header sticky top-0 z-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white shadow-sm">
                <Activity className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-display text-lg font-bold tracking-[0.08em] text-brand-700 uppercase dark:text-brand-300">
                  Égua Fit
                </p>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-muted uppercase">
                  acesso aluno · {share.data.student.name.split(' ')[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <nav className="flex items-center gap-1">
                <NavLink
                  to={base}
                  end
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
                      isActive
                        ? 'tech-nav-active'
                        : 'text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-900',
                    ].join(' ')
                  }
                >
                  <Dumbbell className="h-4 w-4" />
                  <span className="hidden sm:inline">Meu treino</span>
                </NavLink>
                <NavLink
                  to={`${base}/evolucao`}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
                      isActive
                        ? 'tech-nav-active'
                        : 'text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-900',
                    ].join(' ')
                  }
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Evolução</span>
                </NavLink>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </DataProvider>
  )
}

export function SharedRedirect() {
  return <Navigate to=".." relative="path" replace />
}
