import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, UsersRound } from 'lucide-react'
import { useGym } from '../context/DataContext'
import {
  BodyweightBadge,
  formatExerciseVolume,
  RepsDoneInput,
  WeightInput,
} from '../components/ExerciseLiveFields'
import { SessionTimer } from '../components/SessionTimer'
import { StudentAvatar, StudentName } from '../components/StudentIdentity'
import { WorkoutDayTabs } from '../components/WorkoutDayTabs'
import { Panel } from '../components/ui'
import type { Exercise, StudentRecord, TrainingDay } from '../types'
import {
  exerciseDay,
  exerciseProgressPercent,
  firstTrainingDayWithExercises,
  isBodyweightExercise,
  isPrNow,
  musclesWorked,
} from '../lib/training'

function DualPane({ record }: { record: StudentRecord }) {
  const {
    saveWorkout,
    startSession,
    pauseSession,
    resetSession,
    startWork,
    pauseWork,
    updateExercise,
  } = useGym()
  const sid = record.student.id
  const [trainingDay, setTrainingDay] = useState<TrainingDay>(() => {
    return firstTrainingDayWithExercises(record.exercises) ?? 'A'
  })

  useEffect(() => {
    if (record.exercises.some((e) => exerciseDay(e) === trainingDay)) return
    const fallback = firstTrainingDayWithExercises(record.exercises)
    if (fallback) setTrainingDay(fallback)
  }, [record.exercises, trainingDay])

  const dayExercises = useMemo(
    () => record.exercises.filter((e) => exerciseDay(e) === trainingDay),
    [record.exercises, trainingDay],
  )
  const muscles = musclesWorked(dayExercises)

  const patchExercise = (ex: Exercise, patch: Partial<Exercise>) => {
    updateExercise(ex.id, patch, sid)
  }

  return (
    <Panel className="flex min-h-0 min-w-0 flex-col xl:max-h-[calc(100vh-7rem)]">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <StudentAvatar student={record.student} size="sm" />
          <div className="min-w-0">
            <StudentName
              student={record.student}
              as="h2"
              className="truncate font-display text-lg font-bold"
            />
            <p className="text-xs text-ink-muted">
              Treino {trainingDay} · {dayExercises.length} exercícios
            </p>
          </div>
        </div>
        <Link
          to={
            trainingDay === 'A'
              ? `/aluno/${sid}/treino`
              : `/aluno/${sid}/treino?treino=${trainingDay}`
          }
          className="shrink-0 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
        >
          Tela completa
        </Link>
      </div>

      <div className="mb-3 shrink-0">
        <WorkoutDayTabs
          exercises={record.exercises}
          value={trainingDay}
          onChange={setTrainingDay}
          hideEmpty
        />
      </div>

      <SessionTimer
        compact
        clock={record.sessionClock}
        exercises={dayExercises}
        onStart={() => startSession(sid)}
        onPause={() => pauseSession(sid)}
        onReset={() => resetSession(sid)}
        onStartWork={() => startWork(sid)}
        onPauseWork={() => pauseWork(sid)}
      />

      {muscles.length > 0 && (
        <ul className="mt-3 flex shrink-0 flex-wrap gap-1.5">
          {muscles.map((m) => (
            <li
              key={m.group}
              className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800 dark:bg-slate-800 dark:text-brand-200"
            >
              {m.group}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white dark:bg-slate-900">
            <tr className="border-b text-[10px] tracking-wider text-ink-muted uppercase">
              <th className="py-2 pr-2">Exercício</th>
              <th className="py-2 text-center">Kg / PC</th>
              <th className="py-2 text-center">Reps</th>
              <th className="py-2 text-right">Vol.</th>
            </tr>
          </thead>
          <tbody>
            {dayExercises.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-ink-muted">
                  Nenhum exercício no Treino {trainingDay}.
                </td>
              </tr>
            )}
            {dayExercises.map((ex) => {
              const pr = isPrNow(ex, record.personalRecords)
              const inc = exerciseProgressPercent(ex)
              const bw = isBodyweightExercise(ex)
              return (
                <tr
                  key={ex.id}
                  className="border-b border-slate-50 dark:border-slate-800"
                >
                  <td className="py-1.5 pr-2">
                    <span className="font-medium">{ex.name}</span>
                    {bw && (
                      <span className="ml-1">
                        <BodyweightBadge compact />
                      </span>
                    )}
                    {pr && (
                      <Trophy className="ml-1 inline h-3 w-3 text-amber-500" />
                    )}
                    {inc !== 0 && (
                      <span
                        className={`ml-1 ${inc > 0 ? 'text-emerald-600' : 'text-ink-muted'}`}
                      >
                        {inc > 0 ? '+' : ''}
                        {inc}%
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 text-center">
                    {ex.muscleGroup === 'Cardio' ? (
                      '—'
                    ) : (
                      <WeightInput
                        compact
                        disabled={bw}
                        value={ex.currentWeight}
                        onChange={(currentWeight) =>
                          patchExercise(ex, { currentWeight })
                        }
                      />
                    )}
                  </td>
                  <td className="py-1.5 text-center">
                    {ex.muscleGroup === 'Cardio' ? (
                      '—'
                    ) : (
                      <RepsDoneInput
                        compact
                        value={ex.repsDone}
                        onChange={(repsDone) => patchExercise(ex, { repsDone })}
                      />
                    )}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {formatExerciseVolume(ex)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => saveWorkout(sid, trainingDay)}
        disabled={dayExercises.length === 0}
        className="mt-4 w-full shrink-0 rounded-xl bg-[#2c4566] px-3 py-2 text-sm font-semibold text-white hover:bg-[#233650] disabled:opacity-50"
      >
        Salvar treino {trainingDay}
      </button>
    </Panel>
  )
}

export function DualSession() {
  const { pinned } = useGym()

  if (pinned.length < 2) {
    return (
      <div className="tech-panel flex flex-col items-center gap-3 p-12 text-center">
        <UsersRound className="h-8 w-8 text-ink-muted" />
        <h1 className="font-display text-2xl font-bold text-ink">
          Atendimento em dupla
        </h1>
        <p className="max-w-md text-sm text-ink-muted">
          Abra o dashboard de dois alunos para fixá-los nas guias do topo. Depois
          volte aqui para treinar os dois ao mesmo tempo — cada um vê só o treino
          do dia selecionado.
        </p>
        <Link
          to="/"
          className="rounded-xl bg-[#2c4566] px-4 py-2 text-sm font-semibold text-white"
        >
          Escolher alunos
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <p className="tech-label text-brand-600 dark:text-brand-300">
          atendimento em dupla
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">
          Duas guias ativas
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cada coluna mostra apenas o treino A–E daquele aluno.
        </p>
      </div>
      <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-2 xl:items-stretch">
        {pinned.slice(0, 2).map((record) => (
          <DualPane key={record.student.id} record={record} />
        ))}
      </div>
    </div>
  )
}
