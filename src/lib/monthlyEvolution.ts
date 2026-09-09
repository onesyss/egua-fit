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
  /** Período completo do relatório (início → fim do mês selecionado) */
  periodLabel: string
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
  /** Carga por sessão (desde o início) */
  volumePoints: { label: string; volume: number; change: number }[]
  /** Desempenho diário/sessão: reps planejadas × realizadas */
  performancePoints: { label: string; planned: number; done: number }[]
  /** Frequência por dia no período */
  frequencyByWeek: { month: string; value: number }[]
  apparatusChart: { month: string; value: number }[]
}

export function percentChange(from: number, to: number): number | null {
  if (from <= 0 && to <= 0) return null
  if (from <= 0) return to > 0 ? 100 : null
  return Math.round(((to - from) / from) * 1000) / 10
}

export function formatShortDate(iso: string): string {
  const d = parseLocalDate(iso)
  if (!d) return iso.slice(0, 10)
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

function apparatusDetails(sessions: WorkoutSession[]): ApparatusDetail[] {
  if (sessions.length === 0) return []

  /** Primeira e última carga de cada exercício no período (ordem cronológica). */
  const firstByName = new Map<string, number>()
  const lastByName = new Map<string, number>()

  for (const session of sessions) {
    const bestInSession = new Map<string, number>()
    for (const ex of session.exercises) {
      if (ex.muscleGroup === 'Cardio') continue
      const value = ex.weight > 0 ? ex.weight : ex.repsDone
      if (value <= 0) continue
      const cur = bestInSession.get(ex.name) ?? 0
      bestInSession.set(ex.name, Math.max(cur, value))
    }
    for (const [name, value] of bestInSession) {
      if (!firstByName.has(name)) firstByName.set(name, value)
      lastByName.set(name, value)
    }
  }

  const details: ApparatusDetail[] = []
  for (const [name, to] of lastByName) {
    const from = firstByName.get(name)
    if (!from || from <= 0 || to <= 0) continue
    details.push({
      name,
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

function parseLocalDate(iso: string): Date | null {
  const raw = iso.slice(0, 10)
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Frequência diária: quantos treinos em cada dia */
function frequencyByDay(
  sessions: WorkoutSession[],
): { month: string; value: number }[] {
  if (sessions.length === 0) return []

  const buckets = new Map<
    string,
    { order: number; label: string; value: number }
  >()

  for (const s of sessions) {
    const d = parseLocalDate(s.date)
    const key = d ? localDateKey(d) : s.date.slice(0, 10)
    const order = d?.getTime() ?? 0
    const label = d
      ? d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })
      : key
    const existing = buckets.get(key)
    if (existing) {
      existing.value += 1
    } else {
      buckets.set(key, {
        order,
        label,
        value: 1,
      })
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.order - b.order)
    .map(({ label, value }) => ({ month: label, value }))
}

function sessionDayLabel(iso: string): string {
  const d = parseLocalDate(iso)
  if (!d) return iso.slice(0, 10)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function sessionPerformance(session: WorkoutSession): {
  planned: number
  done: number
} {
  const strength = session.exercises.filter((e) => e.muscleGroup !== 'Cardio')
  const planned = strength.reduce((acc, e) => acc + e.reps * e.sets, 0)
  const done = strength.reduce((acc, e) => acc + e.repsDone * e.sets, 0)
  if (planned > 0 || done > 0) return { planned, done }
  // Fallback: sessão salva sem detalhe de reps — usa carga como referência
  const volume = Math.round(session.volumeKg)
  if (volume > 0) return { planned: volume, done: volume }
  return { planned: 0, done: 0 }
}

function sessionsUntilMonth(
  history: WorkoutSession[],
  year: number,
  month: number,
): WorkoutSession[] {
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return [...history]
    .filter((s) => {
      const d = parseLocalDate(s.date)
      return d != null && d <= end
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export function sessionsInRange(
  history: WorkoutSession[],
  startIso: string,
  endIso: string,
): WorkoutSession[] {
  const start = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  if (!start || !end) return []
  const from = startOfDay(start)
  const to = endOfDay(end)
  return [...history]
    .filter((s) => {
      const d = parseLocalDate(s.date)
      return d != null && d >= from && d <= to
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

function weightsInRange(
  logs: WeightLog[],
  startIso: string,
  endIso: string,
): WeightLog[] {
  const start = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  if (!start || !end) return []
  const from = startOfDay(start)
  const to = endOfDay(end)
  return sortedWeightLogs(logs).filter((l) => {
    const d = parseLocalDate(l.at)
    return d != null && d >= from && d <= to
  })
}

/** Sugere período padrão: 1º treino/matrícula → hoje. */
export function defaultEvolutionDateRange(record: StudentRecord): {
  start: string
  end: string
} {
  const today = localDateKey(new Date())
  let earliest: Date | null = null
  for (const s of record.history) {
    const d = parseLocalDate(s.date)
    if (d && (!earliest || d < earliest)) earliest = d
  }
  for (const l of record.weightLogs ?? []) {
    const d = parseLocalDate(l.at)
    if (d && (!earliest || d < earliest)) earliest = d
  }
  const enrollment = parseLocalDate(record.student.enrollmentDate)
  if (enrollment && (!earliest || enrollment < earliest)) earliest = enrollment
  return {
    start: earliest ? localDateKey(earliest) : today,
    end: today,
  }
}

function previousPeriodSessions(
  history: WorkoutSession[],
  startIso: string,
  endIso: string,
): WorkoutSession[] {
  const start = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  if (!start || !end) return []
  const spanMs = endOfDay(end).getTime() - startOfDay(start).getTime()
  const prevEnd = new Date(startOfDay(start).getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - spanMs)
  return sessionsInRange(
    history,
    localDateKey(prevStart),
    localDateKey(prevEnd),
  )
}

/** Remove exercícios pesados do snapshot — gráficos já vêm calculados. */
export function toShareableEvolution(data: MonthlyEvolution): MonthlyEvolution {
  return {
    ...data,
    sessions: data.sessions.map((s) => ({
      ...s,
      exercises: [],
    })),
  }
}

/** Preenche gráficos faltantes (links antigos ou sessões sem reps). */
export function ensureEvolutionCharts(data: MonthlyEvolution): MonthlyEvolution {
  const sessions = data.sessions ?? []
  let performancePoints = data.performancePoints ?? []
  let frequencyByWeek = data.frequencyByWeek ?? []
  let volumePoints = data.volumePoints ?? []

  if (sessions.length > 0) {
    if (volumePoints.length === 0) {
      volumePoints = sessions.map((s) => ({
        label: sessionDayLabel(s.date),
        volume: s.volumeKg,
        change: s.volumeChangePercent,
      }))
    }
    if (
      performancePoints.length === 0 ||
      !performancePoints.some((p) => p.planned > 0 || p.done > 0)
    ) {
      performancePoints = sessions.map((s) => {
        const perf = sessionPerformance(s)
        return {
          label: sessionDayLabel(s.date),
          planned: perf.planned,
          done: perf.done,
        }
      })
    }
    if (frequencyByWeek.length === 0) {
      frequencyByWeek = frequencyByDay(sessions)
    }
  }

  return {
    ...data,
    volumePoints,
    performancePoints,
    frequencyByWeek,
  }
}

export function computeEvolutionInRange(
  record: StudentRecord,
  startIso: string,
  endIso: string,
): MonthlyEvolution {
  let start = startIso.slice(0, 10)
  let end = endIso.slice(0, 10)
  if (start > end) {
    const tmp = start
    start = end
    end = tmp
  }

  const sessions = sessionsInRange(record.history, start, end)
  const weights = weightsInRange(record.weightLogs ?? [], start, end)
  const prevSessions = previousPeriodSessions(record.history, start, end)

  const firstSession = sessions[0]
  const lastSession = sessions[sessions.length - 1]
  const apparatusList = apparatusDetails(sessions)

  const measurementStart =
    weights[0]?.at ?? firstSession?.date ?? start
  const measurementEnd =
    weights[weights.length - 1]?.at ?? lastSession?.date ?? end

  const startDate = parseLocalDate(start) ?? new Date()
  const endDate = parseLocalDate(end) ?? new Date()
  const weeksSpan = Math.max(
    1,
    Math.ceil(
      (endOfDay(endDate).getTime() - startOfDay(startDate).getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ),
  )
  const weeklyGoal =
    record.anamnesis.availabilityPerWeek || record.metrics.frequency || 3
  const goal = Math.max(1, Math.round(weeklyGoal * weeksSpan))

  const periodLabel = `${formatShortDate(start)} → ${formatShortDate(end)}`
  const sameMonth =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()
  const label = sameMonth
    ? startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : periodLabel

  const volumePoints = sessions.map((s) => ({
    label: sessionDayLabel(s.date),
    volume: s.volumeKg,
    change: s.volumeChangePercent,
  }))

  const performancePoints = sessions.map((s) => {
    const perf = sessionPerformance(s)
    return {
      label: sessionDayLabel(s.date),
      planned: perf.planned,
      done: perf.done,
    }
  })

  const apparatusChart = [...apparatusList]
    .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
    .slice(0, 8)
    .map((d) => ({
      month: d.name.length > 14 ? `${d.name.slice(0, 14)}…` : d.name,
      value: d.pct ?? 0,
    }))

  return {
    year: endDate.getFullYear(),
    month: endDate.getMonth(),
    label,
    periodLabel,
    measurementStart,
    measurementEnd,
    measurementStartLabel: formatShortDate(measurementStart),
    measurementEndLabel: formatShortDate(measurementEnd),
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
    performancePoints,
    frequencyByWeek: frequencyByDay(sessions),
    apparatusChart,
  }
}

export function computeMonthlyEvolution(
  record: StudentRecord,
  year: number,
  month: number,
): MonthlyEvolution {
  /** Desde o 1º treino/matrícula até o fim do mês selecionado */
  const sessions = sessionsUntilMonth(record.history, year, month)
  const endIso = localDateKey(new Date(year, month + 1, 0))
  const startIso =
    sessions[0]?.date.slice(0, 10) ??
    record.student.enrollmentDate.slice(0, 10) ??
    endIso
  return computeEvolutionInRange(record, startIso, endIso)
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
      `No período ${data.periodLabel} você mostra evolução real em força, técnica e presença. ` +
      'Você está construindo hábito e performance — exatamente o que separa quem treina de quem evolui.'
  } else if (data.strength.pct != null && data.strength.pct > 0) {
    message =
      `No período ${data.periodLabel} você aumentou a carga levantada (${formatEvolutionPct(data.strength.pct)}). ` +
      'Isso é progresso mensurável. Mantenha a consistência e desafie-se a repetir esse ritmo.'
  } else if (data.frequency.sessions > 0) {
    message =
      `Você registrou ${data.frequency.sessions} treino${data.frequency.sessions > 1 ? 's' : ''} em ${data.periodLabel}. ` +
      'Cada sessão conta. No próximo ciclo, vamos empurrar juntos força, aparelhos e frequência.'
  } else {
    message = `${firstName}, este relatório está pronto para acompanhar sua jornada.`
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
