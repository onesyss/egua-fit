import type {
  Exercise,
  MuscleGroup,
  PerformanceMetrics,
  PhysicalRecord,
  EvolutionSeries,
  StudentRecord,
  Student,
  WorkoutSession,
} from '../types'
import {
  calcIncrease,
  emptyAnamnesis,
  emptyClock,
  exerciseVolumeKg,
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
  record1km: '05:30',
  record1kmSeconds: 330,
  timeReduction1km: '-00:00',
  timeReductionSeconds: 0,
  maxTreadmillSpeed: 10,
  maxAbsAverage: 20,
  plankRecord: '00:45',
  plankSeconds: 45,
}

const defaultEvolution: EvolutionSeries = {
  runningTime: [
    { month: 'Jan', value: 360 },
    { month: 'Fev', value: 350 },
    { month: 'Mar', value: 340 },
    { month: 'Abr', value: 335 },
    { month: 'Mai', value: 330 },
    { month: 'Jun', value: 330 },
  ],
  absAverage: [
    { month: 'Jan', value: 15 },
    { month: 'Fev', value: 16 },
    { month: 'Mar', value: 18 },
    { month: 'Abr', value: 18 },
    { month: 'Mai', value: 20 },
    { month: 'Jun', value: 20 },
  ],
  plank: [
    { month: 'Jan', value: 30 },
    { month: 'Fev', value: 35 },
    { month: 'Mar', value: 40 },
    { month: 'Abr', value: 42 },
    { month: 'Mai', value: 45 },
    { month: 'Jun', value: 45 },
  ],
  load: [
    { month: 'Jan', value: 1200 },
    { month: 'Fev', value: 1400 },
    { month: 'Mar', value: 1600 },
    { month: 'Abr', value: 1800 },
    { month: 'Mai', value: 2000 },
    { month: 'Jun', value: 2200 },
  ],
  performance: [
    { month: 'Jan', value: 55 },
    { month: 'Fev', value: 60 },
    { month: 'Mar', value: 65 },
    { month: 'Abr', value: 70 },
    { month: 'Mai', value: 72 },
    { month: 'Jun', value: 75 },
  ],
  repsSessions: [
    { label: 'S1', planned: 40, done: 32 },
    { label: 'S2', planned: 42, done: 38 },
    { label: 'S3', planned: 45, done: 40 },
    { label: 'S4', planned: 48, done: 46 },
    { label: 'S5', planned: 50, done: 48 },
    { label: 'S6', planned: 50, done: 50 },
  ],
}

const anaExercises: Exercise[] = [
  {
    id: 'a1',
    muscleGroup: 'Peito',
    name: 'Supino reto',
    sets: 3,
    reps: 12,
    repsDone: 10,
    previousWeight: 20,
    currentWeight: 22.5,
  },
  {
    id: 'a2',
    muscleGroup: 'Peito',
    name: 'Mergulho/paralela',
    sets: 3,
    reps: 10,
    repsDone: 10,
    previousWeight: 0,
    currentWeight: 0,
  },
  {
    id: 'a3',
    muscleGroup: 'Peito',
    name: 'Crucifixo reto',
    sets: 3,
    reps: 12,
    repsDone: 12,
    previousWeight: 8,
    currentWeight: 10,
  },
  {
    id: 'a4',
    muscleGroup: 'Tríceps',
    name: 'Tríceps Francês',
    sets: 3,
    reps: 12,
    repsDone: 11,
    previousWeight: 10,
    currentWeight: 12,
  },
  {
    id: 'a5',
    muscleGroup: 'Tríceps',
    name: 'Tríceps corda',
    sets: 3,
    reps: 15,
    repsDone: 15,
    previousWeight: 15,
    currentWeight: 17.5,
  },
]

const carlosExercises: Exercise[] = [
  {
    id: 'c1',
    muscleGroup: 'Costas',
    name: 'Puxada frontal',
    sets: 4,
    reps: 12,
    repsDone: 12,
    previousWeight: 40,
    currentWeight: 45,
  },
  {
    id: 'c2',
    muscleGroup: 'Costas',
    name: 'Remada curvada',
    sets: 3,
    reps: 10,
    repsDone: 10,
    previousWeight: 30,
    currentWeight: 35,
  },
  {
    id: 'c3',
    muscleGroup: 'Bíceps',
    name: 'Rosca direta',
    sets: 3,
    reps: 12,
    repsDone: 12,
    previousWeight: 12,
    currentWeight: 14,
  },
  {
    id: 'c4',
    muscleGroup: 'Pernas',
    name: 'Agachamento livre',
    sets: 4,
    reps: 10,
    repsDone: 8,
    previousWeight: 60,
    currentWeight: 70,
  },
]

function makeStudent(
  base: Omit<Student, 'avatarInitials' | 'color'> & {
    avatarInitials?: string
    color?: string
  },
  exercises: Exercise[],
  extras?: Partial<
    Pick<
      StudentRecord,
      'physical' | 'evolution' | 'metrics' | 'history' | 'anamnesis' | 'assessment'
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
    sessionClock: emptyClock(),
  }
}

