import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, Dumbbell, Printer, Repeat, TrendingUp } from 'lucide-react'
import { useGym } from '../context/DataContext'
import type { StudentRecord } from '../types'
import {
  availableMonths,
  computeMonthlyEvolution,
  formatEvolutionPct,
} from '../lib/monthlyEvolution'
import { EvolutionShare } from '../components/EvolutionShare'
import { EvolutionPdfHero } from '../components/EvolutionPdfHero'
import { CollapsibleCard } from '../components/ui'
import { AbsBarChart, VolumeHistoryChart } from './Charts'

function ImprovementCard({
  title,
  subtitle,
  pct,
  detail,
  icon: Icon,
  accent,
}: {
  title: string
  subtitle: string
  pct: number | null
  detail: string
  icon: typeof TrendingUp
  accent: 'blue' | 'red' | 'green'
}) {
  const colors = {
    blue: 'text-brand-700 dark:text-brand-300',
    red: 'text-[#b33a3a]',
    green: 'text-emerald-600 dark:text-emerald-400',
  }
  const pctColor =
    pct == null
      ? 'text-ink-muted'
      : pct > 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : pct < 0
          ? 'text-red-600'
          : 'text-ink-muted'

  return (
    <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colors[accent]}`} />
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <p className={`font-mono text-3xl font-bold tabular-nums ${pctColor}`}>
        {formatEvolutionPct(pct)}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>
      <p className="mt-2 text-sm text-ink">{detail}</p>
    </div>
  )
}

export function StudentEvolutionPanel({
  record,
  studentName,
}: {
  record: StudentRecord
  studentName: string
}) {
  const { updateStudent } = useGym()
  const months = useMemo(() => availableMonths(record), [record])
  const [monthKey, setMonthKey] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    if (months.length && !months.some((m) => m.key === monthKey)) {
      setMonthKey(months[0].key)
    }
  }, [months, monthKey])

  const selected = months.find((m) => m.key === monthKey) ?? months[0]
  const data = useMemo(() => {
    if (!selected) return null
    return computeMonthlyEvolution(record, selected.year, selected.month)
  }, [record, selected])

  const printPdf = () => {
    document.body.classList.add('evolucao-printing')
    const cleanup = () => {
      document.body.classList.remove('evolucao-printing')
    }
    window.addEventListener('afterprint', cleanup, { once: true })
    window.setTimeout(() => window.print(), 150)
  }

  if (!selected || !data) {
    return (
      <CollapsibleCard
        title="Evolução do aluno"
        subtitle="Salve treinos ou registre peso para acompanhar a evolução mensal."
        icon={TrendingUp}
      >
        <p className="text-sm text-ink-muted">
          Ainda não há dados suficientes para montar o relatório mensal.
        </p>
      </CollapsibleCard>
    )
  }

  const headerExtra = (
    <div className="no-print flex flex-wrap items-end gap-2">
      <label className="block text-xs text-ink-muted">
        Mês
        <select
          className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
        >
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={printPdf}
        className="inline-flex items-center gap-2 rounded-xl bg-[#2c4566] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#233650]"
      >
        <Printer className="h-4 w-4" />
        PDF mensal
      </button>
    </div>
  )

  return (
    <CollapsibleCard
      id="evolucao-mensal"
      title="Evolução do aluno"
      subtitle="Resumo mensal de força, aparelhos e frequência"
      icon={TrendingUp}
      headerExtra={headerExtra}
      open={panelOpen}
      onOpenChange={setPanelOpen}
    >
      <div className="no-print">
        {selected && (
          <EvolutionShare
            record={record}
            year={selected.year}
            month={selected.month}
            onSaveContact={(patch) => updateStudent(patch, record.student.id)}
          />
        )}
      </div>

      <article className="evolucao-print-sheet space-y-5">
        <EvolutionPdfHero
          data={data}
          studentName={studentName}
          goal={record.anamnesis.goal}
        />

        <div className="evolucao-pdf-only evolucao-print-section">
          <h3 className="font-display text-lg font-bold text-ink">
            Seus números do mês
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Mensurações, evolução e gráficos de {data.label}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 evolucao-print-section">
          <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Mensuração inicial
              </p>
              <p className="font-mono text-lg font-bold text-ink">
                {data.measurementStartLabel}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-[#b33a3a]" />
            <div>
              <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Mensuração final
              </p>
              <p className="font-mono text-lg font-bold text-ink">
                {data.measurementEndLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 evolucao-print-section">
          <ImprovementCard
            title="Força"
            subtitle="Carga levantada (1ª → última sessão)"
            pct={data.strength.pct}
            detail={`${data.strength.startKg.toLocaleString('pt-BR')} kg → ${data.strength.endKg.toLocaleString('pt-BR')} kg`}
            icon={Dumbbell}
            accent="blue"
          />
          <ImprovementCard
            title="Aparelhos"
            subtitle="Média de evolução de carga por exercício"
            pct={data.apparatus.pct}
            detail={
              data.apparatus.details.length
                ? `${data.apparatus.details.length} exercícios comparados`
                : 'Salve ao menos 2 treinos no mês'
            }
            icon={TrendingUp}
            accent="red"
          />
          <ImprovementCard
            title="Frequência"
            subtitle="Treinos vs mês anterior · meta mensal"
            pct={data.frequency.pct}
            detail={`${data.frequency.sessions} treinos · meta ${data.frequency.goal} (${data.frequency.achievementPct}%)`}
            icon={Repeat}
            accent="green"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {data.volumePoints.length > 0 && (
            <div className="evolucao-print-section">
              <h4 className="mb-2 text-sm font-semibold text-ink">
                Carga levantada no mês
              </h4>
              <div className="chart-frame h-[220px]">
                <VolumeHistoryChart data={data.volumePoints} />
              </div>
            </div>
          )}
          {data.sessions.length > 0 && (
            <div className="evolucao-print-section">
              <h4 className="mb-2 text-sm font-semibold text-ink">
                Frequência por semana
              </h4>
              <div className="chart-frame h-[220px]">
                <AbsBarChart data={data.frequencyByWeek} />
              </div>
            </div>
          )}
          {data.apparatusChart.length > 0 && (
            <div className="evolucao-print-section lg:col-span-2">
              <h4 className="mb-2 text-sm font-semibold text-ink">
                Evolução nos aparelhos (% de carga)
              </h4>
              <div className="chart-frame h-[220px]">
                <AbsBarChart data={data.apparatusChart} />
              </div>
            </div>
          )}
        </div>

        <div className="no-print grid gap-4 lg:grid-cols-2">
          {data.volumePoints.length === 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">
                Carga levantada no mês
              </h4>
              <p className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-brand-100 text-sm text-ink-muted dark:border-slate-700">
                Nenhum treino salvo neste mês.
              </p>
            </div>
          )}
          {data.sessions.length === 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">
                Frequência por semana
              </h4>
              <p className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-brand-100 text-sm text-ink-muted dark:border-slate-700">
                Sem treinos registrados.
              </p>
            </div>
          )}
          {data.apparatusChart.length === 0 && (
            <div className="lg:col-span-2">
              <h4 className="mb-2 text-sm font-semibold text-ink">
                Evolução nos aparelhos (% de carga)
              </h4>
              <p className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-brand-100 text-sm text-ink-muted dark:border-slate-700">
                Compare o primeiro e o último treino do mês com cargas registradas.
              </p>
            </div>
          )}
        </div>

        {data.apparatus.details.length > 0 && (
          <div className="evolucao-print-section rounded-xl border border-brand-100 p-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Detalhe por aparelho
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {[...data.apparatus.details]
                .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
                .slice(0, 8)
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-ink">{item.name}</span>
                    <span className="shrink-0 font-mono tabular-nums text-ink-muted">
                      {item.from} → {item.to} kg ·{' '}
                      <strong
                        className={
                          (item.pct ?? 0) > 0
                            ? 'text-emerald-600'
                            : (item.pct ?? 0) < 0
                              ? 'text-red-600'
                              : ''
                        }
                      >
                        {formatEvolutionPct(item.pct)}
                      </strong>
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </article>
    </CollapsibleCard>
  )
}
