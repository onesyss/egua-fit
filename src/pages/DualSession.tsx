import { Link } from 'react-router-dom'
import {
  Trophy,
  UsersRound,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { calcIncrease } from '../data/mock'
import {
  exerciseVolumeKg,
  isPrNow,
  musclesWorked,
} from '../lib/training'
import { SessionTimer } from '../components/SessionTimer'
import { StudentAvatar, StudentName } from '../components/StudentIdentity'
import { Panel } from '../components/ui'
import type { StudentRecord } from '../types'

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
  const muscles = musclesWorked(record.exercises)

  return (
    <Panel className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <StudentAvatar student={record.student} size="sm" />
          <div className="min-w-0">
            <StudentName
              student={record.student}
              as="h2"
              className="truncate font-display text-lg font-bold"
            />
            <p className="text-xs text-ink-muted">
              {record.metrics.totalLoad.toLocaleString('pt-BR')} kg levantados
            </p>
          </div>
        </div>
        <Link
          to={`/aluno/${sid}/treino`}
          className="shrink-0 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
        >
          Tela completa
        </Link>
      </div>

      <SessionTimer
        compact
        clock={record.sessionClock}
        exercises={record.exercises}
        onStart={() => startSession(sid)}
        onPause={() => pauseSession(sid)}
        onReset={() => resetSession(sid)}
        onStartWork={() => startWork(sid)}
        onPauseWork={() => pauseWork(sid)}
      />

      {muscles.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
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

      <div className="mt-3 max-h-[420px] overflow-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-[10px] tracking-wider text-ink-muted uppercase">
              <th className="py-2">Exercício</th>
              <th className="py-2 text-center">Kg</th>
              <th className="py-2 text-center">Reps</th>
              <th className="py-2 text-right">Vol.</th>
            </tr>
          </thead>
          <tbody>
            {record.exercises.map((ex) => {
              const pr = isPrNow(ex, record.personalRecords)
              const inc = calcIncrease(ex.previousWeight, ex.currentWeight)
              return (
                <tr
                  key={ex.id}
                  className="border-b border-slate-50 dark:border-slate-800"
                >
                  <td className="py-1.5">
                    <span className="font-medium">{ex.name}</span>
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
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="w-16 rounded border border-slate-200 bg-transparent px-1 py-0.5 text-center dark:border-slate-700"
                      value={ex.currentWeight}
                      onChange={(e) =>
                        updateExercise(
                          ex.id,
                          { currentWeight: Number(e.target.value) },
                          sid,
                        )
                      }
                    />
                  </td>
                  <td className="py-1.5 text-center">
                    <input
                      type="number"
                      min={0}
                      className="w-14 rounded border border-slate-200 bg-transparent px-1 py-0.5 text-center dark:border-slate-700"
                      value={ex.repsDone}
                      onChange={(e) =>
                        updateExercise(
                          ex.id,
                          { repsDone: Number(e.target.value) },
                          sid,
                        )
                      }
                    />
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {Math.round(exerciseVolumeKg(ex))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => saveWorkout(sid)}
        className="mt-4 w-full rounded-xl bg-[#2c4566] px-3 py-2 text-sm font-semibold text-white hover:bg-[#233650]"
      >
        Salvar treino
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
          volte aqui para treinar os dois ao mesmo tempo.
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
    <div className="space-y-4">
      <div>
        <p className="tech-label text-brand-600 dark:text-brand-300">
          atendimento em dupla
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">
          Duas guias ativas
        </h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {pinned.slice(0, 2).map((record) => (
          <DualPane key={record.student.id} record={record} />
        ))}
      </div>
    </div>
  )
}
