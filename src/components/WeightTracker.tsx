import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { BMI_BANDS } from '../lib/training'
import { formatKg, weightInsights } from '../lib/weightStats'
import type { WeightLog } from '../types'

export function WeightTracker({
  studentId,
  logs,
  heightCm,
  bodyFat,
  onAdd,
}: {
  studentId: string
  logs: WeightLog[]
  heightCm: number
  bodyFat?: number
  onAdd: (kg: number) => void
}) {
  const [input, setInput] = useState('')
  const { latest, delta, best30, imc, band } = useMemo(
    () => weightInsights(logs, heightCm, bodyFat),
    [logs, heightCm, bodyFat],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const kg = Number(input.replace(',', '.'))
    if (!Number.isFinite(kg) || kg <= 0) return
    onAdd(kg)
    setInput('')
  }

  return (
    <section className="rounded-2xl border border-brand-100/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
      <form
        onSubmit={onSubmit}
        className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Registrar peso
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="1"
            max="400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex.: 83.35"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-[#2c4566] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#233650]"
        >
          Salvar peso
        </button>
      </form>

      {!latest ? (
        <p className="text-sm text-ink-muted">
          Informe o peso atual para ver o gráfico de IMC.
        </p>
      ) : (
        <Link
          to={`/aluno/${studentId}/peso`}
          className="block space-y-5 rounded-xl outline-none ring-brand-400 hover:bg-slate-50 focus-visible:ring-2 dark:hover:bg-slate-800/60"
        >
          <div className="flex items-start justify-between gap-3 px-1 pt-1">
            <Eye className="mt-1 h-6 w-6 text-ink" strokeWidth={1.75} />
            <p className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {formatKg(latest.kg)}
              <span className="ml-1.5 text-lg font-medium text-ink-muted">
                Kg
              </span>
            </p>
          </div>

          <div className="flex gap-1.5 px-1">
            {BMI_BANDS.map((item) => {
              const active = band === item.id
              return (
                <div
                  key={item.id}
                  className={`h-8 rounded-full transition-all ${
                    active
                      ? 'flex-[1.7] px-3 text-center text-sm font-semibold leading-8 text-white'
                      : 'flex-1'
                  }`}
                  style={{ backgroundColor: item.color }}
                >
                  {active ? item.label : null}
                </div>
              )
            })}
          </div>
          {!heightCm ? (
            <p className="px-1 text-xs text-ink-muted">
              Cadastre a altura na Anamnese para classificar o IMC.
            </p>
          ) : imc ? (
            <p className="px-1 text-xs text-ink-muted">
              IMC {imc.toFixed(1).replace('.', ',')} · toque para ver detalhes
            </p>
          ) : (
            <p className="px-1 text-xs text-ink-muted">Toque para ver detalhes</p>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 px-1 pt-4 pb-1 dark:border-slate-800">
            <div>
              <p className="font-display text-2xl font-bold text-ink">
                {delta == null
                  ? '—'
                  : `${delta > 0 ? '+' : ''}${formatKg(delta, 1)}`}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-ink-muted">
                Comparado com a última vez
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink">
                {best30 == null ? '—' : formatKg(best30)}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-ink-muted">
                Melhor em 30 dias
              </p>
            </div>
          </div>
        </Link>
      )}
    </section>
  )
}
