import { useMemo, useState, type FormEvent } from 'react'
import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useAppData } from '../context/DataContext'
import { calcIncrease, formatDate, muscleGroups } from '../data/mock'
import type { Exercise, MuscleGroup, ShareDispatchResult } from '../types'
import {
  MuscleGroupFilter,
  type MuscleFilter,
} from '../components/MuscleGroupFilter'
import { ShareResultModal } from '../components/ShareResultModal'
import { Panel, SectionTitle } from '../components/ui'
import { finalizeAndDispatch, isValidEmail } from '../lib/share'

const emptyForm = {
  muscleGroup: 'Peito' as MuscleGroup,
  name: '',
  sets: 3,
  reps: 12,
  repsDone: 12,
  previousWeight: 0,
  currentWeight: 0,
}

export function TrainerDashboard() {
  const {
    data,
    addExercise,
    updateExercise,
    removeExercise,
    updateStudent,
    updatePhysical,
  } = useAppData()

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('all')
  const [studentForm, setStudentForm] = useState({
    name: data.student.name,
    email: data.student.email,
    phone: data.student.phone ?? '',
    enrollmentDate: data.student.enrollmentDate,
    daysAccompanied: data.student.daysAccompanied,
  })
  const [physicalForm, setPhysicalForm] = useState(data.physical)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  const [studentError, setStudentError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [shareResult, setShareResult] = useState<ShareDispatchResult | null>(
    null,
  )
  const [sendError, setSendError] = useState<string | null>(null)

  const filteredExercises = useMemo(
    () =>
      muscleFilter === 'all'
        ? data.exercises
        : data.exercises.filter((e) => e.muscleGroup === muscleFilter),
    [data.exercises, muscleFilter],
  )

  const flash = (msg: string) => {
    setSavedFlash(msg)
    setTimeout(() => setSavedFlash(null), 2200)
  }

  const buildStudentPayload = ():
    | { error: string }
    | {
        payload: {
          name: string
          email: string
          phone: string | undefined
          enrollmentDate: string
          daysAccompanied: number
          avatarInitials: string
        }
      } => {
    const email = studentForm.email.trim().toLowerCase()
    if (!studentForm.name.trim()) {
      return { error: 'Informe o nome da aluna.' }
    }
    if (!isValidEmail(email)) {
      return { error: 'E-mail da aluna é obrigatório e deve ser válido.' }
    }
    const initials = studentForm.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
    return {
      payload: {
        name: studentForm.name.trim(),
        email,
        phone: studentForm.phone.trim() || undefined,
        enrollmentDate: studentForm.enrollmentDate,
        daysAccompanied: Number(studentForm.daysAccompanied) || 0,
        avatarInitials: initials || 'AL',
      },
    }
  }

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id)
    setForm({
      muscleGroup: ex.muscleGroup,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      repsDone: ex.repsDone,
      previousWeight: ex.previousWeight,
      currentWeight: ex.currentWeight,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const onSubmitExercise = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    if (editingId) {
      updateExercise(editingId, form)
      flash('Exercício atualizado')
      cancelEdit()
    } else {
      addExercise(form)
      flash('Exercício adicionado ao treino')
      setForm(emptyForm)
    }
  }

  const onSaveStudent = (e: FormEvent) => {
    e.preventDefault()
    const result = buildStudentPayload()
    if ('error' in result) {
      setStudentError(result.error)
      return
    }
    setStudentError(null)
    updateStudent(result.payload)
    flash('Dados do aluno salvos')
  }

  const onSavePhysical = (e: FormEvent) => {
    e.preventDefault()
    updatePhysical(physicalForm)
    flash('Parâmetros físicos salvos')
  }

  const onFinalizeAndSend = async () => {
    setSendError(null)
    const result = buildStudentPayload()
    if ('error' in result) {
      setStudentError(result.error)
      setSendError(result.error)
      return
    }
    setStudentError(null)
    updateStudent(result.payload)
    updatePhysical(physicalForm)

    const snapshot = {
      ...data,
      student: { ...data.student, ...result.payload },
      physical: physicalForm,
    }

    if (snapshot.exercises.length === 0) {
      setSendError('Adicione ao menos um exercício antes de enviar o treino.')
      return
    }

    setSending(true)
    try {
      const dispatch = await finalizeAndDispatch(snapshot)
      setShareResult(dispatch)
      flash('Treino publicado e enviado')
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'Não foi possível gerar o link.',
      )
    } finally {
      setSending(false)
    }
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-brand-500 dark:focus:ring-brand-900'

  return (
    <div className="space-y-6">
      {shareResult && (
        <ShareResultModal
          result={shareResult}
          studentName={studentForm.name}
          studentEmail={studentForm.email}
          onClose={() => setShareResult(null)}
        />
      )}

      <section className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="tech-label text-brand-600 dark:text-brand-300">
            dashboard do professor
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            Montar treino
          </h1>
          <p className="mt-2 text-ink-muted">
            Cadastre a aluna (e-mail obrigatório), monte o treino e finalize
            para gerar o link de WhatsApp e enviar por e-mail automaticamente.
          </p>
        </div>
        {savedFlash && (
          <div className="animate-scale-in rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900">
            {savedFlash}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Dados do aluno */}
        <Panel delay="delay-1">
          <SectionTitle
            title="Dados do aluno"
            subtitle="E-mail obrigatório para envio do link"
            action={<UserRound className="h-5 w-5 text-brand-500" />}
          />
          <form onSubmit={onSaveStudent} className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Nome do aluno
              </span>
              <input
                className={field}
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm((s) => ({ ...s, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                E-mail da aluna *{' '}
                <span className="font-normal text-danger">obrigatório</span>
              </span>
              <input
                type="email"
                required
                className={field}
                placeholder="aluna@email.com"
                value={studentForm.email}
                onChange={(e) => {
                  setStudentForm((s) => ({ ...s, email: e.target.value }))
                  setStudentError(null)
                }}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                WhatsApp (opcional)
              </span>
              <input
                type="tel"
                className={field}
                placeholder="11999998888"
                value={studentForm.phone}
                onChange={(e) =>
                  setStudentForm((s) => ({ ...s, phone: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Data da matrícula
              </span>
              <input
                type="date"
                className={field}
                value={studentForm.enrollmentDate}
                onChange={(e) =>
                  setStudentForm((s) => ({
                    ...s,
                    enrollmentDate: e.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Dias acompanhados
              </span>
              <input
                type="number"
                min={0}
                className={field}
                value={studentForm.daysAccompanied}
                onChange={(e) =>
                  setStudentForm((s) => ({
                    ...s,
                    daysAccompanied: Number(e.target.value),
                  }))
                }
              />
            </label>
            {studentError && (
              <p className="sm:col-span-2 text-sm font-semibold text-danger">
                {studentError}
              </p>
            )}
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-ink-muted">
                Prévia: {studentForm.name} · {studentForm.email || 'sem e-mail'}{' '}
                · matrícula {formatDate(studentForm.enrollmentDate)} ·{' '}
                {studentForm.daysAccompanied} dias
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
              >
                <Save className="h-4 w-4" />
                Salvar aluno
              </button>
            </div>
          </form>
        </Panel>

        {/* Parâmetros físicos */}
        <Panel delay="delay-2">
          <SectionTitle
            title="Parâmetros físicos"
            subtitle="Cardio, abdominais e prancha"
          />
          <form onSubmit={onSavePhysical} className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Recorde 1 km
              </span>
              <input
                className={field}
                placeholder="04:52"
                value={physicalForm.record1km}
                onChange={(e) =>
                  setPhysicalForm((p) => ({ ...p, record1km: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Redução de tempo (1 km)
              </span>
              <input
                className={field}
                placeholder="-00:38"
                value={physicalForm.timeReduction1km}
                onChange={(e) =>
                  setPhysicalForm((p) => ({
                    ...p,
                    timeReduction1km: e.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Vel. máxima esteira (km/h)
              </span>
              <input
                type="number"
                step="0.1"
                className={field}
                value={physicalForm.maxTreadmillSpeed}
                onChange={(e) =>
                  setPhysicalForm((p) => ({
                    ...p,
                    maxTreadmillSpeed: Number(e.target.value),
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Max. abdominais (média)
              </span>
              <input
                type="number"
                className={field}
                value={physicalForm.maxAbsAverage}
                onChange={(e) =>
                  setPhysicalForm((p) => ({
                    ...p,
                    maxAbsAverage: Number(e.target.value),
                  }))
                }
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Recorde prancha
              </span>
              <input
                className={field}
                placeholder="02:15"
                value={physicalForm.plankRecord}
                onChange={(e) =>
                  setPhysicalForm((p) => ({ ...p, plankRecord: e.target.value }))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
              >
                <Save className="h-4 w-4" />
                Salvar parâmetros
              </button>
            </div>
          </form>
        </Panel>
      </div>

      {/* Form exercício */}
      <Panel delay="delay-3">
        <SectionTitle
          title={editingId ? 'Editar exercício' : 'Adicionar exercício'}
          subtitle="Grupo muscular, séries, reps e carga"
        />
        <form
          onSubmit={onSubmitExercise}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Grupo muscular
            </span>
            <select
              className={field}
              value={form.muscleGroup}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  muscleGroup: e.target.value as MuscleGroup,
                }))
              }
            >
              {muscleGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-1 lg:col-span-1">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Exercício
            </span>
            <input
              className={field}
              placeholder="Ex: Supino reto"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Séries
            </span>
            <input
              type="number"
              min={1}
              className={field}
              value={form.sets}
              onChange={(e) =>
                setForm((f) => ({ ...f, sets: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Repetições
            </span>
            <input
              type="number"
              min={1}
              className={field}
              value={form.reps}
              onChange={(e) =>
                setForm((f) => ({ ...f, reps: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Rep. realizadas
            </span>
            <input
              type="number"
              min={0}
              className={field}
              value={form.repsDone}
              onChange={(e) =>
                setForm((f) => ({ ...f, repsDone: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Peso anterior (kg)
            </span>
            <input
              type="number"
              min={0}
              step="0.5"
              className={field}
              value={form.previousWeight}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  previousWeight: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Peso atual (kg)
            </span>
            <input
              type="number"
              min={0}
              step="0.5"
              className={field}
              value={form.currentWeight}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  currentWeight: Number(e.target.value),
                }))
              }
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
            >
              {editingId ? (
                <>
                  <Save className="h-4 w-4" /> Atualizar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Adicionar
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Panel>

      {/* Lista actual */}
      <Panel delay="delay-4">
        <SectionTitle
          title="Programação atual"
          subtitle={
            muscleFilter === 'all'
              ? `${data.exercises.length} exercícios · carga total ${data.metrics.totalLoad.toLocaleString('pt-BR')} kg`
              : `${filteredExercises.length} de ${data.exercises.length} em “${muscleFilter}” · carga total ${data.metrics.totalLoad.toLocaleString('pt-BR')} kg`
          }
        />

        <MuscleGroupFilter
          exercises={data.exercises}
          value={muscleFilter}
          onChange={setMuscleFilter}
        />

        <div className="table-scroll -mx-1 overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-ink-muted dark:border-slate-800">
                <th className="px-3 py-3 font-semibold">Grupo</th>
                <th className="px-3 py-3 font-semibold">Exercício</th>
                <th className="px-3 py-3 text-center font-semibold">Séries</th>
                <th className="px-3 py-3 text-center font-semibold">Reps</th>
                <th className="px-3 py-3 text-center font-semibold">Realizadas</th>
                <th className="px-3 py-3 text-center font-semibold">Peso ant.</th>
                <th className="px-3 py-3 text-center font-semibold">Peso at.</th>
                <th className="px-3 py-3 text-center font-semibold">% ↑</th>
                <th className="px-3 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((ex) => {
                const inc = calcIncrease(ex.previousWeight, ex.currentWeight)
                return (
                  <tr
                    key={ex.id}
                    className="border-b border-slate-50 hover:bg-brand-50/40 dark:border-slate-800/80 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-3 py-3">
                      <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-200">
                        {ex.muscleGroup}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{ex.name}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{ex.sets}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{ex.reps}</td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.repsDone}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-ink-muted">
                      {ex.previousWeight || '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-brand-800 dark:text-brand-300">
                      {ex.currentWeight || '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-xs font-bold',
                          inc > 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        ].join(' ')}
                      >
                        {inc > 0 ? '+' : ''}
                        {inc}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(ex)}
                          className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-800"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeExercise(ex.id)
                            flash('Exercício removido')
                          }}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredExercises.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-10 text-center text-ink-muted"
                  >
                    {data.exercises.length === 0
                      ? 'Nenhum exercício. Adicione o primeiro acima.'
                      : `Nenhum exercício em “${muscleFilter}”. Experimente outro grupo.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Finalizar e enviar */}
      <Panel delay="delay-4" className="border-white/25!">
        <SectionTitle
          title="Finalizar e enviar treino"
          subtitle="Gera o link, envia o e-mail automaticamente e abre o WhatsApp"
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-ink-muted">
            <p>
              Destino e-mail:{' '}
              <span className="font-mono font-semibold text-ink">
                {studentForm.email || '— preencha o e-mail da aluna —'}
              </span>
            </p>
            <p className="mt-1">
              Exercícios no treino:{' '}
              <span className="font-mono font-semibold text-ink">
                {data.exercises.length}
              </span>
            </p>
            {sendError && (
              <p className="mt-2 font-semibold text-danger">{sendError}</p>
            )}
          </div>
          <button
            type="button"
            disabled={sending}
            onClick={onFinalizeAndSend}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2c4566] to-[#b33a3a] px-6 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Gerar link + enviar
              </>
            )}
          </button>
        </div>
      </Panel>
    </div>
  )
}
