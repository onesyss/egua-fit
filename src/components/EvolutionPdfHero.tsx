import type { MonthlyEvolution } from '../lib/monthlyEvolution'
import { evolutionCelebrationMessage } from '../lib/monthlyEvolution'

export function EvolutionPdfHero({
  data,
  studentName,
  goal,
  printOnly = true,
  showMonth = false,
  headline: headlineOverride,
  message: messageOverride,
}: {
  data: MonthlyEvolution
  studentName: string
  goal?: string
  /** Se true, só aparece no PDF/impressão; na página pública use false */
  printOnly?: boolean
  showMonth?: boolean
  headline?: string
  message?: string
}) {
  const celebration = evolutionCelebrationMessage(data, studentName, goal)
  const headline = headlineOverride?.trim() || celebration.headline
  const message = messageOverride?.trim() || celebration.message
  const { highlights } = celebration

  return (
    <div
      className={`evolucao-pdf-hero evolucao-print-section relative overflow-hidden rounded-2xl text-white${
        printOnly ? ' evolucao-pdf-only' : ''
      }`}
      style={{
        backgroundColor: '#2c4566',
        backgroundImage:
          'linear-gradient(135deg, #1c2b40 0%, #2c4566 48%, #8f2e2e 100%)',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <div
        className="evolucao-pdf-hero-decor absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-22deg, transparent 0 78px, rgba(255,255,255,0.12) 78px 79px, transparent 79px 156px)',
        }}
        aria-hidden
      />
      <div
        className="evolucao-pdf-hero-decor absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b33a3a]/30 blur-2xl"
        aria-hidden
      />
      <div
        className="evolucao-pdf-hero-decor absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#3d5a80]/40 blur-2xl"
        aria-hidden
      />

      <div className="relative z-[1] px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="evolucao-pdf-mark h-11 w-11 shrink-0 overflow-hidden rounded-xl">
            <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
              <rect width="64" height="64" rx="14" fill="#2c4566" />
              <path d="M0 0h32v32H0z" fill="#b33a3a" opacity="0.9" />
              <path d="M32 32h32v32H32z" fill="#b33a3a" opacity="0.9" />
              <path d="M10 54 L54 10" stroke="#2c4566" strokeWidth="12" />
              <path d="M10 54 L54 10" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
              Égua Fit
            </p>
            <p className="text-sm font-medium text-white/90">Relatório mensal de evolução</p>
          </div>
        </div>

        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {headline}
        </h2>
        {showMonth && (
          <p className="mt-2 text-sm font-medium capitalize text-white/85 sm:text-base">
            {data.periodLabel ?? data.label}
          </p>
        )}

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/95 sm:text-lg">
          {message}
        </p>

        {highlights.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white ring-1 ring-white/20"
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-white/90 via-[#b33a3a] to-transparent" />
      </div>
    </div>
  )
}
