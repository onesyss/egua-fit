import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  emptyStudentRecord,
  initialStudents,
  recomputeMetrics,
} from '../data/mock'
import type { Exercise, PhysicalRecord, Student, StudentRecord } from '../types'

const STORAGE_KEY = 'egua-fit-personal-students'

interface GymContextValue {
  students: StudentRecord[]
  activeId: string | null
  active: StudentRecord | null
  /** @deprecated use active */
  data: StudentRecord
  readOnly: boolean
  setActiveId: (id: string | null) => void
  createStudent: (input: {
    name: string
    email?: string
    phone?: string
    enrollmentDate?: string
  }) => string
  removeStudent: (id: string) => void
  updateStudent: (patch: Partial<Student>, studentId?: string) => void
  updatePhysical: (patch: Partial<PhysicalRecord>, studentId?: string) => void
  updateMetricsMeta: (
    patch: Partial<Pick<StudentRecord['metrics'], 'frequency' | 'energyLevel'>>,
    studentId?: string,
  ) => void
  addExercise: (exercise: Omit<Exercise, 'id'>, studentId?: string) => void
  updateExercise: (
    id: string,
    patch: Partial<Exercise>,
    studentId?: string,
  ) => void
  removeExercise: (id: string, studentId?: string) => void
}

const GymContext = createContext<GymContextValue | null>(null)

function loadStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(initialStudents)
    const parsed = JSON.parse(raw) as StudentRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return structuredClone(initialStudents)
    }
    return parsed
  } catch {
    return structuredClone(initialStudents)
  }
}

function withMetrics(record: StudentRecord): StudentRecord {
  return {
    ...record,
    metrics: recomputeMetrics(
      record.exercises,
      record.metrics.frequency,
      record.metrics.energyLevel,
    ),
  }
}

export function DataProvider({
  children,
  seed,
  readOnly = false,
}: {
  children: ReactNode
  seed?: StudentRecord
  readOnly?: boolean
}) {
  const [students, setStudents] = useState<StudentRecord[]>(() =>
    seed ? [seed] : loadStudents(),
  )
  const [activeId, setActiveId] = useState<string | null>(
    () => seed?.student.id ?? students[0]?.student.id ?? null,
  )

  useEffect(() => {
    if (seed || readOnly) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
  }, [students, seed, readOnly])

  const active = useMemo(
    () => students.find((s) => s.student.id === activeId) ?? students[0] ?? null,
    [students, activeId],
  )

  const patchRecord = useCallback(
    (studentId: string | undefined, updater: (r: StudentRecord) => StudentRecord) => {
      if (readOnly) return
      const id = studentId ?? activeId
      if (!id) return
      setStudents((prev) =>
        prev.map((r) => (r.student.id === id ? withMetrics(updater(r)) : r)),
      )
    },
    [activeId, readOnly],
  )

  const createStudent = useCallback(
    (input: {
      name: string
      email?: string
      phone?: string
      enrollmentDate?: string
    }) => {
      const record = emptyStudentRecord(input.name.trim() || 'Novo aluno')
      record.student.email = input.email?.trim() || undefined
      record.student.phone = input.phone?.trim() || undefined
      if (input.enrollmentDate) {
        record.student.enrollmentDate = input.enrollmentDate
      }
      setStudents((prev) => [...prev, record])
      setActiveId(record.student.id)
      return record.student.id
    },
    [],
  )

  const removeStudent = useCallback((id: string) => {
    setStudents((prev) => {
      const next = prev.filter((s) => s.student.id !== id)
      return next
    })
    setActiveId((curr) => (curr === id ? null : curr))
  }, [])

  const updateStudent = useCallback(
    (patch: Partial<Student>, studentId?: string) => {
      patchRecord(studentId, (r) => {
        const student = { ...r.student, ...patch }
        if (patch.name) {
          student.avatarInitials = patch.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? '')
            .join('') || 'AL'
        }
        return { ...r, student }
      })
    },
    [patchRecord],
  )

  const updatePhysical = useCallback(
    (patch: Partial<PhysicalRecord>, studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        physical: { ...r.physical, ...patch },
      }))
    },
    [patchRecord],
  )

  const updateMetricsMeta = useCallback(
    (
      patch: Partial<Pick<StudentRecord['metrics'], 'frequency' | 'energyLevel'>>,
      studentId?: string,
    ) => {
      patchRecord(studentId, (r) => ({
        ...r,
        metrics: { ...r.metrics, ...patch },
      }))
    },
    [patchRecord],
  )

  const addExercise = useCallback(
    (exercise: Omit<Exercise, 'id'>, studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        exercises: [...r.exercises, { ...exercise, id: crypto.randomUUID() }],
      }))
    },
    [patchRecord],
  )

  const updateExercise = useCallback(
    (id: string, patch: Partial<Exercise>, studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        exercises: r.exercises.map((e) =>
          e.id === id ? { ...e, ...patch } : e,
        ),
      }))
    },
    [patchRecord],
  )

  const removeExercise = useCallback(
    (id: string, studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        exercises: r.exercises.filter((e) => e.id !== id),
      }))
    },
    [patchRecord],
  )

  const fallbackEmpty = emptyStudentRecord('—')

  const value: GymContextValue = {
    students,
    activeId: active?.student.id ?? null,
    active,
    data: active ?? fallbackEmpty,
    readOnly,
    setActiveId,
    createStudent,
    removeStudent,
    updateStudent,
    updatePhysical,
    updateMetricsMeta,
    addExercise,
    updateExercise,
    removeExercise,
  }

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>
}

export function useAppData() {
  const ctx = useContext(GymContext)
  if (!ctx) throw new Error('useAppData must be used within DataProvider')
  return ctx
}

export function useGym() {
  return useAppData()
}
