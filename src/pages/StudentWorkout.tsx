import { useMemo, useState } from 'react'
import {
  Activity,
  Battery,
  CalendarDays,
  Dumbbell,
  Gauge,
  Layers,
  Percent,
  Trophy,
  User,
  Weight,
} from 'lucide-react'
import { useAppData } from '../context/DataContext'
import { calcIncrease, formatDate } from '../data/mock'
import {
  LoadAreaChart,
  PerformanceLineChart,
  RadarMetrics,
} from '../components/Charts'
import {
  MuscleGroupFilter,
  type MuscleFilter,
} from '../components/MuscleGroupFilter'
import { MetricCard, Panel, SectionTitle } from '../components/ui'

export function StudentWorkout() {
  const { data } = useAppData()
  const { student, exercises, metrics, evolution } = data
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('all')

  const filteredExercises = useMemo(
    () =>
      muscleFilter === 'all'
        ? exercises
        : exercises.filter((e) => e.muscleGroup === muscleFilter),
    [exercises, muscleFilter],
  )

  const radarData = [
    { label: 'Carga', value: Math.min(metrics.totalLoad / 50, 100), max: 100 },
    { label: 'Exercícios', value: metrics.totalExercises * 8, max: 100 },
    { label: 'Desempenho', value: metrics.performance, max: 100 },
    { label: 'Séries', value: metrics.totalSets * 2.5, max: 100 },
    { label: '% AC', value: metrics.acPercent, max: 100 },
    { label: 'Freq.', value: metrics.frequency * 18, max: 100 },
    { label: 'Energia', value: metrics.energyLevel * 10, max: 100 },
  ]

  return (
    <div className="space-y-6">
      {/* Hero aluno */}
      <section className="tech-hero animate-scale-in p-6 text-white sm:p-8">
        <div className="tech-hero-scan" />
        <span className="tech-corner tech-corner-tl" />
        <span className="tech-corner tech-corner-tr" />
        <span className="tech-corner tech-corner-bl" />
        <span className="tech-corner tech-corner-br" />
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-brand-400/25 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/25 bg-white/10 font-mono text-xl font-bold tracking-wider shadow-sm backdrop-blur">
              {student.avatarInitials}
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-white/70 uppercase">
                // athlete profile
              </p>
              <h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">
                {student.name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs tracking-wide text-blue-100/90">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-white/70" />
                  matrícula {formatDate(student.enrollmentDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-white/70" />
                  {student.daysAccompanied} dias online
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 backdrop-blur">
              <p className="font-mono text-[10px] tracking-[0.16em] text-white/70 uppercase">
                desempenho
              </p>
              <p className="font-mono text-2xl font-bold text-white">
                {metrics.performance}
                <span className="text-base text-white/70">%</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 backdrop-blur">
              <p className="font-mono text-[10px] tracking-[0.16em] text-white/70 uppercase">
                energia
              </p>
              <p className="font-mono text-2xl font-bold text-white">
                {metrics.energyLevel}
                <span className="text-base text-white/70">/10</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas principais */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <MetricCard
          title="Total de carga"
          value={`${metrics.totalLoad.toLocaleString('pt-BR')}`}
          subtitle="kg no treino"
          icon={Weight}
          accent="blue"
          delay="delay-1"
        />
        <MetricCard
          title="Exercícios"
          value={metrics.totalExercises}
          subtitle="no programa"
          icon={Dumbbell}
          accent="red"
          delay="delay-1"
        />
        <MetricCard
          title="Desempenho"
          value={`${metrics.performance}%`}
          subtitle="geral"
          icon={Trophy}
          accent="green"
          delay="delay-2"
        />
        <MetricCard
          title="Séries"
          value={metrics.totalSets}
          subtitle="total planejado"
          icon={Layers}
          accent="blue"
          delay="delay-2"
        />
        <MetricCard
          title="% AC"
          value={`${metrics.acPercent}%`}
          subtitle="acerto / conclusão"
          icon={Percent}
          accent="red"
          delay="delay-3"
        />
        <MetricCard
          title="Frequência"
          value={metrics.frequency}
          subtitle="x por semana"
          icon={Gauge}
          accent="muted"
          delay="delay-3"
        />
        <MetricCard
          title="Energia"
          value={metrics.energyLevel}
          subtitle="nível (0–10)"
          icon={Battery}
          accent="green"
          delay="delay-4"
        />
      </section>

      {/* Gráficos de visão geral */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1" delay="delay-2">
          <SectionTitle
            title="Visão geral"
            subtitle="Radar de desempenho"
          />
          <div className="flex h-[260px] items-center justify-center">
            <RadarMetrics metrics={radarData} />
          </div>
        </Panel>
        <Panel className="lg:col-span-1" delay="delay-3">
          <SectionTitle title="Total de carga" subtitle="Evolução mensal (kg)" />
          <LoadAreaChart data={evolution.load} />
        </Panel>
        <Panel className="lg:col-span-1" delay="delay-4">
          <SectionTitle title="Desempenho" subtitle="Score ao longo do tempo" />
          <PerformanceLineChart data={evolution.performance} />
        </Panel>
      </section>

      {/* Programação de treino */}
      <Panel delay="delay-3">
        <SectionTitle
          title="Programação de treino"
          subtitle={
            muscleFilter === 'all'
              ? 'Exercícios montados na plataforma'
              : `Mostrando apenas: ${muscleFilter}`
          }
          action={
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-50 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-brand-700 uppercase dark:border-slate-700 dark:bg-slate-900 dark:text-brand-300">
              <User className="h-3.5 w-3.5" />
              {filteredExercises.length}
              {muscleFilter !== 'all' ? `/${exercises.length}` : ''} loads
            </span>
          }
        />

        <MuscleGroupFilter
          exercises={exercises}
          value={muscleFilter}
          onChange={setMuscleFilter}
        />

        <div className="table-scroll -mx-1 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100/80 text-[10px] tracking-[0.12em] text-ink-muted uppercase dark:border-slate-800">
                <th className="px-3 py-3 font-mono font-semibold">Grupo muscular</th>
                <th className="px-3 py-3 font-mono font-semibold">Exercício</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">Séries</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">Repetições</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">Rep. realizadas</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">Peso anterior</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">Peso atual</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">% Aumento</th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((ex, i) => {
                const increase = calcIncrease(ex.previousWeight, ex.currentWeight)
                const doneWell = ex.repsDone >= ex.reps
                return (
                  <tr
                    key={ex.id}
                    className="border-b border-slate-50 transition-colors hover:bg-brand-50/40 dark:border-slate-800/80 dark:hover:bg-slate-800/50"
                    style={{ animationDelay: `${0.03 * i}s` }}
                  >
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded border border-brand-200/60 bg-brand-50 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-brand-700 uppercase dark:border-slate-700 dark:bg-slate-900 dark:text-brand-300">
                        {ex.muscleGroup}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-ink">{ex.name}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{ex.sets}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{ex.reps}</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={[
                          'inline-flex min-w-[2rem] justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
                          doneWell
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                        ].join(' ')}
                      >
                        {ex.repsDone}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-ink-muted">
                      {ex.previousWeight > 0 ? `${ex.previousWeight} kg` : '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-brand-800 dark:text-brand-300">
                      {ex.currentWeight > 0 ? `${ex.currentWeight} kg` : '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums',
                          increase > 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : increase < 0
                              ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        ].join(' ')}
                      >
                        {increase > 0 ? '+' : ''}
                        {increase}%
                      </span>
                    </td>
                  </tr>
                )
              })}
              {filteredExercises.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-ink-muted">
                    {exercises.length === 0
                      ? 'Nenhum exercício montado ainda. Acesse Montar Treino no dashboard.'
                      : `Nenhum exercício em “${muscleFilter}”. Experimente outro grupo.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
