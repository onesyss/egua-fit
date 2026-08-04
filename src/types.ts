export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Pernas'
  | 'Glúteos'
  | 'Abdômen'
  | 'Cardio'

export interface Exercise {
  id: string
  muscleGroup: MuscleGroup
  name: string
  sets: number
  reps: number
  repsDone: number
  previousWeight: number
  currentWeight: number
}

export interface Student {
  id: string
  name: string
  email?: string
  phone?: string
  enrollmentDate: string
  daysAccompanied: number
  avatarInitials: string
  notes?: string
}

export interface PerformanceMetrics {
  totalLoad: number
  totalExercises: number
  performance: number
  totalSets: number
  acPercent: number
  frequency: number
  energyLevel: number
}

export interface PhysicalRecord {
  record1km: string
  record1kmSeconds: number
  timeReduction1km: string
  timeReductionSeconds: number
  maxTreadmillSpeed: number
  maxAbsAverage: number
  plankRecord: string
  plankSeconds: number
}

export interface ChartPoint {
  month: string
  value: number
  label?: string
}

export interface RepsSessionPoint {
  label: string
  planned: number
  done: number
}

export interface EvolutionSeries {
  runningTime: ChartPoint[]
  absAverage: ChartPoint[]
  plank: ChartPoint[]
  load: ChartPoint[]
  performance: ChartPoint[]
  repsSessions: RepsSessionPoint[]
}

/** Registro completo de um aluno no painel do personal */
export interface StudentRecord {
  student: Student
  exercises: Exercise[]
  metrics: PerformanceMetrics
  physical: PhysicalRecord
  evolution: EvolutionSeries
}

export interface AppData extends StudentRecord {}
