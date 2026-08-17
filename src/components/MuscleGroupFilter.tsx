import type { Exercise, MuscleGroup } from '../types'

type FilterValue = 'all' | MuscleGroup

interface MuscleGroupFilterProps {
  exercises: Exercise[]
  value: FilterValue
  onChange: (value: FilterValue) => void
}

export function MuscleGroupFilter({
  exercises,
  value,
  onChange,
}: MuscleGroupFilterProps) {
  const counts = exercises.reduce<Record<string, number>>((acc, ex) => {
    acc[ex.muscleGroup] = (acc[ex.muscleGroup] ?? 0) + 1
    return acc
  }, {})

  const groups = Object.keys(counts).sort() as MuscleGroup[]

  const chips: { key: FilterValue; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: exercises.length },
    ...groups.map((g) => ({
      key: g as FilterValue,
      label: g,
      count: counts[g] ?? 0,
    })),
  ]

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="tech-label">Filtrar por grupo muscular</p>
        {value !== 'all' && (
          <button
            type="button"
            onClick={() => onChange('all')}
            className="font-mono text-[11px] font-semibold tracking-wider text-brand-600 uppercase hover:text-[#b33a3a] dark:text-brand-300"
          >
            limpar
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
        {chips.map((chip) => {
          const active = value === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChange(chip.key)}
              className={[
                'inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs font-semibold tracking-wide uppercase transition-all',
                active
                  ? 'border-transparent bg-[#2c4566] text-white'
                  : 'border-brand-100 bg-white text-brand-700 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-slate-500',
              ].join(' ')}
            >
              {chip.label}
              <span
                className={[
                  'rounded px-1.5 py-0.5 text-[10px] tabular-nums',
                  active
                    ? 'bg-white/15 text-white/90'
                    : 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-slate-400',
                ].join(' ')}
              >
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export type MuscleFilter = FilterValue
