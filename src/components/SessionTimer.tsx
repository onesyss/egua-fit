import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Timer, Zap } from 'lucide-react'
import type { Exercise, SessionClock } from '../types'
import {
  estimatedWorkSec,
  formatDuration,
  liveElapsed,
  liveWorkElapsed,
} from '../lib/training'

export function SessionTimer({
  clock,
  exercises,
  onStart,
  onPause,
  onReset,
  onStartWork,
  onPauseWork,
  compact = false,
}: {
  clock: SessionClock
  exercises: Exercise[]
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onStartWork: () => void
  onPauseWork: () => void
  compact?: boolean
}) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!clock.running && !clock.workRunning) return
    const id = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [clock.running, clock.workRunning])

  const sessionSec = liveElapsed(clock)
  const workSec = liveWorkElapsed(clock)
  const estimated = estimatedWorkSec(exercises)
  const density =
    sessionSec > 0 ? Math.round((Math.max(workSec, estimated) / sessionSec) * 100) : 0

  return (
    <div
      className={
        compact
          ? 'grid gap-2 sm:grid-cols-2'
          : 'grid gap-3 sm:grid-cols-2'
      }
    >
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/50">
        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
          <Timer className="h-3.5 w-3.5" />
          Tempo da sessão
        </p>
        <p className="font-mono text-2xl font-bold tabular-nums text-ink">
          {formatDuration(sessionSec)}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {clock.running ? (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Pause className="h-3 w-3" /> Pausar
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-1 rounded-lg bg-[#2c4566] px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Play className="h-3 w-3" /> Iniciar
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-ink-muted dark:border-slate-700"
          >
            <RotateCcw className="h-3 w-3" /> Zerar
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-red-100 bg-red-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
          <Zap className="h-3.5 w-3.5 text-[#b33a3a]" />
          Tempo de trabalho
        </p>
        <p className="font-mono text-2xl font-bold tabular-nums text-ink">
          {formatDuration(workSec)}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-muted">
          Estimado pelas reps: {formatDuration(estimated)}
          {sessionSec > 0 ? ` · densidade ${Math.min(density, 100)}%` : ''}
        </p>
        <div className="mt-2">
          {clock.workRunning ? (
            <button
              type="button"
              onClick={onPauseWork}
              className="inline-flex items-center gap-1 rounded-lg bg-[#b33a3a] px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Pause className="h-3 w-3" /> Pausa (descanso)
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartWork}
              className="inline-flex items-center gap-1 rounded-lg bg-[#b33a3a] px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Play className="h-3 w-3" /> Em série
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
