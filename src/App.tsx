import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { StudentsPanel } from './pages/StudentsPanel'
import { PerformanceDashboard } from './pages/PerformanceDashboard'
import { PhysicalEvolution } from './pages/PhysicalEvolution'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { ProtocolPage } from './pages/ProtocolPage'
import { ReportPage } from './pages/ReportPage'
import { DualSession } from './pages/DualSession'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route index element={<StudentsPanel />} />
                <Route path="perfil" element={<ProfilePage />} />
                <Route path="dupla" element={<DualSession />} />
                <Route path="aluno/:studentId" element={<PerformanceDashboard />} />
                <Route
                  path="aluno/:studentId/treino"
                  element={<TrainerDashboard />}
                />
                <Route
                  path="aluno/:studentId/evolucao"
                  element={<PhysicalEvolution />}
                />
                <Route
                  path="aluno/:studentId/protocolo"
                  element={<ProtocolPage />}
                />
                <Route
                  path="aluno/:studentId/relatorio"
                  element={<ReportPage />}
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
