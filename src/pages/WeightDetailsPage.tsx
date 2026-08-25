import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Activity,
  Apple,
  ArrowLeftRight,
  Bone,
  ChevronLeft,
  Droplets,
  Dumbbell,
  Flame,
  NotebookPen,
  Pencil,
  Percent,
  PersonStanding,
  RefreshCw,
  Ruler,
  Scale,
  Settings,
  Sprout,
  ThumbsUp,
  User,
  Waves,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { BMI_BANDS } from '../lib/training'
import {
  bandMeta,
  bmiCutoffsKg,
  BODY_TYPES,
  composeBodyMetrics,
  formatKg,
  formatStamp,
  weightInsights,
} from '../lib/weightStats'
import type { WeightLog } from '../types'

export function WeightDetailsPage() {
  const { studentId } = useParams()
  const { students, setActiveId, updateWeightLog, updateAnamnesis } =
    useGym()
  const record = students.find((s) => s.student.id === studentId)
  const [tab, setTab] = useState<'metrics' | 'report'>('metrics')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  const insights = useMemo(
    () =>
      record
        ? weightInsights(
            record.weightLogs ?? [],
            record.anamnesis.heightCm,
            record.anamnesis.bodyFat,
          )
        : null,
    [record],
  )

  if (!record || !studentId) return <Navigate to="/" replace />
  if (!insights?.latest) {
    return <Navigate to={`/aluno/${studentId}`} replace />
  }

  const { latest, previous, delta, best30, imc, band, fat: fatValue } =
    insights
  const composed = composeBodyMetrics(
    latest,
    record.anamnesis.heightCm,
    fatValue,
  )
  const meta = bandMeta(band)
  const cuts = record.anamnesis.heightCm
    ? bmiCutoffsKg(record.anamnesis.heightCm)
    : null
  const markerPct = cuts
    ? Math.min(
        97,
        Math.max(
          3,
          ((latest.kg - cuts.low * 0.7) / (cuts.high * 1.25 - cuts.low * 0.7)) *
            100,
        ),
      )
    : band === 'obeso'
      ? 88
      : band === 'sobrepeso'
        ? 62
        : band === 'normal'
          ? 38
          : 12

  const openEdit = () => {
    setDraft({
      kg: String(latest.kg),
      bodyFat: latest.bodyFat ? String(latest.bodyFat) : fatValue ? String(fatValue) : '',
      skeletalMusclePercent: latest.skeletalMusclePercent ? String(latest.skeletalMusclePercent) : '',
      muscleMassPercent: latest.muscleMassPercent ? String(latest.muscleMassPercent) : '',
      waterPercent: latest.waterPercent ? String(latest.waterPercent) : '',
      visceralFat: latest.visceralFat ? String(latest.visceralFat) : '',
      boneKg: latest.boneKg ? String(latest.boneKg) : '',
      metabolism: latest.metabolism ? String(latest.metabolism) : '',
      proteinPercent: latest.proteinPercent ? String(latest.proteinPercent) : '',
      obesityPercent: latest.obesityPercent ? String(latest.obesityPercent) : '',
      metabolicAge: latest.metabolicAge ? String(latest.metabolicAge) : '',
      lbmKg: latest.lbmKg ? String(latest.lbmKg) : '',
      age: latest.age ? String(latest.age) : '',
      heightCm: record.anamnesis.heightCm ? String(record.anamnesis.heightCm) : '',
    })
    setEditing(true)
  }

  const numOrUndef = (key: string) => {
    const n = Number(String(draft[key] ?? '').replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  const onSaveEdit = (e: FormEvent) => {
    e.preventDefault()
    const nextKg = numOrUndef('kg')
    if (!nextKg) return
    const patch: Partial<Omit<WeightLog, 'at' | 'photo'>> = {
      kg: nextKg,
      bodyFat: numOrUndef('bodyFat'),
      skeletalMusclePercent: numOrUndef('skeletalMusclePercent'),
      muscleMassPercent: numOrUndef('muscleMassPercent'),
      waterPercent: numOrUndef('waterPercent'),
      visceralFat: numOrUndef('visceralFat'),
      boneKg: numOrUndef('boneKg'),
      metabolism: numOrUndef('metabolism'),
      proteinPercent: numOrUndef('proteinPercent'),
      obesityPercent: numOrUndef('obesityPercent'),
      metabolicAge: numOrUndef('metabolicAge'),
      lbmKg: numOrUndef('lbmKg'),
      age: numOrUndef('age'),
    }
    updateWeightLog(latest.at, patch, studentId)
    const height = numOrUndef('heightCm')
    const fat = numOrUndef('bodyFat')
    updateAnamnesis(
      {
        ...(height ? { heightCm: height } : {}),
        ...(fat ? { bodyFat: fat } : {}),
      },
      studentId,
    )
    setEditing(false)
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <header className="relative flex items-center justify-between">
        <Link
          to={`/aluno/${studentId}`}
          className="rounded-lg p-1.5 text-ink hover:bg-brand-50 dark:hover:bg-slate-800"
          aria-label="Voltar"
          onClick={() => setActiveId(studentId)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Detalhes</h1>
        <div className="flex items-center gap-1">
          <Link
            to={`/aluno/${studentId}/protocolo`}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-800"
            title="Protocolo"
          >
            <NotebookPen className="h-5 w-5" />
          </Link>
          <Link
            to={`/aluno/${studentId}/protocolo`}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-800"
            title="Ajustes"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setActiveId(studentId)}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-800"
            title="Atualizar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 rounded-2xl bg-slate-200/80 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setTab('metrics')}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
            tab === 'metrics'
              ? 'bg-white text-ink shadow-sm ring-1 ring-[#3b82f6]/30 dark:bg-slate-900'
              : 'text-ink-muted'
          }`}
        >
          Métricas corporais
        </button>
        <button
          type="button"
          onClick={() => setTab('report')}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
            tab === 'report'
              ? 'bg-white text-ink shadow-sm ring-1 ring-[#3b82f6]/30 dark:bg-slate-900'
              : 'text-ink-muted'
          }`}
        >
          Análise do relatório
        </button>
      </div>

      {tab === 'metrics' ? (
        <>
          <section className="relative rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.label} {meta.emoji}
                </span>
                <p className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">
                  {formatKg(latest.kg)}{' '}
                  <span className="text-xl font-medium text-ink-muted">Kg</span>
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {formatStamp(latest.at)}
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <div className="flex h-3 overflow-hidden rounded-full">
                {BMI_BANDS.map((item) => (
                  <div
                    key={item.id}
                    className="flex-1"
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
              {cuts && (
                <div className="mt-1 flex text-[10px] text-ink-muted">
                  <span className="flex-1">{formatKg(cuts.low)}</span>
                  <span className="flex-1 text-center">
                    {formatKg(cuts.healthy)}
                  </span>
                  <span className="flex-1 text-right">{formatKg(cuts.high)}</span>
                </div>
              )}
              <div
                className="pointer-events-none absolute -top-3 text-lg"
                style={{ left: `calc(${markerPct}% - 10px)` }}
              >
                {meta.emoji}
              </div>
            </div>

            <button
              type="button"
              onClick={openEdit}
              className="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b82f6] text-white"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </section>

          <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950">
                  <ArrowLeftRight className="h-4 w-4" />
                </span>
                <p className="text-sm text-ink">
                  Comparado com a última vez
                  {previous ? ` (${formatStamp(previous.at).slice(0, 10)})` : ''}
                </p>
              </div>
              <p className="font-display text-lg font-bold text-ink">
                {delta == null
                  ? '—'
                  : `${delta > 0 ? '+' : ''}${formatKg(delta, 1)}`}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950">
                  <ThumbsUp className="h-4 w-4" />
                </span>
                <p className="text-sm text-ink">Melhor peso de 30 dias</p>
              </div>
              <p className="font-display text-lg font-bold text-ink">
                {best30 == null ? '—' : formatKg(best30)}
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">
                Métricas corporais
              </h2>
              <button
                type="button"
                onClick={() => setTab('report')}
                className="rounded-full border border-sky-300 px-2.5 py-1 text-xs font-semibold text-sky-600"
              >
                AI Interpretação
              </button>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {composed.rows.map((row) => (
                <MetricRow
                  key={row.key}
                  icon={metricIcon(row.key)}
                  label={row.label}
                  value={
                    row.value == null
                      ? '—'
                      : formatKg(row.value, row.digits ?? 1)
                  }
                  status={row.status?.label ?? ''}
                  color={row.status?.color ?? 'transparent'}
                />
              ))}
            </ul>
          </section>
        </>
      ) : (
        <ReportAnalysis
          kg={latest.kg}
          imc={imc}
          composed={composed}
        />
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={onSaveEdit}
            className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 dark:bg-slate-900"
          >
            <h2 className="font-display text-lg font-bold text-ink">
              Editar métricas da balança
            </h2>
            {EDIT_FIELDS.map((field) => (
              <label
                key={field.key}
                className="mt-3 block text-xs font-semibold text-ink-muted"
              >
                {field.label}
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={draft[field.key] ?? ''}
                  onChange={(e) =>
                    setDraft((curr) => ({ ...curr, [field.key]: e.target.value }))
                  }
                  inputMode="decimal"
                />
              </label>
            ))}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#2c4566] px-3 py-2 text-sm font-bold text-white"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function metricIcon(key: string) {
  const cls = 'h-5 w-5'
  if (key === 'peso' || key === 'gorduraKg') return <Scale className={cls} />
  if (key === 'imc') return <Apple className={cls} />
  if (key === 'gordura' || key === 'obesidade') return <Percent className={cls} />
  if (key === 'skelPct' || key === 'skelKg') return <Dumbbell className={cls} />
  if (key === 'musclePct' || key === 'muscleKg' || key === 'lbm')
    return <Activity className={cls} />
  if (key === 'agua') return <Waves className={cls} />
  if (key === 'aguaKg') return <Droplets className={cls} />
  if (key === 'visceral') return <HeartPulseIcon />
  if (key === 'ossos') return <Bone className={cls} />
  if (key === 'metabolismo') return <Flame className={cls} />
  if (key === 'proteina') return <Sprout className={cls} />
  if (key === 'idadeMet' || key === 'idade') return <User className={cls} />
  if (key === 'altura') return <Ruler className={cls} />
  return <PersonStanding className={cls} />
}

function HeartPulseIcon() {
  return <Activity className="h-5 w-5" />
}

const EDIT_FIELDS = [
  { key: 'kg', label: 'Peso (kg)' },
  { key: 'heightCm', label: 'Altura (cm)' },
  { key: 'age', label: 'Idade real' },
  { key: 'bodyFat', label: 'Gordura (%)' },
  { key: 'skeletalMusclePercent', label: 'Massa muscular esquelética (%)' },
  { key: 'muscleMassPercent', label: 'Massa muscular (%)' },
  { key: 'waterPercent', label: 'Água (%)' },
  { key: 'visceralFat', label: 'Gordura visceral' },
  { key: 'boneKg', label: 'Ossos (kg)' },
  { key: 'metabolism', label: 'Metabolismo' },
  { key: 'proteinPercent', label: 'Proteína (%)' },
  { key: 'obesityPercent', label: 'Obesidade (%)' },
  { key: 'metabolicAge', label: 'Idade metabólica' },
  { key: 'lbmKg', label: 'LBM (kg)' },
]

function ReportAnalysis({
  kg,
  imc,
  composed,
}: {
  kg: number
  imc: number | null
  composed: ReturnType<typeof composeBodyMetrics>
}) {
  const c = composed.composition
  const parts = [
    {
      key: 'agua',
      label: 'Água',
      icon: <Waves className="h-4 w-4 text-sky-500" />,
      value: c.waterKg,
      tone: c.waterTone,
      bar: '#60a5fa',
    },
    {
      key: 'gordura',
      label: 'Gordura',
      icon: <Percent className="h-4 w-4 text-rose-500" />,
      value: c.fatKg,
      tone: c.fatTone,
      bar: '#3b82f6',
    },
    {
      key: 'proteina',
      label: 'Proteína',
      icon: <Sprout className="h-4 w-4 text-emerald-500" />,
      value: c.proteinKg,
      tone: c.proteinTone,
      bar: '#38bdf8',
    },
    {
      key: 'ossos',
      label: 'Ossos',
      icon: <Bone className="h-4 w-4 text-slate-500" />,
      value: c.boneKg,
      tone: c.boneTone,
      bar: '#93c5fd',
    },
  ]
  const fill = Math.min(92, Math.max(18, (c.fatKg / Math.max(kg, 1)) * 160))

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold text-ink">
          Análise da composição corporal
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Peso = Água + Gordura + Proteína + Osso
        </p>
        <div className="mt-4 grid grid-cols-[88px_1fr] gap-4">
          <div className="relative mx-auto h-44 w-16">
            <svg viewBox="0 0 64 160" className="h-full w-full">
              <path
                d="M32 8c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11zm-14 28h28c3 0 6 3 6 7v28c0 2-1 4-3 5l-4 28c-1 6-6 10-12 10h-2c-6 0-11-4-12-10l-4-28c-2-1-3-3-3-5V43c0-4 3-7 6-7z"
                fill="#dbeafe"
                stroke="#93c5fd"
                strokeWidth="2"
              />
              <clipPath id="body-fill">
                <path d="M18 36h28c3 0 6 3 6 7v28c0 2-1 4-3 5l-4 28c-1 6-6 10-12 10h-2c-6 0-11-4-12-10l-4-28c-2-1-3-3-3-5V43c0-4 3-7 6-7z" />
              </clipPath>
              <rect
                x="0"
                y={160 - fill * 1.2}
                width="64"
                height="160"
                fill="#7dd3fc"
                clipPath="url(#body-fill)"
                opacity="0.85"
              />
            </svg>
          </div>
          <div>
            <p className="font-display text-3xl font-extrabold text-ink">
              {formatKg(kg)}
            </p>
            <div className="mt-3 space-y-3">
              {parts.map((part) => {
                const width = Math.min(100, (part.value / Math.max(kg * 0.55, 1)) * 100)
                return (
                  <div key={part.key}>
                    <div className="mb-1 flex items-center gap-2 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 dark:bg-slate-800">
                        {part.icon}
                      </span>
                      <span className="flex-1 font-semibold text-ink">
                        {part.label}
                      </span>
                      <span className="font-bold text-ink">
                        {part.value ? formatKg(part.value, 1) : '—'}
                      </span>
                      <span
                        className="w-14 text-right text-xs font-semibold"
                        style={{ color: part.tone?.color }}
                      >
                        {part.tone?.label ?? ''}
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, backgroundColor: part.bar }}
                      />
                      <span className="absolute top-0 bottom-0 left-[38%] w-px bg-slate-300" />
                      <span className="absolute top-0 bottom-0 left-[62%] w-px bg-slate-300" />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-center text-[10px] tracking-wide text-ink-muted">
              Faixa padrão
            </p>
            <div className="mx-auto mt-1 flex h-1.5 w-40 overflow-hidden rounded-full">
              <span className="flex-1 bg-sky-300" />
              <span className="flex-1 bg-emerald-400" />
              <span className="flex-1 bg-rose-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            Análise do tipo de corpo
          </h2>
          {imc != null && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-ink dark:bg-slate-800">
              {formatKg(imc, 1)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BODY_TYPES.map((type) => {
            const active = type.id === composed.bodyType
            return (
              <div
                key={type.id}
                className={`rounded-2xl border px-3 py-4 text-center text-sm font-semibold ${
                  active
                    ? 'border-[#e44545] bg-rose-50 text-[#e44545] dark:bg-rose-950/40'
                    : 'border-slate-200 text-ink dark:border-slate-700'
                }`}
              >
                {active ? '😐 ' : ''}
                {type.label}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function MetricRow({
  icon,
  label,
  value,
  status,
  color,
}: {
  icon: ReactNode
  label: string
  value: string
  status: string
  color: string
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="text-ink-muted">{icon}</span>
      <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
      <span className="w-16 text-right text-xs font-semibold" style={{ color }}>
        {status}
      </span>
      <span
        className="h-8 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </li>
  )
}
