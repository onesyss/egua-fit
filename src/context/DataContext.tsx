import { createContext, useContext, useState, type ReactNode } from 'react'
import { initialData } from '../data/mock'
import type { AppData, Exercise } from '../types'
import { calcIncrease } from '../data/mock'

interface DataContextValue {
  data: AppData
  readOnly: boolean
  addExercise: (exercise: Omit<Exercise, 'id'>) => void
  updateExercise: (id: string, patch: Partial<Exercise>) => void
  removeExercise: (id: string) => void
  updateStudent: (patch: Partial<AppData['student']>) => void
  updatePhysical: (patch: Partial<AppData['physical']>) => void
}

const DataContext = createContext<DataContextValue | null>(null)

function recomputeMetrics(exercises: Exercise[]): AppData['metrics'] {
  const totalLoad = exercises.reduce(
    (acc, e) => acc + e.currentWeight * e.sets * e.repsDone,
    0,
  )
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0)
  const completed = exercises.filter((e) => e.repsDone >= e.reps).length
  const acPercent =
    exercises.length === 0
      ? 0
      : Math.round((completed / exercises.length) * 100)
  const performance =
    exercises.length === 0
      ? 0
      : Math.round(
          exercises.reduce((acc, e) => {
            const repRatio = e.reps > 0 ? Math.min(e.repsDone / e.reps, 1.2) : 0
            const weightBoost = calcIncrease(e.previousWeight, e.currentWeight)
            return acc + repRatio * 100 + Math.min(weightBoost, 20)
          }, 0) / exercises.length,
        )

  return {
    totalLoad: Math.round(totalLoad),
    totalExercises: exercises.length,
    performance: Math.min(performance, 100),
    totalSets,
    acPercent,
    frequency: 4.2,
    energyLevel: 8.5,
  }
}

export function DataProvider({
  children,
  seed,
  readOnly = false,
}: {
  children: ReactNode
  seed?: AppData
  readOnly?: boolean
}) {
  const [data, setData] = useState<AppData>(seed ?? initialData)

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    if (readOnly) return
    setData((prev) => {
      const exercises = [
        ...prev.exercises,
        { ...exercise, id: crypto.randomUUID() },
      ]
      return { ...prev, exercises, metrics: recomputeMetrics(exercises) }
    })
  }

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    if (readOnly) return
    setData((prev) => {
      const exercises = prev.exercises.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      )
      return { ...prev, exercises, metrics: recomputeMetrics(exercises) }
    })
  }

  const removeExercise = (id: string) => {
    if (readOnly) return
    setData((prev) => {
      const exercises = prev.exercises.filter((e) => e.id !== id)
      return { ...prev, exercises, metrics: recomputeMetrics(exercises) }
    })
  }

  const updateStudent = (patch: Partial<AppData['student']>) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      student: { ...prev.student, ...patch },
    }))
  }

  const updatePhysical = (patch: Partial<AppData['physical']>) => {
    if (readOnly) return
    setData((prev) => ({
      ...prev,
      physical: { ...prev.physical, ...patch },
    }))
  }

  return (
    <DataContext.Provider
      value={{
        data,
        readOnly,
        addExercise,
        updateExercise,
        removeExercise,
        updateStudent,
        updatePhysical,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData must be used within DataProvider')
  return ctx
}
