import { formatDate } from '../data/mock'
import { sortedWeightLogs } from './weightStats'
import type { StudentRecord, WeightLog, WorkoutSession } from '../types'

export interface MonthOption {
  year: number
  month: number
  key: string
  label: string
}

export interface ApparatusDetail {
  name: string
  from: number
  to: number
  pct: number | null
}

export interface MonthlyEvolution {
  year: number
  month: number
  label: string
  measurementStart: string | null
  measurementEnd: string | null
  measurementStartLabel: string
  measurementEndLabel: string
  sessions: WorkoutSession[]
  strength: {
    startKg: number
    endKg: number
    pct: number | null
  }
  apparatus: {
    pct: number | null
    details: ApparatusDetail[]
  }
  frequency: {
    sessions: number
    previousSessions: number
    goal: number
    pct: number | null
    achievementPct: number
  }
  volumePoints: { label: string; volume: number; change: number }[]
  frequencyByWeek: { month: string; value: number }[]
  apparatusChart: { month: string; value: number }[]
}

export function percentChange(from: number, to: number): number | null {
  if (from <= 0 && to <= 0) return null
  if (from <= 0) return to > 0 ? 100 : null
  return Math.round(((to - from) / from) * 1000) / 10
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function inMonth(iso: string, year: number, month: number): boolean {
  const d = new Date(iso)
  return d.getFullYear() === year && d.getMonth() === month
}

export function sessionsInMonth(
  history: WorkoutSession[],
  year: number,
  month: number,
): WorkoutSession[] {
  return [...history]
    .filter((s) => inMonth(s.date, year, month))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function weightLogsInMonth(
  logs: WeightLog[],
  year: number,
  month: number,
): WeightLog[] {
  return sortedWeightLogs(logs).filter((l) => inMonth(l.at, year, month))
}

export function availableMonths(record: StudentRecord): MonthOption[] {
  const keys = new Set<string>()
  const now = new Date()

  for (const s of record.history) {
    const d = new Date(s.date)
    keys.add(`${d.getFullYear()}-${d.getMonth()}`)
  }
  for (const l of record.weightLogs ?? []) {
    const d = new Date(l.at)
    keys.add(`${d.getFullYear()}-${d.getMonth()}`)
  }
  keys.add(`${now.getFullYear()}-${now.getMonth()}`)

  return [...keys]
    .map((key) => {
      const [y, m] = key.split('-').map(Number)
      return {
        year: y,
        month: m,
        key,
        label: new Date(y, m, 1).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        }),
      }
    })
    .sort((a, b) => b.year - a.year || b.month - a.month)
}

function apparatusDetails(
  first?: WorkoutSession,
  last?: WorkoutSession,
): ApparatusDetail[] {
  if (!first || !last) return []
  const startValues = new Map<string, number>()
  for (const ex of first.exercises) {
    if (ex.muscleGroup === 'Cardio') continue
    const value = ex.weight > 0 ? ex.weight : ex.repsDone
    if (value <= 0) continue
    const cur = startValues.get(ex.name) ?? 0
    startValues.set(ex.name, Math.max(cur, value))
  }

  const details: ApparatusDetail[] = []
  for (const ex of last.exercises) {
    if (ex.muscleGroup === 'Cardio') continue
    const to = ex.weight > 0 ? ex.weight : ex.repsDone
    const from = startValues.get(ex.name)
    if (!from || from <= 0 || to <= 0) continue
    details.push({
      name: ex.name,
      from,
      to,
      pct: percentChange(from, to),
    })
  }
  return details
}

