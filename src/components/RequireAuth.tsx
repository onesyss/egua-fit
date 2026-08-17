import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DataProvider } from '../context/DataContext'

export function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm text-ink-muted">Carregando…</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <DataProvider key={session.user.id} userId={session.user.id}>
      <Outlet />
    </DataProvider>
  )
}
