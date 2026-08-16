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
import type {
  Anamnesis,
  Assessment,
  Exercise,
  PhysicalRecord,
  Student,
  StudentRecord,
} from '../types'
import {
  emptyAnamnesis,
  emptyClock,
  liveElapsed,
  liveWorkElapsed,
  snapshotSession,
  STUDENT_COLORS,
} from '../lib/training'
import { mergeAssessment } from '../lib/assessment'

const STORAGE_KEY = 'egua-fit-personal-students'
const PIN_KEY = 'equafit-pinned-students'

interface GymContextValue {
  students: StudentRecord[]
  activeId: string | null
  active: StudentRecord | null
  pinnedIds: string[]
  pinned: StudentRecord[]
  /** @deprecated use active */
  data: StudentRecord
  readOnly: boolean
  setActiveId: (id: string | null) => void
  pinStudent: (id: string) => void
  unpinStudent: (id: string) => void
  createStudent: (input: {
    name: string
    email?: string
    phone?: string
    enrollmentDate?: string
  }) => string
  removeStudent: (id: string) => void
  updateStudent: (patch: Partial<Student>, studentId?: string) => void
  updatePhysical: (patch: Partial<PhysicalRecord>, studentId?: string) => void
  updateAnamnesis: (patch: Partial<Anamnesis>, studentId?: string) => void
  updateAssessment: (patch: Partial<Assessment>, studentId?: string) => void
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
  saveWorkout: (studentId?: string) => void
  startSession: (studentId?: string) => void
  pauseSession: (studentId?: string) => void
  resetSession: (studentId?: string) => void
  startWork: (studentId?: string) => void
  pauseWork: (studentId?: string) => void
}

const GymContext = createContext<GymContextValue | null>(null)

function migrateRecord(raw: StudentRecord, index: number): StudentRecord {
  const student = raw.student ?? ({} as Student)
  return {
    ...raw,
    student: {
      ...student,
      color:
        student.color ||
        STUDENT_COLORS[index % STUDENT_COLORS.length],
    },
    history: raw.history ?? [],
    personalRecords: raw.personalRecords ?? [],
    anamnesis: { ...emptyAnamnesis(), ...raw.anamnesis },
    assessment: mergeAssessment(raw.assessment),
    sessionClock: raw.sessionClock ?? emptyClock(),
  }
}

function loadStudents(): StudentRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return structuredClone(initialStudents)
    const parsed = JSON.parse(stored) as StudentRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return structuredClone(initialStudents)
    }
    return parsed.map(migrateRecord)
  } catch {
    return structuredClone(initialStudents)
  }
}

