import type { ReactNode } from 'react'
import { CalendarRange, Dumbbell, Repeat, TrendingUp } from 'lucide-react'
import type { MonthlyEvolution } from '../lib/monthlyEvolution'
import { formatEvolutionPct } from '../lib/monthlyEvolution'
import { EvolutionPdfHero } from './EvolutionPdfHero'
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
    blue: 'text-[#2c4566]',
    red: 'text-[#b33a3a]',
    green: 'text-emerald-700',
  }
  const pctColor =
    pct == null
      ? 'text-slate-400'
      : pct > 0
        ? 'text-emerald-700'
        : pct < 0
          ? 'text-red-600'
          : 'text-slate-400'

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colors[accent]}`} />
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className={`font-mono text-3xl font-bold tabular-nums ${pctColor}`}>
        {formatEvolutionPct(pct)}
      </p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <p className="mt-2 text-sm text-slate-700">{detail}</p>
    </div>
  )
}

function ChartBlock({
  title,
  children,
  empty,
  wide,
}: {
  title: string
  children?: ReactNode
  empty?: string
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <h4 className="mb-2 text-sm font-semibold text-slate-900">{title}</h4>
      {children ?? (
        <p className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
          {empty}
        </p>
      )}
    </div>
  )
}

export function EvolutionReportView({
  data,
  studentName,
  goal,
  showHero = true,
  documentStyle = false,
  emittedAt,
  headline,
  message,
}: {
  data: MonthlyEvolution
  studentName: string
  goal?: string
  showHero?: boolean
  /** Visual de folha/PDF (página pública do aluno) */
  documentStyle?: boolean
  emittedAt?: string
  headline?: string
  message?: string
}) {
  const hasVolume = data.volumePoints.length > 0
  const hasFrequency =
    data.frequencyByWeek.length > 0 || data.frequency.sessions > 0
  const hasApparatus = data.apparatusChart.length > 0
  const emittedLabel = emittedAt
    ? new Date(emittedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  const sheet = documentStyle
    ? 'evolucao-doc-sheet space-y-6 text-slate-900'
    : 'evolucao-print-sheet space-y-5'

  return (
    <article className={sheet}>
      {showHero && (
        <EvolutionPdfHero
          data={data}
          studentName={studentName}
          goal={goal}
          printOnly={!documentStyle}
          showMonth
          headline={headline}
          message={message}
        />
      )}

      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
          Seus números do mês
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Mensurações, evolução e gráficos de {data.label}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-[#2c4566]" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Mensuração inicial
            </p>
            <p className="font-mono text-lg font-bold text-slate-900">
              {data.measurementStartLabel}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-[#b33a3a]" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Mensuração final
            </p>
            <p className="font-mono text-lg font-bold text-slate-900">
              {data.measurementEndLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
              : 'Ainda sem comparação de aparelhos neste mês'
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

      <div>
        <h3 className="mb-3 font-display text-lg font-bold tracking-tight text-slate-900">
          Gráficos do mês
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <ChartBlock
            title="Carga levantada no mês"
            empty="Nenhum treino salvo neste mês."
          >
            {hasVolume ? (
              <div className="chart-frame h-[220px] rounded-xl border border-slate-200 bg-white p-2">
                <VolumeHistoryChart data={data.volumePoints} />
              </div>
            ) : undefined}
          </ChartBlock>

          <ChartBlock
            title="Frequência por semana"
            empty="Sem treinos registrados neste mês."
          >
            {hasFrequency ? (
              <div className="chart-frame h-[220px] rounded-xl border border-slate-200 bg-white p-2">
                <AbsBarChart data={data.frequencyByWeek} />
              </div>
            ) : undefined}
          </ChartBlock>

          <ChartBlock
            title="Evolução nos aparelhos (% de carga)"
            empty="Compare o primeiro e o último treino do mês com cargas registradas."
            wide
          >
            {hasApparatus ? (
              <div className="chart-frame h-[220px] rounded-xl border border-slate-200 bg-white p-2">
                <AbsBarChart data={data.apparatusChart} />
              </div>
            ) : undefined}
          </ChartBlock>
        </div>
      </div>

      {data.apparatus.details.length > 0 && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Detalhe por aparelho
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[...data.apparatus.details]
              .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
              .slice(0, 12)
              .map((item) => (
                <li
                  key={item.name}
                  className="flex justify-between gap-2 border-b border-slate-100 pb-1.5 text-sm last:border-0"
                >
                  <span className="truncate text-slate-800">{item.name}</span>
                  <span className="shrink-0 font-mono tabular-nums text-slate-500">
                    {item.from} → {item.to} kg ·{' '}
                    <strong
                      className={
                        (item.pct ?? 0) > 0
                          ? 'text-emerald-700'
                          : (item.pct ?? 0) < 0
                            ? 'text-red-600'
                            : 'text-slate-700'
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

      {documentStyle && (
        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          <p className="font-semibold tracking-wide text-slate-700 uppercase">
            Égua Fit · Relatório mensal
          </p>
          <p className="mt-1">
            {studentName}
            {emittedLabel ? ` · Emitido em ${emittedLabel}` : ''}
          </p>
        </footer>
      )}
    </article>
  )
}
