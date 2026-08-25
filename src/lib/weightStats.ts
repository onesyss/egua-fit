import { BMI_BANDS, bmi, bmiBand, type BmiBand } from './training'
import type { WeightLog } from '../types'

export function formatKg(value: number, digits = 2) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function formatStamp(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function sortedWeightLogs(logs: WeightLog[]) {
  return [...logs].sort((a, b) => a.at.localeCompare(b.at))
}

export function weightInsights(logs: WeightLog[], heightCm: number, bodyFat = 0) {
  const sorted = sortedWeightLogs(logs)
  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]
  const delta = latest && previous ? latest.kg - previous.kg : null
  const from = Date.now() - 30 * 24 * 60 * 60 * 1000
  const window = sorted.filter((l) => new Date(l.at).getTime() >= from)
  const best30 =
    window.length > 0
      ? Math.min(...window.map((l) => l.kg))
      : latest?.kg ?? null
  const imc = latest ? bmi(latest.kg, heightCm) : null
  const band = bmiBand(imc)
  const fat = latest?.bodyFat || bodyFat || 0
  const fatBand = fat >= 32 ? 'obeso' : fat >= 25 ? 'sobrepeso' : fat >= 14 ? 'normal' : fat > 0 ? 'abaixo' : null

  return { sorted, latest, previous, delta, best30, imc, band, fat, fatBand }
}

export function bmiCutoffsKg(heightCm: number) {
  const m = heightCm / 100
  const sq = m * m
  return {
    low: 18.5 * sq,
    healthy: 25 * sq,
    high: 30 * sq,
  }
}

export function bandMeta(band: BmiBand | null) {
  const item = BMI_BANDS.find((b) => b.id === band)
  if (!item) return { label: '—', color: '#94a3b8', emoji: '😐' }
  if (band === 'abaixo') return { ...item, emoji: '🙁' }
  if (band === 'normal') return { ...item, emoji: '🙂' }
  if (band === 'sobrepeso') return { ...item, emoji: '😐' }
  return { ...item, emoji: '☹️' }
}

export type MetricTone = {
  label: string
  color: string
}

const TONE = {
  obeso: { label: 'Obeso', color: '#e44545' },
  saudavel: { label: 'Saudável', color: '#3d9a5f' },
  excelente: { label: 'Excelente', color: '#7bc47f' },
  baixo: { label: 'Baixo', color: '#7eb8e8' },
  alto: { label: 'Alto', color: '#f4c430' },
  moderado: { label: 'Moderado', color: '#e07090' },
} as const

function num(v: number | undefined, fallback: number) {
  return v && v > 0 ? v : fallback
}

