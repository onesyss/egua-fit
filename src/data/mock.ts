import type {
  Exercise,
  MuscleGroup,
  PerformanceMetrics,
  PhysicalRecord,
  EvolutionSeries,
  StudentRecord,
  Student,
} from '../types'
import {
  calcIncrease,
  emptyAnamnesis,
  emptyClock,
  STUDENT_COLORS,
} from '../lib/training'
import { emptyAssessment } from '../lib/assessment'

export const muscleGroups: MuscleGroup[] = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Abdômen',
  'Cardio',
]

export { calcIncrease } from '../lib/training'

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function recomputeMetrics(
  exercises: Exercise[],
  frequency = 4,
  energyLevel = 8,
): PerformanceMetrics {
  const totalLoad = exercises.reduce(
    (acc, e) => acc + e.currentWeight * e.sets * e.repsDone,
    0,
  )
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0)
  const plannedReps = exercises.reduce((acc, e) => acc + e.sets * e.reps, 0)
  const doneReps = exercises.reduce((acc, e) => acc + e.sets * e.repsDone, 0)
  const acPercent =
    plannedReps === 0 ? 0 : Math.round((doneReps / plannedReps) * 100)

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
    totalLoad: Math.round(totalLoad * 100) / 100,
    totalExercises: exercises.length,
    performance: Math.min(performance, 100),
    totalSets,
    acPercent: Math.min(acPercent, 100),
    frequency,
    energyLevel,
  }
}

export function energyLabel(level: number): string {
  if (level >= 8) return 'Alta'
  if (level >= 5) return 'Média'
  return 'Baixa'
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || 'AL'
  )
}

const defaultPhysical: PhysicalRecord = {
  record1km: '',
  record1kmSeconds: 0,
  timeReduction1km: '',
  timeReductionSeconds: 0,
  maxTreadmillSpeed: 0,
  maxAbsAverage: 0,
  plankRecord: '',
  plankSeconds: 0,
}

const defaultEvolution: EvolutionSeries = {
  runningTime: [],
  absAverage: [],
  plank: [],
  load: [],
  performance: [],
  repsSessions: [],
}

function makeStudent(
  base: Omit<Student, 'avatarInitials' | 'color'> & {
    avatarInitials?: string
    color?: string
  },
  exercises: Exercise[],
  extras?: Partial<
    Pick<
      StudentRecord,
      | 'physical'
      | 'evolution'
      | 'metrics'
      | 'history'
      | 'anamnesis'
      | 'assessment'
      | 'weightLogs'
    >
  >,
): StudentRecord {
  const student: Student = {
    ...base,
    avatarInitials: base.avatarInitials ?? initials(base.name),
    color: base.color ?? STUDENT_COLORS[0],
  }
  const metrics =
    extras?.metrics ??
    recomputeMetrics(exercises, 4, extras?.metrics?.energyLevel ?? 8.5)
  return {
    student,
    exercises,
    metrics: {
      ...metrics,
      frequency: extras?.metrics?.frequency ?? 4,
      energyLevel: extras?.metrics?.energyLevel ?? 8.5,
    },
    physical: extras?.physical ?? { ...defaultPhysical },
    evolution: extras?.evolution ?? structuredClone(defaultEvolution),
    history: extras?.history ?? [],
    personalRecords: exercises
      .filter((e) => e.previousWeight > 0)
      .map((e) => ({
        exerciseName: e.name,
        weight: e.previousWeight,
        volumeKg: e.previousWeight * e.sets * e.repsDone,
        date: base.enrollmentDate,
      })),
    anamnesis: extras?.anamnesis ?? emptyAnamnesis(),
    assessment: extras?.assessment ?? emptyAssessment(),
    weightLogs: extras?.weightLogs ?? [],
    sessionClock: emptyClock(),
  }
}

export function emptyStudentRecord(name = 'Novo aluno'): StudentRecord {
  return makeStudent(
    {
      id: crypto.randomUUID(),
      name,
      enrollmentDate: new Date().toISOString().slice(0, 10),
      daysAccompanied: 0,
    },
    [],
    {
      metrics: {
        totalLoad: 0,
        totalExercises: 0,
        performance: 0,
        totalSets: 0,
        acPercent: 0,
        frequency: 0,
        energyLevel: 5,
      },
    },
  )
}

export function isFictionalStudent(record: { student: { id: string; name: string } }): boolean {
  const id = record.student.id
  const name = record.student.name.trim()
  return (
    id === '1' ||
    id === '2' ||
    /^(Ana Clara Mendes|Carlos Eduardo Lima)$/i.test(name)
  )
}
