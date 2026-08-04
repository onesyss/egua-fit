import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/Layout'
import { StudentsPanel } from './pages/StudentsPanel'
import { PerformanceDashboard } from './pages/PerformanceDashboard'
import { PhysicalEvolution } from './pages/PhysicalEvolution'
import { TrainerDashboard } from './pages/TrainerDashboard'

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<StudentsPanel />} />
              <Route path="aluno/:studentId" element={<PerformanceDashboard />} />
              <Route
                path="aluno/:studentId/treino"
                element={<TrainerDashboard />}
              />
              <Route
                path="aluno/:studentId/evolucao"
                element={<PhysicalEvolution />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  )
}
