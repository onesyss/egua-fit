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
  /** Cardio: duração em minutos */
  durationMin?: number
  /** Esteira: inclinação em % */
  incline?: number
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
  color: string
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

export interface WorkoutExerciseLog {
  exerciseId: string
  name: string
  muscleGroup: MuscleGroup
  sets: number
  reps: number
  repsDone: number
  weight: number
  volumeKg: number
  previousWeight: number
  increasePercent: number
  isPr: boolean
}

export interface WorkoutSession {
  id: string
  date: string
  exercises: WorkoutExerciseLog[]
  volumeKg: number
  volumeChangePercent: number
  sessionDurationSec: number
  workDurationSec: number
  notes?: string
}

export interface PersonalRecord {
  exerciseName: string
  weight: number
  volumeKg: number
  date: string
}

export type CompensationLevel = 'normal' | 'leves' | 'importantes'

export type YesNo = '' | 'sim' | 'nao'

export type Side = 'left' | 'right'

export interface MobilityScore {
  classification: CompensationLevel | ''
  notes: string
}

export interface BilateralMobility {
  left: CompensationLevel | ''
  right: CompensationLevel | ''
  notes: string
}

export interface ParQ {
  q1Heart: YesNo
  q2ChestPainActivity: YesNo
  q3ChestPainRest: YesNo
  q4Dizziness: YesNo
  q5BoneJoint: YesNo
  q6Medication: YesNo
  q7Other: YesNo
  notes: string
}

export interface Assessment {
  parQ: ParQ
  deepSquat: MobilityScore
  simpleMovements: MobilityScore
  shoulderFlexion: BilateralMobility
  shoulderRotation: BilateralMobility
  shoulderExtension: BilateralMobility
  kneeToWallLeftCm: number
  kneeToWallRightCm: number
  activeLegRaise: BilateralMobility
  unipedalLeftSec: number
  unipedalRightSec: number
  unipedalNotes: string
  maxPushUps: number
  plankMax: string
  hipIsometric: string
  run1km: string
  hiitInterval: string
  notes: string
  updatedAt?: string
}

export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado'

export interface Anamnesis {
  goal: string
  injuries: string
  limitations: string
  experience: ExperienceLevel
  sleepHours: number
  stress: number
  occupation: string
  medicalNotes: string
  bloodPressure: string
  restingHr: number
  weightKg: number
  heightCm: number
  bodyFat: number
  availabilityPerWeek: number
  notes: string
  trainingFocus: string
  weeklyStructure: string
  methods: string
  progression: string
  updatedAt?: string
}

export interface SessionClock {
  startedAt: string | null
  accumulatedSec: number
  running: boolean
  workAccumulatedSec: number
  workRunning: boolean
  workStartedAt: string | null
}

export interface StudentRecord {
  student: Student
  exercises: Exercise[]
  metrics: PerformanceMetrics
  physical: PhysicalRecord
  evolution: EvolutionSeries
  history: WorkoutSession[]
  personalRecords: PersonalRecord[]
  anamnesis: Anamnesis
  assessment: Assessment
  sessionClock: SessionClock
}

export interface AppData extends StudentRecord {}
