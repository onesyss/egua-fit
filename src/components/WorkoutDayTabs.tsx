import { TRAINING_DAYS, exerciseDay } from '../lib/training'
import type { Exercise, TrainingDay } from '../types'

export function WorkoutDayTabs({
  exercises,
  value,
  onChange,
}: {
  exercises: Exercise[]
  value: TrainingDay
  onChange: (day: TrainingDay) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TRAINING_DAYS.map((day) => {
        const count = exercises.filter((e) => exerciseDay(e) === day).length
        const active = value === day
        return (
          <button
            key={day}
            type="button"
            onClick={() => onChange(day)}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              active
                ? 'bg-[#2c4566] text-white shadow-sm'
                : 'bg-brand-50 text-ink-muted hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
          >
            Treino {day}
            <span
              className={`ml-1.5 text-[10px] font-semibold ${
                active ? 'text-white/80' : 'text-ink-muted'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