function averagePercent(details: ApparatusDetail[]): number | null {
  const vals = details.map((d) => d.pct).filter((v): v is number => v != null)
  if (!vals.length) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

function frequencyByWeek(
  sessions: WorkoutSession[],
): { month: string; value: number }[] {
  const counts = [0, 0, 0, 0, 0]
  for (const s of sessions) {
    const week = Math.min(Math.floor((new Date(s.date).getDate() - 1) / 7), 4)
    counts[week] += 1
  }
  return counts.map((value, i) => ({ month: `Sem ${i + 1}`, value }))
}

export function computeMonthlyEvolution(
  record: StudentRecord,
  year: number,
  month: number,
): MonthlyEvolution {
  const sessions = sessionsInMonth(record.history, year, month)
  const weights = weightLogsInMonth(record.weightLogs ?? [], year, month)

  const prev = new Date(year, month - 1, 1)
  const prevSessions = sessionsInMonth(
    record.history,
    prev.getFullYear(),
    prev.getMonth(),
  )

  const firstSession = sessions[0]
  const lastSession = sessions[sessions.length - 1]
  const apparatusList = apparatusDetails(firstSession, lastSession)

  const measurementStart = weights[0]?.at ?? firstSession?.date ?? null
  const measurementEnd =
    weights[weights.length - 1]?.at ?? lastSession?.date ?? null

  const goal = Math.max(
    1,
    Math.round((record.anamnesis.availabilityPerWeek || record.metrics.frequency || 3) * 4),
  )

  const volumePoints = sessions.map((s, i) => ({
    label: `S${i + 1}`,
    volume: s.volumeKg,
    change: s.volumeChangePercent,
  }))

  const apparatusChart = [...apparatusList]
    .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
    .slice(0, 6)
    .map((d) => ({
      month: d.name.length > 14 ? `${d.name.slice(0, 14)}…` : d.name,
      value: d.pct ?? 0,
    }))

  return {
    year,
    month,
    label: new Date(year, month, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
    measurementStart,
    measurementEnd,
    measurementStartLabel: measurementStart
      ? formatShortDate(measurementStart)
      : '—',
    measurementEndLabel: measurementEnd ? formatShortDate(measurementEnd) : '—',
    sessions,
    strength: {
      startKg: firstSession?.volumeKg ?? 0,
      endKg: lastSession?.volumeKg ?? 0,
      pct: percentChange(
        firstSession?.volumeKg ?? 0,
        lastSession?.volumeKg ?? 0,
      ),
    },
    apparatus: {
      pct: averagePercent(apparatusList),
      details: apparatusList,
    },
    frequency: {
      sessions: sessions.length,
      previousSessions: prevSessions.length,
      goal,
      pct: percentChange(prevSessions.length, sessions.length),
      achievementPct: Math.min(
        100,
        Math.round((sessions.length / goal) * 100),
      ),
    },
    volumePoints,
    frequencyByWeek: frequencyByWeek(sessions),
    apparatusChart,
  }
}

export function formatEvolutionPct(pct: number | null): string {
  if (pct == null) return '—'
  return `${pct > 0 ? '+' : ''}${pct}%`
}

export function evolutionCelebrationMessage(
  data: MonthlyEvolution,
  studentName: string,
  goal?: string,
): { headline: string; message: string; highlights: string[] } {
  const firstName = studentName.split(' ')[0] || studentName
  const highlights: string[] = []

  if (data.strength.pct != null && data.strength.pct > 0) {
    highlights.push(`Força ${formatEvolutionPct(data.strength.pct)}`)
  }
  if (data.apparatus.pct != null && data.apparatus.pct > 0) {
    highlights.push(`Aparelhos ${formatEvolutionPct(data.apparatus.pct)}`)
  }
  if (data.frequency.sessions > 0) {
    highlights.push(
      `${data.frequency.sessions} treino${data.frequency.sessions > 1 ? 's' : ''} · meta ${data.frequency.achievementPct}%`,
    )
  }

  const headline = `Parabéns, ${firstName}!`
  let message = ''

  const improved = [
    data.strength.pct != null && data.strength.pct > 0,
    data.apparatus.pct != null && data.apparatus.pct > 0,
    data.frequency.pct != null && data.frequency.pct > 0,
  ].filter(Boolean).length

  if (improved >= 2) {
    message =
      `Seu mês de ${data.label} mostra evolução real em força, técnica e presença. ` +
      'Você está construindo hábito e performance — exatamente o que separa quem treina de quem evolui.'
  } else if (data.strength.pct != null && data.strength.pct > 0) {
    message =
      `Em ${data.label} você aumentou a carga levantada (${formatEvolutionPct(data.strength.pct)}). ` +
      'Isso é progresso mensurável. Mantenha a consistência e desafie-se a repetir esse ritmo.'
  } else if (data.frequency.sessions > 0) {
    message =
      `Você registrou ${data.frequency.sessions} treino${data.frequency.sessions > 1 ? 's' : ''} em ${data.label}. ` +
      'Cada sessão conta. No próximo ciclo, vamos empurrar juntos força, aparelhos e frequência.'
  } else {
    message =
      `${firstName}, este relatório está pronto para acompanhar sua jornada. ` +
      'Salve seus treinos ao longo do mês e veja aqui, em números, o quanto você evoluiu.'
  }

  if (goal?.trim()) {
    message += ` Lembrete do seu objetivo: ${goal.trim()}.`
  }

  return { headline, message, highlights }
}

export function evolutionSummaryLine(data: MonthlyEvolution, studentName: string): string {
  const celebration = evolutionCelebrationMessage(
    data,
    studentName,
  )
  return [
    `Égua Fit — Evolução mensal de ${studentName}`,
    celebration.headline,
    celebration.message,
    '',
    data.label,
    '',
    `Mensuração inicial: ${data.measurementStartLabel}`,
    `Mensuração final: ${data.measurementEndLabel}`,
    '',
    `Força (carga): ${formatEvolutionPct(data.strength.pct)} (${data.strength.startKg.toLocaleString('pt-BR')} → ${data.strength.endKg.toLocaleString('pt-BR')} kg)`,
    `Aparelhos: ${formatEvolutionPct(data.apparatus.pct)}`,
    `Frequência: ${formatEvolutionPct(data.frequency.pct)} (${data.frequency.sessions} treinos · meta ${data.frequency.goal})`,
    '',
    `Emitido em ${formatDate(new Date().toISOString().slice(0, 10))}`,
  ].join('\n')
}
