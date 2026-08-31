import type { Exercise } from '../types'
import { isBodyweightExercise } from '../lib/training'

export const liveInputClass =
  'rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm tabular-nums outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

export const liveInputCompactClass =
  'w-full min-w-0 rounded border border-slate-200 bg-transparent px-1 py-0.5 text-center text-xs tabular-nums outline-none focus:border-brand-400 dark:border-slate-700'

export function BodyweightBadge({ compact }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? 'text-[10px] font-bold tracking-wide text-brand-700 uppercase dark:text-brand-300'
          : 'inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700 uppercase dark:bg-slate-800 dark:text-brand-300'
      }
    >
      PC
    </span>
  )
}

export function RepsDoneInput({
  value,
  onChange,
  compact,
  className,
}: {
  value: number
  onChange: (value: number) => void
  compact?: boolean
  className?: string
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      className={
        className ?? (compact ? `${liveInputCompactClass} w-14` : `${liveInputClass} w-20`)
      }
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Repetições realizadas"
    />
  )
}

export function WeightInput({
  value,
  onChange,
  compact,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  compact?: boolean
  disabled?: boolean
}) {
  if (disabled) {
    return <BodyweightBadge compact={compact} />
  }
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      step={0.5}
      className={compact ? `${liveInputCompactClass} w-16` : `${liveInputClass} w-20`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Peso em kg"
    />
  )
}

export function formatExerciseVolume(ex: Exercise): string {
  if (ex.muscleGroup === 'Cardio') return '—'
  if (isBodyweightExercise(ex)) {
    const reps = ex.sets * ex.repsDone
    return reps > 0 ? `${reps} reps` : '—'
  }
  const vol = ex.currentWeight * ex.sets * ex.repsDone
  return vol > 0 ? Math.round(vol).toLocaleString('pt-BR') : '—'
}
