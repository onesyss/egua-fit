import type {
  Anamnesis,
  Exercise,
  MuscleGroup,
  PersonalRecord,
  SessionClock,
  Student,
  WorkoutExerciseLog,
  WorkoutSession,
} from '../types'

export function calcIncrease(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export const STUDENT_COLORS = [
  '#2c4566',
  '#b33a3a',
  '#0f766e',
  '#b45309',
  '#6d28d9',
  '#9f1239',
  '#166534',
  '#1d4ed8',
  '#854d0e',
  '#334155',
] as const

export function colorForStudent(student: Pick<Student, 'id' | 'color'>): string {
  if (student.color) return student.color
  let hash = 0
  for (const ch of student.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return STUDENT_COLORS[hash % STUDENT_COLORS.length]
}

export function emptyAnamnesis(): Anamnesis {
  return {
    goal: '',
    injuries: '',
    limitations: '',
    experience: 'iniciante',
    sleepHours: 7,
    stress: 5,
    occupation: '',
    medicalNotes: '',
    bloodPressure: '',
    restingHr: 0,
    weightKg: 0,
    heightCm: 0,
    bodyFat: 0,
    availabilityPerWeek: 3,
    notes: '',
    trainingFocus: '',
    weeklyStructure: '',
    methods: '',
    progression: '',
  }
}

export function emptyClock(): SessionClock {
  return {
    startedAt: null,
    accumulatedSec: 0,
    running: false,
    workAccumulatedSec: 0,
    workRunning: false,
    workStartedAt: null,
  }
}

export function exerciseVolumeKg(ex: Exercise): number {
  if (ex.muscleGroup === 'Cardio') return 0
  return ex.currentWeight * ex.sets * ex.repsDone
}

export function programVolumeKg(exercises: Exercise[]): number {
  return Math.round(exercises.reduce((acc, e) => acc + exerciseVolumeKg(e), 0) * 100) / 100
}

/** Tempo de trabalho estimado: ~2.5s de tensão por repetição realizada */
export function estimatedWorkSec(exercises: Exercise[]): number {
  return exercises.reduce((acc, e) => {
    if (e.muscleGroup === 'Cardio') {
      return acc + cardioMinutes(e) * 60
    }
    return acc + e.sets * e.repsDone * 2.5
  }, 0)
}

export function isTreadmillName(name: string): boolean {
  return /esteira|treadmill/i.test(name.trim())
}

export function cardioMinutes(ex: Pick<Exercise, 'muscleGroup' | 'durationMin' | 'sets'>): number {
  if (ex.muscleGroup !== 'Cardio') return 0
  if (ex.durationMin && ex.durationMin > 0) return ex.durationMin
  return ex.sets > 0 ? ex.sets : 0
}

export function formatExerciseDose(ex: Exercise): string {
  if (ex.muscleGroup === 'Cardio') {
    const parts = [`${cardioMinutes(ex)} min`]
    if (ex.incline != null) {
      parts.push(`${ex.incline}% incl.`)
    }
    return parts.join(' · ')
  }
  return `${ex.sets}×${ex.reps}`
}

export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function liveElapsed(clock: SessionClock, now = Date.now()): number {
  const extra = clock.running && clock.startedAt ? (now - Date.parse(clock.startedAt)) / 1000 : 0
  return clock.accumulatedSec + extra
}

export function liveWorkElapsed(clock: SessionClock, now = Date.now()): number {
  const extra =
    clock.workRunning && clock.workStartedAt
      ? (now - Date.parse(clock.workStartedAt)) / 1000
      : 0
  return clock.workAccumulatedSec + extra
}

export function musclesWorked(exercises: Exercise[]): { group: MuscleGroup; volumeKg: number; sets: number }[] {
  const map = new Map<MuscleGroup, { volumeKg: number; sets: number }>()
  for (const e of exercises) {
    const cur = map.get(e.muscleGroup) ?? { volumeKg: 0, sets: 0 }
    cur.volumeKg += exerciseVolumeKg(e)
    cur.sets += e.sets
    map.set(e.muscleGroup, cur)
  }
  return [...map.entries()]
    .map(([group, v]) => ({ group, ...v }))
    .sort((a, b) => b.volumeKg - a.volumeKg || b.sets - a.sets)
}

export function bmi(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm) return null
  const m = heightCm / 100
  return Number((weightKg / (m * m)).toFixed(1))
}

export function snapshotSession(
  exercises: Exercise[],
  previous: WorkoutSession | undefined,
  clock: SessionClock,
  records: PersonalRecord[],
): { session: WorkoutSession; records: PersonalRecord[] } {
  const logs: WorkoutExerciseLog[] = exercises.map((e) => {
    const volumeKg = exerciseVolumeKg(e)
    const prevRecord = records.find((r) => r.exerciseName === e.name)
    const isPr =
      e.currentWeight > 0 &&
      (prevRecord ? e.currentWeight > prevRecord.weight || volumeKg > prevRecord.volumeKg : true)
    return {
      exerciseId: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup,
      sets: e.sets,
      reps: e.reps,
      repsDone: e.repsDone,
      weight: e.currentWeight,
      volumeKg,
      previousWeight: e.previousWeight,
      increasePercent: calcIncrease(e.previousWeight, e.currentWeight),
      isPr,
    }
  })

  const volumeKg = Math.round(logs.reduce((a, e) => a + e.volumeKg, 0) * 100) / 100
  const volumeChangePercent = previous
    ? calcIncrease(previous.volumeKg, volumeKg)
    : 0

  const session: WorkoutSession = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    exercises: logs,
    volumeKg,
    volumeChangePercent,
    sessionDurationSec: Math.round(liveElapsed(clock)),
    workDurationSec: Math.round(Math.max(liveWorkElapsed(clock), estimatedWorkSec(exercises))),
  }

  const nextRecords = [...records]
  for (const log of logs) {
    if (log.weight <= 0) continue
    const idx = nextRecords.findIndex((r) => r.exerciseName === log.name)
    const candidate: PersonalRecord = {
      exerciseName: log.name,
      weight: log.weight,
      volumeKg: log.volumeKg,
      date: session.date,
    }
    if (idx < 0) nextRecords.push(candidate)
    else if (
      candidate.weight > nextRecords[idx].weight ||
      candidate.volumeKg > nextRecords[idx].volumeKg
    ) {
      nextRecords[idx] = candidate
    }
  }

  return { session, records: nextRecords }
}

export function historyVolumePoints(history: WorkoutSession[]) {
  return history.map((s, i) => ({
    label: `T${i + 1}`,
    date: s.date.slice(0, 10),
    volume: s.volumeKg,
    change: s.volumeChangePercent,
  }))
}

export function isPrNow(ex: Exercise, records: PersonalRecord[]): boolean {
  if (ex.currentWeight <= 0) return false
  const rec = records.find((r) => r.exerciseName === ex.name)
  if (!rec) return true
  return ex.currentWeight > rec.weight || exerciseVolumeKg(ex) > rec.volumeKg
}
