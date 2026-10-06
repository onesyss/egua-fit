import type { ReactNode } from 'react'
import { CalendarRange, Dumbbell, Repeat, TrendingUp } from 'lucide-react'
import {
  ensureEvolutionCharts,
  formatEvolutionPct,
  type MonthlyEvolution,
} from '../lib/monthlyEvolution'
import { EvolutionPdfHero } from './EvolutionPdfHero'
import {
  AbsBarChart,
  PerformanceRepsChart,
  VolumeHistoryChart,
} from './Charts'

function ImprovementCard({
  title,
  subtitle,
  pct,
  detail,
  icon: Icon,
  accent,
  paper,
}: {
  title: string
  subtitle: string
  pct: number | null
  detail: string
  icon: typeof TrendingUp
  accent: 'blue' | 'red' | 'green'
  paper?: boolean
}) {
  const colors = {
    blue: paper ? 'text-[#2c4566]' : 'text-[#2c4566] dark:text-brand-300',
    red: paper ? 'text-[#b33a3a]' : 'text-[#b33a3a] dark:text-red-400',
    green: paper ? 'text-emerald-700' : 'text-emerald-700 dark:text-emerald-400',
  }
  const pctColor =
    pct == null
      ? paper
        ? 'text-slate-400'
        : 'text-slate-400 dark:text-ink-muted'
      : pct > 0
        ? paper
          ? 'text-emerald-700'
          : 'text-emerald-700 dark:text-emerald-400'
        : pct < 0
          ? paper
            ? 'text-red-600'
            : 'text-red-600 dark:text-red-400'
          : paper
            ? 'text-slate-400'
            : 'text-slate-400 dark:text-ink-muted'

  return (
    <div
      className={
        paper
          ? 'rounded-xl border border-slate-200 bg-slate-50/80 p-4'
          : 'rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/55'
      }
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colors[accent]}`} />
        <p
          className={
            paper
              ? 'text-sm font-semibold text-slate-900'
              : 'text-sm font-semibold text-slate-900 dark:text-ink'
          }
        >
          {title}
        </p>
      </div>
      <p className={`font-mono text-3xl font-bold tabular-nums ${pctColor}`}>
        {formatEvolutionPct(pct)}
      </p>
      <p
        className={
          paper
            ? 'mt-1 text-xs text-slate-500'
            : 'mt-1 text-xs text-slate-500 dark:text-ink-muted'
        }
      >
        {subtitle}
      </p>
      <p
        className={
          paper
            ? 'mt-2 text-sm text-slate-700'
            : 'mt-2 text-sm text-slate-700 dark:text-slate-200'
        }
      >
        {detail}
      </p>
    </div>
  )
}

function ChartBlock({
  title,
  children,
  empty,
  wide,
  paper,
}: {
  title: string
  children?: ReactNode
  empty?: string
  wide?: boolean
  paper?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <h4
        className={
          paper
            ? 'mb-2 text-sm font-semibold text-slate-900'
            : 'mb-2 text-sm font-semibold text-slate-900 dark:text-ink'
        }
      >
        {title}
      </h4>
      {children ?? (
        <p
          className={
            paper
              ? 'flex h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500'
              : 'flex h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/55 dark:text-ink-muted'
          }
        >
          {empty}
        </p>
      )}
    </div>
  )
}

export function EvolutionReportView({
  data: rawData,
  studentName,
  goal,
  showHero = true,
  documentStyle = false,
  forceLight = false,
  emittedAt,
  headline,
  message,
}: {
  data: MonthlyEvolution
  studentName: string
  goal?: string
  showHero?: boolean
  documentStyle?: boolean
  /** PDF: desenha os gráficos na paleta clara, sem mudar o restante da tela. */
  forceLight?: boolean
  emittedAt?: string
  headline?: string
  message?: string
}) {
  const data = ensureEvolutionCharts(rawData)
  const hasVolume = (data.volumePoints?.length ?? 0) > 0
  const hasPerformance =
    (data.performancePoints ?? []).some((p) => p.planned > 0 || p.done > 0) ||
    (data.performancePoints?.length ?? 0) > 0
  const hasFrequency =
    (data.frequencyByWeek?.length ?? 0) > 0 || data.frequency.sessions > 0
  const hasApparatus = (data.apparatusChart?.length ?? 0) > 0
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
  const chartFrame = documentStyle
    ? 'chart-frame h-[220px] rounded-xl border border-slate-200 bg-white p-2'
    : 'chart-frame h-[220px] rounded-xl border border-slate-200 bg-white p-2 text-ink dark:border-slate-700 dark:bg-slate-950'

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
        <h3
          className={
            documentStyle
              ? 'font-display text-lg font-bold tracking-tight text-slate-900'
              : 'font-display text-lg font-bold tracking-tight text-slate-900 dark:text-ink'
          }
        >
          Evolução desde o início
        </h3>
        <p
          className={
            documentStyle
              ? 'mt-1 text-sm text-slate-500'
              : 'mt-1 text-sm text-slate-500 dark:text-ink-muted'
          }
        >
          {data.periodLabel ?? data.label} · desempenho e frequência por treino
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={
            documentStyle
              ? 'flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3'
              : 'flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/55'
          }
        >
          <CalendarRange
            className={
              documentStyle
                ? 'mt-0.5 h-4 w-4 shrink-0 text-[#2c4566]'
                : 'mt-0.5 h-4 w-4 shrink-0 text-[#2c4566] dark:text-brand-300'
            }
          />
          <div>
            <p
              className={
                documentStyle
                  ? 'text-xs font-semibold tracking-wide text-slate-500 uppercase'
                  : 'text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-ink-muted'
              }
            >
              Mensuração inicial
            </p>
            <p
              className={
                documentStyle
                  ? 'font-mono text-lg font-bold text-slate-900'
                  : 'font-mono text-lg font-bold text-slate-900 dark:text-ink'
              }
            >
              {data.measurementStartLabel}
            </p>
          </div>
        </div>
        <div
          className={
            documentStyle
              ? 'flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3'
              : 'flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/55'
          }
        >
          <CalendarRange
            className={
              documentStyle
                ? 'mt-0.5 h-4 w-4 shrink-0 text-[#b33a3a]'
                : 'mt-0.5 h-4 w-4 shrink-0 text-[#b33a3a] dark:text-red-400'
            }
          />
          <div>
            <p
              className={
                documentStyle
                  ? 'text-xs font-semibold tracking-wide text-slate-500 uppercase'
                  : 'text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-ink-muted'
              }
            >
              Mensuração final
            </p>
            <p
              className={
                documentStyle
                  ? 'font-mono text-lg font-bold text-slate-900'
                  : 'font-mono text-lg font-bold text-slate-900 dark:text-ink'
              }
            >
              {data.measurementEndLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ImprovementCard
          title="Força"
          subtitle="Carga 1ª → última sessão do período"
          pct={data.strength.pct}
          detail={`${data.strength.startKg.toLocaleString('pt-BR')} kg → ${data.strength.endKg.toLocaleString('pt-BR')} kg`}
          icon={Dumbbell}
          accent="blue"
          paper={documentStyle}
        />
        <ImprovementCard
          title="Aparelhos"
          subtitle="Média de evolução de carga por exercício"
          pct={data.apparatus.pct}
          detail={
            data.apparatus.details.length
              ? `${data.apparatus.details.length} exercícios comparados`
              : 'Ainda sem comparação de aparelhos'
          }
          icon={TrendingUp}
          accent="red"
          paper={documentStyle}
        />
        <ImprovementCard
          title="Frequência"
          subtitle="Treinos no período · meta acumulada"
          pct={data.frequency.pct}
          detail={`${data.frequency.sessions} treinos · meta ${data.frequency.goal} (${data.frequency.achievementPct}%)`}
          icon={Repeat}
          accent="green"
          paper={documentStyle}
        />
      </div>

      <div>
        <h3
          className={
            documentStyle
              ? 'mb-3 font-display text-lg font-bold tracking-tight text-slate-900'
              : 'mb-3 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-ink'
          }
        >
          Gráficos do período
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <ChartBlock
            title="Carga levantada por treino"
            empty="Nenhum treino salvo ainda."
            paper={documentStyle}
          >
            {hasVolume ? (
              <div className={chartFrame}>
                <VolumeHistoryChart data={data.volumePoints} forceLight={forceLight} />
              </div>
            ) : undefined}
          </ChartBlock>

          <ChartBlock
            title="Desempenho por treino (reps)"
            empty="Sem dados de desempenho ainda."
            paper={documentStyle}
          >
            {hasPerformance ? (
              <div className={chartFrame}>
                <PerformanceRepsChart data={data.performancePoints} forceLight={forceLight} />
              </div>
            ) : undefined}
          </ChartBlock>

          <ChartBlock
            title="Frequência por dia"
            empty="Sem treinos registrados."
            paper={documentStyle}
          >
            {hasFrequency ? (
              <div className={chartFrame}>
                <AbsBarChart
                  data={data.frequencyByWeek}
                  seriesName="Treinos"
                  forceLight={forceLight}
                />
              </div>
            ) : undefined}
          </ChartBlock>

          <ChartBlock
            title="Evolução nos aparelhos (% de carga)"
            empty="Compare cargas do mesmo exercício em treinos diferentes no período."
            paper={documentStyle}
          >
            {hasApparatus ? (
              <div className={chartFrame}>
                <AbsBarChart
                  data={data.apparatusChart}
                  seriesName="% carga"
                  forceLight={forceLight}
                />
              </div>
            ) : undefined}
          </ChartBlock>
        </div>
      </div>

      {data.apparatus.details.length > 0 && (
        <div
          className={
            documentStyle
              ? 'rounded-xl border border-slate-200 p-4'
              : 'rounded-xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-950/55'
          }
        >
          <p
            className={
              documentStyle
                ? 'mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase'
                : 'mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-ink-muted'
            }
          >
            Detalhe por aparelho
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[...data.apparatus.details]
              .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
              .slice(0, 12)
              .map((item) => (
                <li
                  key={item.name}
                  className={
                    documentStyle
                      ? 'flex justify-between gap-2 border-b border-slate-100 pb-1.5 text-sm last:border-0'
                      : 'flex justify-between gap-2 border-b border-slate-100 pb-1.5 text-sm last:border-0 dark:border-slate-800'
                  }
                >
                  <span
                    className={
                      documentStyle
                        ? 'truncate text-slate-800'
                        : 'truncate text-slate-800 dark:text-ink'
                    }
                  >
                    {item.name}
                  </span>
                  <span
                    className={
                      documentStyle
                        ? 'shrink-0 font-mono tabular-nums text-slate-500'
                        : 'shrink-0 font-mono tabular-nums text-slate-500 dark:text-ink-muted'
                    }
                  >
                    {item.from} → {item.to} kg ·{' '}
                    <strong
                      className={
                        (item.pct ?? 0) > 0
                          ? documentStyle
                            ? 'text-emerald-700'
                            : 'text-emerald-700 dark:text-emerald-400'
                          : (item.pct ?? 0) < 0
                            ? documentStyle
                              ? 'text-red-600'
                              : 'text-red-600 dark:text-red-400'
                            : documentStyle
                              ? 'text-slate-700'
                              : 'text-slate-700 dark:text-slate-200'
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
            Égua Fit · Relatório de evolução
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
