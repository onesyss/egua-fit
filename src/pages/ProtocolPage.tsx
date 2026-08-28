import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Printer,
  Save,
  TrendingUp,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { formatDate } from '../data/mock'
import { StudentName } from '../components/StudentIdentity'
import { Panel, SectionTitle } from '../components/ui'
import { ProtocolShare } from '../components/ProtocolShare'
import {
  MusclesWorkedBars,
  PerformanceRepsChart,
  RunningChart,
  VolumeHistoryChart,
} from '../components/Charts'
import {
  formatDuration,
  historyDurationPoints,
  historyRepsPoints,
  historyVolumePoints,
  sessionMuscleVolume,
} from '../lib/training'

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

export function ProtocolPage() {
  const { studentId } = useParams()
  const { students, setActiveId, updateAnamnesis, updateStudent } = useGym()
  const record = students.find((s) => s.student.id === studentId)
  const [saved, setSaved] = useState(false)
  const [selectedSession, setSelectedSession] = useState(-1)

  const [form, setForm] = useState({
    trainingFocus: '',
    weeklyStructure: '',
    methods: '',
    progression: '',
    notes: '',
  })

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  useEffect(() => {
    if (!record) return
    setForm({
      trainingFocus: record.anamnesis.trainingFocus,
      weeklyStructure: record.anamnesis.weeklyStructure,
      methods: record.anamnesis.methods,
      progression: record.anamnesis.progression,
      notes: record.anamnesis.notes,
    })
    setSelectedSession(record.history.length > 0 ? record.history.length - 1 : -1)
  }, [record])

  const volumePoints = useMemo(
    () => (record ? historyVolumePoints(record.history) : []),
    [record?.history],
  )
  const repsPoints = useMemo(
    () => (record ? historyRepsPoints(record.history) : []),
    [record?.history],
  )
  const durationPoints = useMemo(
    () => (record ? historyDurationPoints(record.history) : []),
    [record?.history],
  )
  const sessionMuscles = useMemo(() => {
    if (!record || selectedSession < 0) return []
    return sessionMuscleVolume(record.history[selectedSession])
  }, [record, selectedSession])

  if (!record) return <Navigate to="/" replace />

  const sid = record.student.id
  const { history } = record

  const set =
    (key: keyof typeof form) =>
    (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    updateAnamnesis(form, sid)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/aluno/${sid}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-ink-muted hover:bg-brand-50 dark:border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div>
            <p className="tech-label text-brand-600 dark:text-brand-300">
              protocolo de treino
            </p>
            <StudentName
              student={record.student}
              as="h1"
              className="font-display text-2xl font-bold sm:text-3xl"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/aluno/${sid}/anamnese`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-100 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
          >
            <ClipboardList className="h-4 w-4" />
            Anamnese
          </Link>
          <Link
            to={`/aluno/${sid}/relatorio`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-100 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
          >
            <FileText className="h-4 w-4" />
            Relatório
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2c4566] px-3.5 py-2 text-sm font-semibold text-white"
          >
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="no-print">
        <ProtocolShare
          record={record}
          onSaveContact={(patch) => updateStudent(patch, sid)}
        />
      </div>

      <article className="print-sheet space-y-4">
        {form.trainingFocus && (
          <div className="rounded-2xl border border-brand-100/80 bg-brand-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Foco atual
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink">
              {form.trainingFocus}
            </p>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <Panel>
            <SectionTitle
              title="Prescrição do treino"
              subtitle="Foco, divisão semanal, métodos e progressão"
              action={<TrendingUp className="h-5 w-5 text-brand-500" />}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Foco do protocolo
                </span>
                <input
                  className={field}
                  value={form.trainingFocus}
                  onChange={set('trainingFocus')}
                  placeholder="Ex.: hipertrofia de membros inferiores + base aeróbia"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Estrutura semanal
                </span>
                <textarea
                  className={`${field} min-h-[80px]`}
                  value={form.weeklyStructure}
                  onChange={set('weeklyStructure')}
                  placeholder="Ex.: A peito/tríceps · B costas/bíceps · C pernas · D cardio"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Métodos
                </span>
                <textarea
                  className={`${field} min-h-[80px]`}
                  value={form.methods}
                  onChange={set('methods')}
                  placeholder="Pirâmide, drop-set, rest-pause..."
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Progressão
                </span>
                <textarea
                  className={`${field} min-h-[80px]`}
                  value={form.progression}
                  onChange={set('progression')}
                  placeholder="Aumento de 2,5–5% de carga quando completar as reps"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Notas do personal
                </span>
                <textarea
                  className={`${field} min-h-[80px]`}
                  value={form.notes}
                  onChange={set('notes')}
                />
              </label>
            </div>
          </Panel>

          <div className="no-print flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              <Save className="h-4 w-4" />
              Salvar protocolo
            </button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-600">
                Protocolo salvo
              </span>
            )}
          </div>
        </form>

        <Panel>
          <SectionTitle
            title="Evolução dos treinos salvos"
            subtitle="Gráficos das sessões registradas no histórico"
          />
          {history.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Nenhum treino salvo ainda. Salve uma sessão no dashboard do aluno
              para ver os gráficos aqui.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    Carga levantada
                  </h3>
                  <div className="chart-frame h-[220px] sm:h-[260px]">
                    <VolumeHistoryChart data={volumePoints} />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    Repetições (planejado × realizado)
                  </h3>
                  <div className="chart-frame h-[220px] sm:h-[260px]">
                    <PerformanceRepsChart data={repsPoints} />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    Tempo de sessão
                  </h3>
                  <div className="chart-frame h-[200px]">
                    <RunningChart data={durationPoints} />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">
                    Músculos por treino salvo
                  </h3>
                  <label className="block text-xs text-ink-muted">
                    Treino
                    <select
                      className={`${field} ml-2 inline-block w-auto py-1.5`}
                      value={selectedSession}
                      onChange={(e) =>
                        setSelectedSession(Number(e.target.value))
                      }
                    >
                      {history.map((s, i) => (
                        <option key={s.id} value={i}>
                          T{i + 1} · {formatDate(s.date.slice(0, 10))} ·{' '}
                          {s.volumeKg.toLocaleString('pt-BR')} kg
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="chart-frame h-[220px] sm:h-[260px]">
                  {sessionMuscles.length > 0 ? (
                    <MusclesWorkedBars data={sessionMuscles} />
                  ) : (
                    <p className="flex h-full items-center justify-center text-sm text-ink-muted">
                      Sem dados de volume neste treino.
                    </p>
                  )}
                </div>
              </div>

              <div className="table-scroll -mx-1 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-[10px] tracking-wider text-ink-muted uppercase">
                      <th className="px-2 py-2">Treino</th>
                      <th className="px-2 py-2">Data</th>
                      <th className="px-2 py-2 text-right">Carga (kg)</th>
                      <th className="px-2 py-2 text-right">Variação</th>
                      <th className="px-2 py-2 text-right">Sessão</th>
                      <th className="px-2 py-2 text-right">Trabalho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s, i) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50 dark:border-slate-800"
                      >
                        <td className="px-2 py-2 font-semibold">T{i + 1}</td>
                        <td className="px-2 py-2">
                          {formatDate(s.date.slice(0, 10))}
                        </td>
                        <td className="px-2 py-2 text-right font-mono tabular-nums">
                          {s.volumeKg.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {s.volumeChangePercent > 0 ? '+' : ''}
                          {s.volumeChangePercent}%
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums text-ink-muted">
                          {formatDuration(s.sessionDurationSec)}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums text-ink-muted">
                          {formatDuration(s.workDurationSec)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>
      </article>
    </div>
  )
}
