import type { AppData, Exercise, MuscleGroup } from '../types'

const exerciseList: Exercise[] = [
  {
    id: '1',
    muscleGroup: 'Costas',
    name: 'Puxada frontal',
    sets: 4,
    reps: 12,
    repsDone: 12,
    previousWeight: 40,
    currentWeight: 45,
  },
  {
    id: '2',
    muscleGroup: 'Costas',
    name: 'Remada curvada',
    sets: 3,
    reps: 10,
    repsDone: 10,
    previousWeight: 30,
    currentWeight: 35,
  },
  {
    id: '3',
    muscleGroup: 'Peito',
    name: 'Supino reto',
    sets: 4,
    reps: 10,
    repsDone: 8,
    previousWeight: 50,
    currentWeight: 55,
  },
  {
    id: '4',
    muscleGroup: 'Peito',
    name: 'Crucifixo',
    sets: 3,
    reps: 12,
    repsDone: 12,
    previousWeight: 12,
    currentWeight: 14,
  },
  {
    id: '5',
    muscleGroup: 'Bíceps',
    name: 'Rosca direta',
    sets: 3,
    reps: 12,
    repsDone: 12,
    previousWeight: 12,
    currentWeight: 14,
  },
  {
    id: '6',
    muscleGroup: 'Tríceps',
    name: 'Tríceps pulley',
    sets: 3,
    reps: 15,
    repsDone: 15,
    previousWeight: 20,
    currentWeight: 22.5,
  },
  {
    id: '7',
    muscleGroup: 'Ombros',
    name: 'Desenvolvimento',
    sets: 4,
    reps: 10,
    repsDone: 10,
    previousWeight: 20,
    currentWeight: 22,
  },
  {
    id: '8',
    muscleGroup: 'Pernas',
    name: 'Agachamento livre',
    sets: 4,
    reps: 10,
    repsDone: 10,
    previousWeight: 60,
    currentWeight: 70,
  },
  {
    id: '9',
    muscleGroup: 'Pernas',
    name: 'Leg press',
    sets: 3,
    reps: 12,
    repsDone: 12,
    previousWeight: 120,
    currentWeight: 140,
  },
  {
    id: '10',
    muscleGroup: 'Abdômen',
    name: 'Abdominal supra',
    sets: 3,
    reps: 20,
    repsDone: 20,
    previousWeight: 0,
    currentWeight: 0,
  },
]

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

export const initialData: AppData = {
  student: {
    id: '1',
    name: 'Ana Clara Mendes',
    email: 'ana.clara@email.com',
    phone: '11999998888',
    enrollmentDate: '2025-11-12',
    daysAccompanied: 142,
    avatarInitials: 'AC',
  },
  exercises: exerciseList,
  metrics: {
    totalLoad: 4280,
    totalExercises: exerciseList.length,
    performance: 87,
    totalSets: exerciseList.reduce((acc, e) => acc + e.sets, 0),
    acPercent: 92,
    frequency: 4.2,
    energyLevel: 8.5,
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
    runningTime: [
      { month: 'Jan', value: 350 },
      { month: 'Fev', value: 335 },
      { month: 'Mar', value: 320 },
      { month: 'Abr', value: 310 },
      { month: 'Mai', value: 300 },
      { month: 'Jun', value: 292 },
    ],
    absAverage: [
      { month: 'Jan', value: 28 },
      { month: 'Fev', value: 32 },
      { month: 'Mar', value: 36 },
      { month: 'Abr', value: 40 },
      { month: 'Mai', value: 44 },
      { month: 'Jun', value: 48 },
    ],
    plank: [
      { month: 'Jan', value: 45 },
      { month: 'Fev', value: 60 },
      { month: 'Mar', value: 78 },
      { month: 'Abr', value: 95 },
      { month: 'Mai', value: 115 },
      { month: 'Jun', value: 135 },
    ],
    load: [
      { month: 'Jan', value: 2800 },
      { month: 'Fev', value: 3100 },
      { month: 'Mar', value: 3450 },
      { month: 'Abr', value: 3700 },
      { month: 'Mai', value: 4000 },
      { month: 'Jun', value: 4280 },
    ],
    performance: [
      { month: 'Jan', value: 62 },
      { month: 'Fev', value: 68 },
      { month: 'Mar', value: 74 },
      { month: 'Abr', value: 79 },
      { month: 'Mai', value: 83 },
      { month: 'Jun', value: 87 },
    ],
  },
}

export function calcIncrease(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
