import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  accent?: 'blue' | 'red' | 'muted' | 'green'
  delay?: string
}

const accents = {
  blue: 'from-[#3d5a80] to-[#2c4566]',
  red: 'from-[#b33a3a] to-[#8f2e2e]',
  muted: 'from-[#5f7a9e] to-[#3d5a80]',
  green: 'from-[#3d8f6a] to-[#2f6b50]',
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'blue',
  delay = '',
}: MetricCardProps) {
  return (
    <div
      className={`tech-panel animate-fade-up ${delay} group p-4 transition-shadow hover:shadow-md sm:p-5`}
    >
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="tech-label">{title}</p>
          <p className="tech-value mt-1.5 text-2xl text-ink sm:text-[1.65rem]">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-ink-muted">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white opacity-95 shadow-sm ${accents[accent]}`}
        >
          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="h-px w-4 bg-gradient-to-r from-[#b33a3a]/70 to-[#3d5a80]/70" />
          <span className="tech-label text-brand-600 dark:text-brand-300">
            módulo
          </span>
        </div>
        <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm font-medium text-ink-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function Panel({
  children,
  className = '',
  delay = '',
}: {
  children: ReactNode
  className?: string
  delay?: string
}) {
  return (
    <div className={`tech-panel animate-fade-up ${delay} p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}