function loadPinned(validIds: Set<string>): string[] {
  try {
    const raw = localStorage.getItem(PIN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return parsed.filter((id) => validIds.has(id)).slice(0, 2)
  } catch {
    return []
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

function nextColor(existing: StudentRecord[]): string {
  const used = new Set(existing.map((s) => s.student.color))
  return (
    STUDENT_COLORS.find((c) => !used.has(c)) ??
    STUDENT_COLORS[existing.length % STUDENT_COLORS.length]
  )
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
  const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
    seed ? [seed.student.id] : loadPinned(new Set(students.map((s) => s.student.id))),
  )

  useEffect(() => {
    if (seed || readOnly) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
  }, [students, seed, readOnly])

  useEffect(() => {
    if (seed || readOnly) return
    localStorage.setItem(PIN_KEY, JSON.stringify(pinnedIds))
  }, [pinnedIds, seed, readOnly])

  const active = useMemo(
    () => students.find((s) => s.student.id === activeId) ?? students[0] ?? null,
    [students, activeId],
  )

  const pinned = useMemo(
    () =>
      pinnedIds
        .map((id) => students.find((s) => s.student.id === id))
        .filter((s): s is StudentRecord => Boolean(s)),
    [pinnedIds, students],
  )

  const pinStudent = useCallback((id: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      return next.length > 2 ? next.slice(-2) : next
    })
  }, [])

  const unpinStudent = useCallback((id: string) => {
    setPinnedIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const setActiveAndPin = useCallback(
    (id: string | null) => {
      setActiveId(id)
      if (id) pinStudent(id)
    },
    [pinStudent],
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
      setStudents((prev) => {
        record.student.color = nextColor(prev)
        return [...prev, record]
      })
      setActiveId(record.student.id)
      pinStudent(record.student.id)
      return record.student.id
    },
    [pinStudent],
  )

  const removeStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.student.id !== id))
    setPinnedIds((prev) => prev.filter((x) => x !== id))
    setActiveId((curr) => (curr === id ? null : curr))
  }, [])

  const updateStudent = useCallback(
    (patch: Partial<Student>, studentId?: string) => {
      patchRecord(studentId, (r) => {
        const student = { ...r.student, ...patch }
        if (patch.name) {
          student.avatarInitials =
            patch.name
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

  const updateAnamnesis = useCallback(
    (patch: Partial<Anamnesis>, studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        anamnesis: {
          ...r.anamnesis,
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      }))
    },
    [patchRecord],
  )

  const updateAssessment = useCallback(
    (patch: Partial<Assessment>, studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        assessment: mergeAssessment({
          ...r.assessment,
          ...patch,
          parQ: { ...r.assessment.parQ, ...patch.parQ },
          deepSquat: { ...r.assessment.deepSquat, ...patch.deepSquat },
          simpleMovements: {
            ...r.assessment.simpleMovements,
            ...patch.simpleMovements,
          },
          shoulderFlexion: {
            ...r.assessment.shoulderFlexion,
            ...patch.shoulderFlexion,
          },
          shoulderRotation: {
            ...r.assessment.shoulderRotation,
            ...patch.shoulderRotation,
          },
          shoulderExtension: {
            ...r.assessment.shoulderExtension,
            ...patch.shoulderExtension,
          },
          activeLegRaise: {
            ...r.assessment.activeLegRaise,
            ...patch.activeLegRaise,
          },
          updatedAt: new Date().toISOString(),
        }),
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

  const saveWorkout = useCallback(
    (studentId?: string) => {
      patchRecord(studentId, (r) => {
        const previous = r.history[r.history.length - 1]
        const { session, records } = snapshotSession(
          r.exercises,
          previous,
          r.sessionClock,
          r.personalRecords,
        )
        return {
          ...r,
          history: [...r.history, session],
          personalRecords: records,
          sessionClock: emptyClock(),
        }
      })
    },
    [patchRecord],
  )

  const startSession = useCallback(
    (studentId?: string) => {
      patchRecord(studentId, (r) => {
        if (r.sessionClock.running) return r
        return {
          ...r,
          sessionClock: {
            ...r.sessionClock,
            running: true,
            startedAt: new Date().toISOString(),
          },
        }
      })
    },
    [patchRecord],
  )

  const pauseSession = useCallback(
    (studentId?: string) => {
      patchRecord(studentId, (r) => {
        const now = Date.now()
        return {
          ...r,
          sessionClock: {
            ...r.sessionClock,
            running: false,
            startedAt: null,
            accumulatedSec: liveElapsed(r.sessionClock, now),
            workRunning: false,
            workStartedAt: null,
            workAccumulatedSec: liveWorkElapsed(r.sessionClock, now),
          },
        }
      })
    },
    [patchRecord],
  )

  const resetSession = useCallback(
    (studentId?: string) => {
      patchRecord(studentId, (r) => ({
        ...r,
        sessionClock: emptyClock(),
      }))
    },
    [patchRecord],
  )

  const startWork = useCallback(
    (studentId?: string) => {
      patchRecord(studentId, (r) => {
        const now = new Date().toISOString()
        const clock = r.sessionClock
        return {
          ...r,
          sessionClock: {
            ...clock,
            running: true,
            startedAt: clock.running && clock.startedAt ? clock.startedAt : now,
            workRunning: true,
            workStartedAt: now,
          },
        }
      })
    },
    [patchRecord],
  )

  const pauseWork = useCallback(
    (studentId?: string) => {
      patchRecord(studentId, (r) => {
        if (!r.sessionClock.workRunning) return r
        return {
          ...r,
          sessionClock: {
            ...r.sessionClock,
            workRunning: false,
            workStartedAt: null,
            workAccumulatedSec: liveWorkElapsed(r.sessionClock),
          },
        }
      })
    },
    [patchRecord],
  )

  const fallbackEmpty = emptyStudentRecord('—')

  const value: GymContextValue = {
    students,
    activeId: active?.student.id ?? null,
    active,
    pinnedIds,
    pinned,
    data: active ?? fallbackEmpty,
    readOnly,
    setActiveId: setActiveAndPin,
    pinStudent,
    unpinStudent,
    createStudent,
    removeStudent,
    updateStudent,
    updatePhysical,
    updateAnamnesis,
    updateAssessment,
    updateMetricsMeta,
    addExercise,
    updateExercise,
    removeExercise,
    saveWorkout,
    startSession,
    pauseSession,
    resetSession,
    startWork,
    pauseWork,
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
