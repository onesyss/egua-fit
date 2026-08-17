import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  Flame,
  Layers,
  Percent,
  Play,
  Trophy,
  Weight,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { calcIncrease, energyLabel, formatDate } from '../data/mock'
import {
  ExerciseCompareBars,
  FrequencyDonut,
  MusclesWorkedBars,
  PerformanceRepsChart,
  VolumeHistoryChart,
} from '../components/Charts'
import {
  MuscleGroupFilter,
  type MuscleFilter,
} from '../components/MuscleGroupFilter'
import { ExerciseGuideModal } from '../components/ExerciseGuideModal'
import { StudentName } from '../components/StudentIdentity'
import {
  exerciseVolumeKg,
  formatDuration,
  historyVolumePoints,
  isPrNow,
  musclesWorked,
} from '../lib/training'
import { dayGreeting } from '../lib/greeting'

function StatCard({
  title,
  value,
  unit,
}: {
  title: string
  value: string | number
  unit?: string
}) {
  return (
    <div className="rounded-2xl border border-brand-100/80 bg-white px-4 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
      <p className="text-xs font-medium tracking-wide text-ink-muted">{title}</p>
      <p className="mt-2 font-mono text-xl font-bold tracking-tight text-ink sm:mt-3 sm:text-3xl sm:text-[2rem]">
        {value}
        {unit && (
          <span className="ml-1 text-base font-medium text-ink-muted">{unit}</span>
        )}
      </p>
    </div>
  )
}

