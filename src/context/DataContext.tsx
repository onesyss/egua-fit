import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  emptyStudentRecord,
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
import { supabaseConfigured } from '../lib/supabase'
import {
  fetchStudentRecords,
  syncStudentRecords,
  cloudErrorHint,
} from '../lib/supabaseStudents'

const STORAGE_KEY = 'egua-fit-personal-students'
const PIN_KEY = 'equafit-pinned-students'

export type CloudStatus = 'local' | 'loading' | 'saving' | 'ok' | 'error'

interface GymContextValue {
  students: StudentRecord[]
  activeId: string | null
  active: StudentRecord | null
  pinnedIds: string[]
  pinned: StudentRecord[]
  cloudStatus: CloudStatus
  cloudError: string | null
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

function loadStudents(userId?: string): StudentRecord[] {
  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const parsed = JSON.parse(stored) as StudentRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    return parsed.map(migrateRecord)
  } catch {
    return []
  }
}

function loadPinned(userId: string | undefined, validIds: Set<string>): string[] {
  try {
    const key = userId ? `${PIN_KEY}:${userId}` : PIN_KEY
    const raw = localStorage.getItem(key)
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
  userId,
}: {
  children: ReactNode
  seed?: StudentRecord
  readOnly?: boolean
  userId?: string
}) {
  const [students, setStudents] = useState<StudentRecord[]>(() =>
    seed ? [seed] : loadStudents(userId),
  )
  const [activeId, setActiveId] = useState<string | null>(
    () => seed?.student.id ?? students[0]?.student.id ?? null,
  )
  const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
    seed
      ? [seed.student.id]
      : loadPinned(userId, new Set(students.map((s) => s.student.id))),
  )
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(() =>
    seed || readOnly || !supabaseConfigured || !userId ? 'local' : 'loading',
  )
  const [cloudError, setCloudError] = useState<string | null>(null)
  const cloudReady = useRef(seed || readOnly || !supabaseConfigured || !userId)
  const skipNextSync = useRef(true)
  const studentsRef = useRef(students)
  studentsRef.current = students

  useEffect(() => {
    if (seed || readOnly || !supabaseConfigured || !userId) return
    let cancelled = false
    setCloudStatus('loading')
    skipNextSync.current = true
    fetchStudentRecords(userId)
      .then(async (remote) => {
        if (cancelled) return
        cloudReady.current = true
        if (remote.length > 0) {
          const migrated = remote.map(migrateRecord)
          skipNextSync.current = true
          setStudents(migrated)
          setActiveId((curr) =>
            migrated.some((s) => s.student.id === curr)
              ? curr
              : migrated[0]?.student.id ?? null,
          )
          setCloudStatus('ok')
          setCloudError(null)
          return
        }

        const local = studentsRef.current
        if (local.length > 0) {
          skipNextSync.current = false
          setCloudStatus('saving')
          try {
            await syncStudentRecords(local, userId)
            if (cancelled) return
            setCloudStatus('ok')
            setCloudError(null)
          } catch (err: unknown) {
            if (cancelled) return
            setCloudStatus('error')
            setCloudError(cloudErrorHint(err, 'Falha ao salvar no Supabase'))
          }
          return
        }

        skipNextSync.current = false
        setCloudStatus('ok')
        setCloudError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        skipNextSync.current = false
        cloudReady.current = true
        setCloudStatus('error')
        setCloudError(cloudErrorHint(err, 'Falha ao conectar no Supabase'))
      })
    return () => {
      cancelled = true
    }
  }, [seed, readOnly, userId])

  useEffect(() => {
    if (seed || readOnly) return
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    localStorage.setItem(key, JSON.stringify(students))
  }, [students, seed, readOnly, userId])

  useEffect(() => {
    if (seed || readOnly || !supabaseConfigured || !userId || !cloudReady.current) {
      return
    }
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    setCloudStatus('saving')
    const t = window.setTimeout(() => {
      syncStudentRecords(students, userId)
        .then(() => {
          setCloudStatus('ok')
          setCloudError(null)
        })
        .catch((err: unknown) => {
          setCloudStatus('error')
          setCloudError(cloudErrorHint(err, 'Falha ao salvar no Supabase'))
        })
    }, 500)
    return () => window.clearTimeout(t)
  }, [students, seed, readOnly, userId])

  useEffect(() => {
    if (seed || readOnly || !supabaseConfigured || !userId) return
    const flush = () => {
      if (!cloudReady.current) return
      void syncStudentRecords(studentsRef.current, userId).catch(() => {})
    }
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
    }
  }, [seed, readOnly, userId])

  useEffect(() => {
    if (seed || readOnly) return
    const key = userId ? `${PIN_KEY}:${userId}` : PIN_KEY
    localStorage.setItem(key, JSON.stringify(pinnedIds))
  }, [pinnedIds, seed, readOnly, userId])

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
    cloudStatus,
    cloudError,
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