export function composeBodyMetrics(
  log: WeightLog,
  heightCm: number,
  fallbackFat = 0,
) {
  const kg = log.kg
  const fat = num(log.bodyFat, fallbackFat)
  const fatKg = fat ? (kg * fat) / 100 : 0
  const lbm = num(log.lbmKg, fat ? kg - fatKg : 0)
  const waterPct = num(log.waterPercent, fat ? Math.max(38, 73 * (1 - fat / 100) - 8) : 0)
  const waterKg = waterPct ? (kg * waterPct) / 100 : 0
  const skelPct = num(log.skeletalMusclePercent, fat ? Math.max(20, 55 - fat * 0.7) : 0)
  const skelKg = skelPct ? (kg * skelPct) / 100 : 0
  const musclePct = num(log.muscleMassPercent, fat ? Math.max(40, 100 - fat - 8) : 0)
  const muscleKg = musclePct ? (kg * musclePct) / 100 : 0
  const visc = num(log.visceralFat, fat ? Math.max(4, fat * 0.45) : 0)
  const bone = num(log.boneKg, lbm ? Math.max(2.2, lbm * 0.05) : 0)
  const age = num(log.age, 0)
  const metab = num(
    log.metabolism,
    kg && heightCm
      ? 10 * kg + 6.25 * heightCm - 5 * (age || 35) + 5
      : 0,
  )
  const protein = num(log.proteinPercent, fat ? Math.max(10, 21 - fat * 0.18) : 0)
  const obesity = num(
    log.obesityPercent,
    fat ? Math.max(0, ((fat - 15) / 15) * 25) : 0,
  )
  const metAge = num(log.metabolicAge, age || 0)
  const imc = bmi(kg, heightCm)

  const fatTone =
    fat >= 32 ? TONE.obeso : fat >= 25 ? TONE.obeso : fat >= 14 ? TONE.saudavel : fat ? TONE.baixo : undefined
  const muscleTone =
    musclePct >= 65 ? TONE.excelente : musclePct >= 50 ? TONE.saudavel : musclePct ? TONE.baixo : undefined
  const skelTone =
    skelPct >= 32 ? TONE.saudavel : skelPct >= 25 ? TONE.saudavel : skelPct ? TONE.baixo : undefined
  const waterTone =
    waterPct >= 55 ? TONE.saudavel : waterPct >= 45 ? TONE.baixo : waterPct ? TONE.baixo : undefined
  const viscTone =
    visc >= 15 ? TONE.obeso : visc >= 10 ? TONE.moderado : visc ? TONE.saudavel : undefined
  const boneTone = bone >= 2.4 && bone <= 4.2 ? TONE.saudavel : bone ? TONE.baixo : undefined
  const metabTone = metab >= 1600 ? TONE.alto : metab >= 1300 ? TONE.saudavel : metab ? TONE.baixo : undefined
  const proteinTone = protein >= 16 ? TONE.saudavel : protein ? TONE.baixo : undefined
  const obesityTone =
    obesity >= 40 ? TONE.obeso : obesity >= 20 ? TONE.moderado : obesity ? TONE.saudavel : undefined

  return {
    rows: [
      { key: 'peso', label: 'Peso(Kg)', value: kg, status: bandMeta(bmiBand(imc)) },
      { key: 'imc', label: 'IMC', value: imc, status: bandMeta(bmiBand(imc)) },
      { key: 'gordura', label: 'Gordura(%)', value: fat || null, status: fatTone },
      { key: 'gorduraKg', label: 'Peso da gordura(Kg)', value: fatKg || null, status: fatTone },
      {
        key: 'skelPct',
        label: 'Percentual da massa muscular esquelética(%)',
        value: skelPct || null,
        status: skelTone,
      },
      {
        key: 'skelKg',
        label: 'Peso da massa muscular esquelética(Kg)',
        value: skelKg || null,
        status: skelTone,
      },
      {
        key: 'musclePct',
        label: 'Registro de massa muscular(%)',
        value: musclePct || null,
        status: muscleTone,
      },
      {
        key: 'muscleKg',
        label: 'Peso da massa muscular(Kg)',
        value: muscleKg || null,
        status: muscleTone,
      },
      { key: 'agua', label: 'Água(%)', value: waterPct || null, status: waterTone },
      { key: 'aguaKg', label: 'Peso da água(Kg)', value: waterKg || null, status: waterTone },
      { key: 'visceral', label: 'Gordura visceral', value: visc || null, status: viscTone },
      { key: 'ossos', label: 'Ossos(Kg)', value: bone || null, status: boneTone },
      { key: 'metabolismo', label: 'Metabolismo', value: metab || null, status: metabTone },
      { key: 'proteina', label: 'Proteína(%)', value: protein || null, status: proteinTone },
      { key: 'obesidade', label: 'Obesidade(%)', value: obesity || null, status: obesityTone },
      { key: 'idadeMet', label: 'Idade metabólica', value: metAge || null },
      { key: 'lbm', label: 'LBM(Kg)', value: lbm || null },
      { key: 'idade', label: 'Idade real', value: age || null, digits: 0 },
      { key: 'altura', label: 'Altura(cm)', value: heightCm || null, digits: 0 },
    ] as {
      key: string
      label: string
      value: number | null
      status?: { label: string; color: string }
      digits?: number
    }[],
    fat,
    composition: {
      waterKg,
      fatKg,
      proteinKg: protein ? (kg * protein) / 100 : 0,
      boneKg: bone,
      waterTone,
      fatTone,
      proteinTone,
      boneTone,
    },
    bodyType: classifyBodyType(imc, musclePct, fat),
  }
}

export type BodyTypeId =
  | 'atleta'
  | 'muscular'
  | 'obesidade-muscular'
  | 'levemente-acima'
  | 'obesidade'
  | 'magro'

export const BODY_TYPES: { id: BodyTypeId; label: string }[] = [
  { id: 'magro', label: 'Tipo magro' },
  { id: 'atleta', label: 'Tipo de corpo de atleta' },
  { id: 'muscular', label: 'Tipo muscular' },
  { id: 'obesidade-muscular', label: 'Obesidade muscular' },
  { id: 'levemente-acima', label: 'Levemente acima do peso' },
  { id: 'obesidade', label: 'Obesidade' },
]

function classifyBodyType(
  imc: number | null,
  musclePct: number,
  fat: number,
): BodyTypeId {
  if (imc != null && imc >= 30 && musclePct >= 42) return 'obesidade-muscular'
  if (imc != null && imc >= 30) return 'obesidade'
  if (imc != null && imc >= 25) return 'levemente-acima'
  if (musclePct >= 45 && fat <= 18) return 'atleta'
  if (musclePct >= 40) return 'muscular'
  if (imc != null && imc < 18.5) return 'magro'
  return fat >= 25 ? 'levemente-acima' : 'muscular'
}
