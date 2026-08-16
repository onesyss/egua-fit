import type {
  Assessment,
  BilateralMobility,
  CompensationLevel,
  MobilityScore,
  ParQ,
  YesNo,
} from '../types'

export const PARQ_QUESTIONS: { key: keyof Omit<ParQ, 'notes'>; text: string }[] =
  [
    {
      key: 'q1Heart',
      text: 'Algum médico já disse que você possui problema de coração e que só deveria realizar atividade física supervisionada?',
    },
    {
      key: 'q2ChestPainActivity',
      text: 'Você sente dor no peito quando pratica atividade física?',
    },
    {
      key: 'q3ChestPainRest',
      text: 'No último mês, você teve dor no peito quando não estava praticando atividade física?',
    },
    {
      key: 'q4Dizziness',
      text: 'Você perde o equilíbrio por causa de tontura ou já perdeu a consciência?',
    },
    {
      key: 'q5BoneJoint',
      text: 'Você tem algum problema ósseo ou articular que poderia ser agravado pela atividade física?',
    },
    {
      key: 'q6Medication',
      text: 'Algum médico está prescrevendo medicamentos para pressão arterial ou para o coração?',
    },
    {
      key: 'q7Other',
      text: 'Você conhece alguma outra razão pela qual não deveria praticar atividade física?',
    },
  ]

export const COMPENSATION_LABEL: Record<CompensationLevel, string> = {
  normal: 'Normal',
  leves: 'Compensações leves',
  importantes: 'Compensações importantes',
}

function emptyMobility(): MobilityScore {
  return { classification: '', notes: '' }
}

function emptyBilateral(): BilateralMobility {
  return { left: '', right: '', notes: '' }
}

export function emptyParQ(): ParQ {
  return {
    q1Heart: '',
    q2ChestPainActivity: '',
    q3ChestPainRest: '',
    q4Dizziness: '',
    q5BoneJoint: '',
    q6Medication: '',
    q7Other: '',
    notes: '',
  }
}

export function emptyAssessment(): Assessment {
  return {
    parQ: emptyParQ(),
    deepSquat: emptyMobility(),
    simpleMovements: emptyMobility(),
    shoulderFlexion: emptyBilateral(),
    shoulderRotation: emptyBilateral(),
    shoulderExtension: emptyBilateral(),
    kneeToWallLeftCm: 0,
    kneeToWallRightCm: 0,
    activeLegRaise: emptyBilateral(),
    unipedalLeftSec: 0,
    unipedalRightSec: 0,
    unipedalNotes: '',
    maxPushUps: 0,
    plankMax: '',
    hipIsometric: '',
    run1km: '',
    hiitInterval: '',
    notes: '',
  }
}

export function mergeAssessment(raw?: Partial<Assessment> | null): Assessment {
  const empty = emptyAssessment()
  if (!raw) return empty
  return {
    ...empty,
    ...raw,
    parQ: { ...empty.parQ, ...raw.parQ },
    deepSquat: { ...empty.deepSquat, ...raw.deepSquat },
    simpleMovements: { ...empty.simpleMovements, ...raw.simpleMovements },
    shoulderFlexion: { ...empty.shoulderFlexion, ...raw.shoulderFlexion },
    shoulderRotation: { ...empty.shoulderRotation, ...raw.shoulderRotation },
    shoulderExtension: { ...empty.shoulderExtension, ...raw.shoulderExtension },
    activeLegRaise: { ...empty.activeLegRaise, ...raw.activeLegRaise },
  }
}

export function parQYesCount(parQ: ParQ): number {
  return PARQ_QUESTIONS.filter((q) => parQ[q.key] === 'sim').length
}

export function parQRisk(parQ: ParQ): boolean {
  return parQYesCount(parQ) > 0
}

export function compensationLabel(value: CompensationLevel | '' | YesNo): string {
  if (!value) return ''
  if (value === 'sim' || value === 'nao') return value === 'sim' ? 'Sim' : 'Não'
  return COMPENSATION_LABEL[value]
}

export function bilateralLabel(item: BilateralMobility): string {
  const l = compensationLabel(item.left)
  const r = compensationLabel(item.right)
  if (!l && !r && !item.notes) return ''
  return `E: ${l || '—'} · D: ${r || '—'}${item.notes ? ` — ${item.notes}` : ''}`
}
