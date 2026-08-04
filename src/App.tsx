import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/Layout'
import { StudentWorkout } from './pages/StudentWorkout'
import { PhysicalEvolution } from './pages/PhysicalEvolution'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { SharedShell } from './pages/SharedShell'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/treino/:shareId" element={<SharedShell />}>
            <Route index element={<StudentWorkout />} />
            <Route path="evolucao" element={<PhysicalEvolution />} />
          </Route>

          <Route
            path="/*"
            element={
              <DataProvider>
                <Routes>
                  <Route element={<Layout />}>
                    <Route index element={<StudentWorkout />} />
                    <Route path="evolucao" element={<PhysicalEvolution />} />
                    <Route path="dashboard" element={<TrainerDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </DataProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