export function PerformanceDashboard() {
  const { studentId } = useParams()
  const { students, setActiveId } = useGym()
  const record = students.find((s) => s.student.id === studentId)
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('all')
  const [guideExercise, setGuideExercise] = useState<{
    name: string
    muscleGroup: string
  } | null>(null)

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  const filteredExercises = useMemo(() => {
    if (!record) return []
    if (muscleFilter === 'all') return record.exercises
    return record.exercises.filter((e) => e.muscleGroup === muscleFilter)
  }, [record, muscleFilter])

  if (!record) return <Navigate to="/" replace />

  const { student, exercises, metrics, evolution, history, personalRecords } =
    record
  const freqPercent = Math.min(Math.round((metrics.frequency / 5) * 100), 100)
  const volumePoints = historyVolumePoints(history)
  const muscles = musclesWorked(exercises)

  return (
    <div className="space-y-5">
      {guideExercise && (
        <ExerciseGuideModal
          exerciseName={guideExercise.name}
          muscleGroup={guideExercise.muscleGroup}
          onClose={() => setGuideExercise(null)}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-ink-muted hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Alunos
          </Link>
          <div>
            <p className="tech-label text-brand-600 dark:text-brand-300">
              {dayGreeting()}
            </p>
            <StudentName
              student={student}
              as="h1"
              className="font-display text-2xl font-bold sm:text-3xl"
            />
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Matrícula {formatDate(student.enrollmentDate)}
              </span>
              <span>{student.daysAccompanied} dias acompanhados</span>
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            to={`/aluno/${student.id}/treino`}
            className="rounded-xl bg-[#2c4566] px-3.5 py-2 text-center text-sm font-semibold text-white hover:bg-[#233650]"
          >
            Montar / editar treino
          </Link>
          <Link
            to={`/aluno/${student.id}/protocolo`}
            className="rounded-xl border border-brand-100 px-3.5 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
          >
            Protocolo
          </Link>
          <Link
            to={`/aluno/${student.id}/evolucao`}
            className="rounded-xl border border-brand-100 px-3.5 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
          >
            Evolução física
          </Link>
        </div>
      </div>

      {/* Programação de treino */}
      <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-lg font-bold text-ink">
                Programação de treino
              </h2>
            </div>
            <p className="text-sm text-ink-muted">
              {muscleFilter === 'all'
                ? `${exercises.length} exercícios no programa`
                : `Filtrado: ${muscleFilter} · ${filteredExercises.length} de ${exercises.length}`}
            </p>
          </div>
          <Link
            to={`/aluno/${student.id}/treino`}
            className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            Editar programação →
          </Link>
        </div>

        <MuscleGroupFilter
          exercises={exercises}
          value={muscleFilter}
          onChange={setMuscleFilter}
        />

        <div className="table-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm sm:min-w-[900px]">
            <thead>
              <tr className="border-b border-brand-100 text-[10px] tracking-[0.1em] text-ink-muted uppercase dark:border-slate-800">
                <th className="px-3 py-3 font-mono font-semibold">
                  Grupo muscular
                </th>
                <th className="px-3 py-3 font-mono font-semibold">Exercício</th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  Séries
                </th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  Repetições
                </th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  Rep. realizadas
                </th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  Peso anterior
                </th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  Peso atual
                </th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  Volume (kg)
                </th>
                <th className="px-3 py-3 text-center font-mono font-semibold">
                  % Aumento
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((ex) => {
                const increase = calcIncrease(
                  ex.previousWeight,
                  ex.currentWeight,
                )
                const doneWell = ex.repsDone >= ex.reps
                const pr = isPrNow(ex, personalRecords)
                const vol = exerciseVolumeKg(ex)
                return (
                  <tr
                    key={ex.id}
                    className="border-b border-slate-50 transition-colors hover:bg-brand-50/40 dark:border-slate-800/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-300">
                        {ex.muscleGroup}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setGuideExercise({
                            name: ex.name,
                            muscleGroup: ex.muscleGroup,
                          })
                        }
                        className="group inline-flex max-w-full items-center gap-1.5 text-left font-medium text-brand-800 transition hover:text-[#b33a3a] hover:underline dark:text-brand-200"
                        title="Ver como executar"
                      >
                        <span className="truncate">{ex.name}</span>
                        {pr && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Trophy className="h-3 w-3" />
                            PR
                          </span>
                        )}
                        <Play className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.sets}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.reps}
                    </td>
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
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-brand-800 dark:text-brand-200">
                      {ex.currentWeight > 0 ? `${ex.currentWeight} kg` : '—'}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {vol > 0 ? vol.toLocaleString('pt-BR') : '—'}
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
                  <td
                    colSpan={9}
                    className="px-3 py-12 text-center text-ink-muted"
                  >
                    {exercises.length === 0 ? (
                      <span>
                        Nenhum exercício no treino.{' '}
                        <Link
                          to={`/aluno/${student.id}/treino`}
                          className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
                        >
                          Montar treino
                        </Link>
                      </span>
                    ) : (
                      `Nenhum exercício em “${muscleFilter}”.`
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layout desempenho */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              title="Carga levantada"
              value={metrics.totalLoad.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
              unit="kg"
            />
            <StatCard title="Total Exercícios" value={metrics.totalExercises} />
            <StatCard title="Quantidade de séries" value={metrics.totalSets} />
            <StatCard title="%AC" value={`${metrics.acPercent}%`} />
          </div>

          <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">
                Desempenho
              </h2>
              <Percent className="h-4 w-4 text-ink-muted" />
            </div>
            <div className="chart-frame h-[200px] sm:h-[240px]">
              <PerformanceRepsChart data={evolution.repsSessions} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
            <h2 className="mb-1 font-display text-lg font-bold text-ink">
              Frequência
            </h2>
            <p className="mb-2 text-xs text-ink-muted">
              {metrics.frequency}x por semana (meta 5x)
            </p>
            <FrequencyDonut percent={freqPercent} />
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-brand-100/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-ink-muted">
              <Flame className="h-4 w-4 text-[#b33a3a]" />
              <h2 className="font-display text-lg font-bold text-ink">
                Nível de Energia
              </h2>
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:mt-4 sm:text-6xl">
              {Math.round(metrics.energyLevel * 10)}
            </p>
            <p className="mt-1 text-lg font-semibold text-[#b33a3a]">
              {energyLabel(metrics.energyLevel)}
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Escala 0–100 com base no nível informado no treino
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-7">
          <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
            <h2 className="mb-1 font-display text-lg font-bold text-ink">
              Histórico de carga levantada
            </h2>
            <p className="mb-2 text-xs text-ink-muted">
              Volume em kg e variação percentual entre treinos salvos
            </p>
            <div className="chart-frame h-[200px] sm:h-[260px]">
              {volumePoints.length > 0 ? (
                <VolumeHistoryChart data={volumePoints} />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-ink-muted">
                  Salve um treino para ver o histórico.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 lg:col-span-5">
          <h2 className="mb-1 font-display text-lg font-bold text-ink">
            Músculos trabalhados
          </h2>
          <p className="mb-2 text-xs text-ink-muted">
            Volume por grupo muscular no programa atual
          </p>
          <div className="chart-frame h-[200px] sm:h-[260px]">
            {muscles.length > 0 ? (
              <MusclesWorkedBars data={muscles} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-ink-muted">
                Sem exercícios no programa.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 lg:col-span-12">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Layers className="h-4 w-4 text-ink-muted" />
            <h2 className="font-display text-lg font-bold text-ink">
              Planejado × realizado por exercício
            </h2>
          </div>
          <div className="chart-frame h-[240px] sm:h-[300px]">
            {exercises.length > 0 ? (
              <ExerciseCompareBars exercises={exercises} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
                <Dumbbell className="h-8 w-8 opacity-40" />
                <p>Nenhum exercício montado ainda.</p>
                <Link
                  to={`/aluno/${student.id}/treino`}
                  className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  Ir para montar treino
                </Link>
              </div>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 lg:col-span-12">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">
              Treinos passados
            </h2>
            <div className="table-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b text-[10px] tracking-wider text-ink-muted uppercase">
                    <th className="px-2 py-2">Data</th>
                    <th className="px-2 py-2 text-right">Carga (kg)</th>
                    <th className="px-2 py-2 text-right">Variação</th>
                    <th className="px-2 py-2 text-right">Sessão</th>
                    <th className="px-2 py-2 text-right">Trabalho</th>
                    <th className="px-2 py-2 text-center">PRs</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-50 dark:border-slate-800"
                    >
                      <td className="px-2 py-2">
                        {formatDate(s.date.slice(0, 10))}
                      </td>
                      <td className="px-2 py-2 text-right font-mono font-semibold tabular-nums">
                        {s.volumeKg.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <span
                          className={
                            s.volumeChangePercent > 0
                              ? 'font-bold text-emerald-600'
                              : s.volumeChangePercent < 0
                                ? 'text-red-500'
                                : 'text-ink-muted'
                          }
                        >
                          {s.volumeChangePercent > 0 ? '+' : ''}
                          {s.volumeChangePercent}%
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-ink-muted">
                        {formatDuration(s.sessionDurationSec)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-ink-muted">
                        {formatDuration(s.workDurationSec)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {s.exercises.filter((e) => e.isPr).length || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-12">
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <Weight className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-ink-muted">Carga levantada</p>
              <p className="font-mono font-bold text-ink">
                {metrics.totalLoad.toLocaleString('pt-BR')} kg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <Dumbbell className="h-5 w-5 text-[#b33a3a]" />
            <div>
              <p className="text-xs text-ink-muted">Exercícios no programa</p>
              <p className="font-mono font-bold text-ink">
                {metrics.totalExercises}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <Percent className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-ink-muted">% de acerto / conclusão</p>
              <p className="font-mono font-bold text-ink">{metrics.acPercent}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