function sampleHistory(exercises: Exercise[], volumes: number[]): WorkoutSession[] {
  return volumes.map((volumeKg, i) => {
    const prev = i === 0 ? volumeKg : volumes[i - 1]
    const change = prev === 0 ? 0 : Number((((volumeKg - prev) / prev) * 100).toFixed(1))
    const day = new Date('2026-06-01T12:00:00.000Z')
    day.setDate(day.getDate() + i * 7)
    return {
      id: `hist-${exercises[0]?.id ?? 'x'}-${i}`,
      date: day.toISOString(),
      volumeKg,
      volumeChangePercent: i === 0 ? 0 : change,
      sessionDurationSec: 3600 + i * 120,
      workDurationSec: 1100 + i * 40,
      exercises: exercises.map((e) => ({
        exerciseId: e.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        sets: e.sets,
        reps: e.reps,
        repsDone: e.repsDone,
        weight: e.currentWeight,
        volumeKg: exerciseVolumeKg(e),
        previousWeight: e.previousWeight,
        increasePercent: 0,
        isPr: false,
      })),
    }
  })
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

export const initialStudents: StudentRecord[] = [
  makeStudent(
    {
      id: '1',
      name: 'Ana Clara Mendes',
      email: 'ana.clara@email.com',
      phone: '11999998888',
      enrollmentDate: '2025-11-12',
      daysAccompanied: 142,
      color: STUDENT_COLORS[1],
    },
    anaExercises,
    {
      metrics: {
        ...recomputeMetrics(anaExercises, 4, 10),
        energyLevel: 10,
        frequency: 4,
      },
      physical: {
        record1km: '04:52',
        record1kmSeconds: 292,
        timeReduction1km: '-00:38',
        timeReductionSeconds: 38,
        maxTreadmillSpeed: 14.5,
        maxAbsAverage: 48,
        plankRecord: '02:15',
        plankSeconds: 135,
      },
      evolution: {
        ...structuredClone(defaultEvolution),
        performance: [
          { month: 'Jan', value: 62 },
          { month: 'Fev', value: 68 },
          { month: 'Mar', value: 74 },
          { month: 'Abr', value: 79 },
          { month: 'Mai', value: 83 },
          { month: 'Jun', value: 87 },
        ],
        repsSessions: [
          { label: 'S1', planned: 48, done: 40 },
          { label: 'S2', planned: 50, done: 44 },
          { label: 'S3', planned: 52, done: 48 },
          { label: 'S4', planned: 55, done: 50 },
          { label: 'S5', planned: 58, done: 55 },
          { label: 'S6', planned: 61, done: 58 },
        ],
      },
      history: sampleHistory(anaExercises, [2100, 2280, 2410, 2550, 2680]),
      anamnesis: {
        ...emptyAnamnesis(),
        goal: 'Hipertrofia e condicionamento',
        experience: 'intermediario',
        sleepHours: 7,
        stress: 4,
        occupation: 'Analista',
        weightKg: 62,
        heightCm: 165,
        availabilityPerWeek: 4,
        updatedAt: '2026-07-01T12:00:00.000Z',
        trainingFocus: 'Hipertrofia de peito/tríceps com base de força',
        weeklyStructure: 'A superior push · B posterior · C pernas · D cardio leve',
        methods: 'Pirâmide crescente e rest-pause no último set',
        progression: 'Aumentar 2,5 kg quando completar todas as reps',
      },
      assessment: {
        ...emptyAssessment(),
        parQ: {
          ...emptyAssessment().parQ,
          q1Heart: 'nao',
          q2ChestPainActivity: 'nao',
          q3ChestPainRest: 'nao',
          q4Dizziness: 'nao',
          q5BoneJoint: 'nao',
          q6Medication: 'nao',
          q7Other: 'nao',
        },
        deepSquat: {
          classification: 'leves',
          notes: 'Valgo leve no joelho esquerdo no fundo do agachamento',
        },
        simpleMovements: {
          classification: 'normal',
          notes: 'Marcha e hinging sem restrição',
        },
        shoulderFlexion: { left: 'normal', right: 'leves', notes: 'D limitado no fim de amplitude' },
        shoulderRotation: { left: 'normal', right: 'normal', notes: '' },
        shoulderExtension: { left: 'normal', right: 'normal', notes: '' },
        kneeToWallLeftCm: 9,
        kneeToWallRightCm: 11,
        activeLegRaise: { left: 'leves', right: 'normal', notes: 'Isquiotibiais E mais tensos' },
        unipedalLeftSec: 18,
        unipedalRightSec: 24,
        unipedalNotes: 'Oscilação no lado esquerdo após 15s',
        maxPushUps: 18,
        plankMax: '01:42',
        hipIsometric: '00:48',
        run1km: '04:52',
        hiitInterval: '8x 200 m / 60 s descanso · FC média 165',
        updatedAt: '2026-07-01T12:00:00.000Z',
      },
    },
  ),
  makeStudent(
    {
      id: '2',
      name: 'Carlos Eduardo Lima',
      email: 'carlos.lima@email.com',
      phone: '11988887777',
      enrollmentDate: '2026-01-08',
      daysAccompanied: 88,
      color: STUDENT_COLORS[0],
    },
    carlosExercises,
    {
      metrics: {
        ...recomputeMetrics(carlosExercises, 3, 7),
        energyLevel: 7,
        frequency: 3,
      },
      history: sampleHistory(carlosExercises, [3800, 4100, 4350, 4520]),
    },
  ),
]

/** @deprecated use initialStudents */
export const initialData = initialStudents[0]
