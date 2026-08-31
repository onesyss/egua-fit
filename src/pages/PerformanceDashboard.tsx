import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Flame,
  History,
  Layers,
  Percent,
  Play,
  Save,
  Trophy,
  Weight,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { energyLabel, formatDate, recomputeMetrics } from '../data/mock'
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
import {
  BodyweightBadge,
  formatExerciseVolume,
  RepsDoneInput,
} from '../components/ExerciseLiveFields'
import { SessionTimer } from '../components/SessionTimer'
import { StudentEvolutionPanel } from '../components/StudentEvolutionPanel'
import { StudentName } from '../components/StudentIdentity'
import { WorkoutDayTabs } from '../components/WorkoutDayTabs'
import { CollapsibleCard } from '../components/ui'
import {
  cardioMinutes,
  exerciseDay,
  exerciseProgressPercent,
  firstTrainingDayWithExercises,
  formatDuration,
  historyVolumePoints,
  isBodyweightExercise,
  isPrNow,
  musclesWorked,
  parseTrainingDay,
} from '../lib/training'
import type { TrainingDay } from '../types'
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
  const {
    students,
    setActiveId,
    updateMetricsMeta,
    updateExercise,
    saveWorkout,
    startSession,
    pauseSession,
    resetSession,
    startWork,
    pauseWork,
  } = useGym()
  const record = students.find((s) => s.student.id === studentId)
  const [searchParams, setSearchParams] = useSearchParams()
  const trainingDay = parseTrainingDay(searchParams.get('treino'))
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('all')
  const [energyLevel, setEnergyLevel] = useState(8)
  const [flashMsg, setFlashMsg] = useState<string | null>(null)
  const [guideExercise, setGuideExercise] = useState<{
    name: string
    muscleGroup: string
  } | null>(null)

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  useEffect(() => {
    if (record) setEnergyLevel(record.metrics.energyLevel)
  }, [record?.student.id, record?.metrics.energyLevel])

  const flash = (msg: string) => {
    setFlashMsg(msg)
    window.setTimeout(() => setFlashMsg(null), 2000)
  }

  const setTrainingDay = (day: TrainingDay) => {
    setSearchParams(day === 'A' ? {} : { treino: day })
  }

  const dayExercises = useMemo(() => {
    if (!record) return []
    return record.exercises.filter((e) => exerciseDay(e) === trainingDay)
  }, [record, trainingDay])

  const filteredExercises = useMemo(() => {
    if (muscleFilter === 'all') return dayExercises
    return dayExercises.filter((e) => e.muscleGroup === muscleFilter)
  }, [dayExercises, muscleFilter])

  useEffect(() => {
    if (!record || dayExercises.length > 0) return
    const fallback = firstTrainingDayWithExercises(record.exercises)
    if (fallback && fallback !== trainingDay) {
      setTrainingDay(fallback)
    }
  }, [record, dayExercises.length, trainingDay])

  if (!record) return <Navigate to="/" replace />

  const { student, metrics, evolution, history, personalRecords } = record
  const sid = student.id
  const dayMetrics = useMemo(
    () =>
      recomputeMetrics(dayExercises, metrics.frequency, metrics.energyLevel),
    [dayExercises, metrics.frequency, metrics.energyLevel],
  )
  const freqPercent = Math.min(Math.round((metrics.frequency / 5) * 100), 100)
  const volumePoints = historyVolumePoints(history)
  const muscles = musclesWorked(dayExercises)
  const treinoQuery =
    trainingDay === 'A' ? '' : `?treino=${trainingDay}`

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
            to={
              trainingDay === 'A'
                ? `/aluno/${student.id}/treino`
                : `/aluno/${student.id}/treino?treino=${trainingDay}`
            }
            className="rounded-xl bg-[#2c4566] px-3.5 py-2 text-center text-sm font-semibold text-white hover:bg-[#233650]"
          >
            Montar / editar Treino {trainingDay}
          </Link>
          <Link
            to={`/aluno/${student.id}/anamnese`}
            className="rounded-xl border border-brand-100 px-3.5 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Anamnese
            </span>
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
          <Link
            to={`/aluno/${student.id}/evolucao#peso`}
            className="rounded-xl border border-brand-100 px-3.5 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
          >
            Registrar peso
          </Link>
        </div>
        {flashMsg && (
          <div className="w-full rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 sm:w-auto">
            {flashMsg}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Treino do dia
            </h2>
            <p className="text-sm text-ink-muted">
              Selecione A, B ou C — só os exercícios deste treino aparecem abaixo
            </p>
          </div>
        </div>
        <WorkoutDayTabs
          exercises={record.exercises}
          value={trainingDay}
          onChange={setTrainingDay}
          hideEmpty
        />
      </div>

      <div className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Sessão de treino
            </h2>
            <p className="text-sm text-ink-muted">
              Treino {trainingDay} · {dayExercises.length} exercício
              {dayExercises.length === 1 ? '' : 's'} · tempo, energia e salvar sessão
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              saveWorkout(sid, trainingDay)
              flash('Treino salvo no histórico')
            }}
            disabled={dayExercises.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2c4566] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Salvar treino
          </button>
        </div>

        <SessionTimer
          clock={record.sessionClock}
          exercises={dayExercises}
          onStart={() => startSession(sid)}
          onPause={() => pauseSession(sid)}
          onReset={() => resetSession(sid)}
          onStartWork={() => startWork(sid)}
          onPauseWork={() => pauseWork(sid)}
        />

        <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#b33a3a]" />
              <p className="text-sm font-semibold text-ink">
                Nível de energia do aluno
              </p>
            </div>
            <p className="text-sm font-semibold text-[#b33a3a]">
              {energyLabel(energyLevel)} · {Math.round(energyLevel * 10)}/100
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={energyLevel}
            onChange={(e) => {
              const level = Number(e.target.value)
              setEnergyLevel(level)
              updateMetricsMeta({ energyLevel: level }, sid)
            }}
            className="h-2 w-full cursor-pointer accent-[#b33a3a]"
          />
          <div className="mt-1 flex justify-between text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
            <span>Baixa</span>
            <span>Média</span>
            <span>Alta</span>
          </div>
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
              Treino {trainingDay}
              {muscleFilter === 'all'
                ? ` · ${dayExercises.length} exercícios`
                : ` · ${muscleFilter} · ${filteredExercises.length} de ${dayExercises.length}`}
            </p>
          </div>
          <Link
            to={
              trainingDay === 'A'
                ? `/aluno/${student.id}/treino`
                : `/aluno/${student.id}/treino?treino=${trainingDay}`
            }
            className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            Editar Treino {trainingDay} →
          </Link>
        </div>

        <MuscleGroupFilter
          exercises={dayExercises}
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
                  Séries / min
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
                const increase = exerciseProgressPercent(ex)
                const pr = isPrNow(ex, personalRecords)
                const bw = isBodyweightExercise(ex)
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
                        {bw && (
                          <BodyweightBadge compact />
                        )}
                        {pr && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Trophy className="h-3 w-3" />
                            PR
                          </span>
                        )}
                        <Play className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                      </button>
                      {ex.muscleGroup === 'Cardio' && ex.incline != null && (
                          <p className="mt-0.5 text-[11px] text-ink-muted">
                            {ex.incline}% inclinação
                          </p>
                        )}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.muscleGroup === 'Cardio'
                        ? `${cardioMinutes(ex)} min`
                        : ex.sets}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.muscleGroup === 'Cardio' ? '—' : ex.reps}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {ex.muscleGroup === 'Cardio' ? (
                        '—'
                      ) : (
                        <RepsDoneInput
                          value={ex.repsDone}
                          onChange={(repsDone) =>
                            updateExercise(ex.id, { repsDone }, sid)
                          }
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-ink-muted">
                      {bw ? 'PC' : ex.previousWeight > 0 ? `${ex.previousWeight} kg` : '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-brand-800 dark:text-brand-200">
                      {bw ? 'PC' : ex.currentWeight > 0 ? `${ex.currentWeight} kg` : '—'}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {formatExerciseVolume(ex)}
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
                    {dayExercises.length === 0 ? (
                      <span>
                        Nenhum exercício no Treino {trainingDay}.{' '}
                        <Link
                          to={
                            trainingDay === 'A'
                              ? `/aluno/${student.id}/treino`
                              : `/aluno/${student.id}/treino?treino=${trainingDay}`
                          }
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

      <StudentEvolutionPanel record={record} studentName={student.name} />

      {/* Layout desempenho */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              title="Carga levantada"
              value={dayMetrics.totalLoad.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
              unit="kg"
            />
            <StatCard title="Exercícios do treino" value={dayMetrics.totalExercises} />
            <StatCard title="Quantidade de séries" value={dayMetrics.totalSets} />
            <StatCard title="%AC" value={`${dayMetrics.acPercent}%`} />
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
            Volume por grupo muscular no Treino {trainingDay}
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
              Planejado × realizado · Treino {trainingDay}
            </h2>
          </div>
          <div className="chart-frame h-[240px] sm:h-[300px]">
            {dayExercises.length > 0 ? (
              <ExerciseCompareBars exercises={dayExercises} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
                <Dumbbell className="h-8 w-8 opacity-40" />
                <p>Nenhum exercício montado ainda.</p>
                <Link
                  to={`/aluno/${student.id}/treino${treinoQuery}`}
                  className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  Ir para montar treino
                </Link>
              </div>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <CollapsibleCard
            title="Treinos passados"
            subtitle={`${history.length} sessões salvas`}
            icon={History}
            className="lg:col-span-12"
          >
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
          </CollapsibleCard>
        )}

        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-12">
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <Weight className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-ink-muted">Carga · Treino {trainingDay}</p>
              <p className="font-mono font-bold text-ink">
                {dayMetrics.totalLoad.toLocaleString('pt-BR')} kg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <Dumbbell className="h-5 w-5 text-[#b33a3a]" />
            <div>
              <p className="text-xs text-ink-muted">Exercícios do treino</p>
              <p className="font-mono font-bold text-ink">
                {dayMetrics.totalExercises}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <Percent className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-xs text-ink-muted">% conclusão · Treino {trainingDay}</p>
              <p className="font-mono font-bold text-ink">{dayMetrics.acPercent}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
