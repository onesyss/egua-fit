import { useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'

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

export function CollapsibleCard({
  title,
  subtitle,
  icon: Icon,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
  className = '',
  id,
  headerExtra,
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  className?: string
  id?: string
  headerExtra?: ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const setOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(open) : value
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }
  const toggle = () => setOpen((value) => !value)

  return (
    <section
      id={id}
      className={`relative rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-3 pr-11 sm:pr-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {Icon && (
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-bold text-ink">
                {title}
              </span>
              {subtitle && (
                <span className="mt-0.5 block text-sm font-normal text-ink-muted">
                  {subtitle}
                </span>
              )}
            </span>
          </button>
          {headerExtra && (
            <div
              className="flex shrink-0 flex-wrap items-end gap-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {headerExtra}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Recolher seção' : 'Expandir seção'}
        title={open ? 'Recolher' : 'Expandir'}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-white text-ink-muted shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-brand-200 sm:right-4 sm:top-4"
      >
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`collapsible-body mt-4 ${open ? 'block' : 'hidden'}`}
        aria-hidden={!open}
      >
        {children}
      </div>
    </section>
  )
}
