import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Plus,
  Save,
  Trash2,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { formatDate, muscleGroups } from '../data/mock'
import type { Exercise, MuscleGroup, TrainingDay } from '../types'
import {
  MuscleGroupFilter,
  type MuscleFilter,
} from '../components/MuscleGroupFilter'
import { ExerciseGuideModal } from '../components/ExerciseGuideModal'
import { Panel, SectionTitle } from '../components/ui'
import { StudentName } from '../components/StudentIdentity'
import { WorkoutDayTabs } from '../components/WorkoutDayTabs'
import { MusclesWorkedBars } from '../components/Charts'
import {
  isPrNow,
  musclesWorked,
  cardioMinutes,
  isTreadmillName,
  exerciseDay,
  isBodyweightExercise,
  exerciseProgressPercent,
  parseTrainingDay,
} from '../lib/training'
import {
  BodyweightBadge,
  formatExerciseVolume,
  RepsDoneInput,
} from '../components/ExerciseLiveFields'

const emptyForm = {
  muscleGroup: 'Peito' as MuscleGroup,
  name: '',
  sets: 3,
  reps: 12,
  repsDone: 12,
  previousWeight: 0,
  currentWeight: 0,
  durationMin: 20,
  useIncline: false,
  incline: 1,
  day: 'A' as TrainingDay,
  bodyweight: false,
}

export function TrainerDashboard() {
  const { studentId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const trainingDay = parseTrainingDay(searchParams.get('treino'))
  const {
    students,
    setActiveId,
    addExercise,
    updateExercise,
    removeExercise,
    updateStudent,
    updatePhysical,
    updateMetricsMeta,
  } = useGym()

  const record = students.find((s) => s.student.id === studentId)

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('all')
  const [flashMsg, setFlashMsg] = useState<string | null>(null)
  const [guideExercise, setGuideExercise] = useState<{
    name: string
    muscleGroup: string
  } | null>(null)

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    enrollmentDate: '',
    daysAccompanied: 0,
  })
  const [physicalForm, setPhysicalForm] = useState({
    record1km: '',
    timeReduction1km: '',
    maxTreadmillSpeed: 0,
    maxAbsAverage: 0,
    plankRecord: '',
  })
  const [metaForm, setMetaForm] = useState({ frequency: 4 })

  useEffect(() => {
    if (!record) return
    setStudentForm({
      name: record.student.name,
      email: record.student.email ?? '',
      phone: record.student.phone ?? '',
      enrollmentDate: record.student.enrollmentDate,
      daysAccompanied: record.student.daysAccompanied,
    })
    setPhysicalForm({
      record1km: record.physical.record1km,
      timeReduction1km: record.physical.timeReduction1km,
      maxTreadmillSpeed: record.physical.maxTreadmillSpeed,
      maxAbsAverage: record.physical.maxAbsAverage,
      plankRecord: record.physical.plankRecord,
    })
    setMetaForm({
      frequency: record.metrics.frequency,
    })
  }, [record])

  useEffect(() => {
    if (!editingId) {
      setForm((f) => (f.day === trainingDay ? f : { ...f, day: trainingDay }))
    }
  }, [trainingDay, editingId])

  const dayExercises = useMemo(() => {
    if (!record) return []
    return record.exercises.filter((e) => exerciseDay(e) === trainingDay)
  }, [record, trainingDay])

  const filteredExercises = useMemo(() => {
    return muscleFilter === 'all'
      ? dayExercises
      : dayExercises.filter((e) => e.muscleGroup === muscleFilter)
  }, [dayExercises, muscleFilter])

  if (!record) return <Navigate to="/" replace />

  const flash = (msg: string) => {
    setFlashMsg(msg)
    setTimeout(() => setFlashMsg(null), 2000)
  }

  const sid = record.student.id
  const setTrainingDay = (day: TrainingDay) => {
    setSearchParams(day === 'A' ? {} : { treino: day })
    if (!editingId) setForm((f) => ({ ...f, day }))
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
      durationMin: cardioMinutes(ex) || 20,
      useIncline: ex.incline != null,
      incline: ex.incline ?? 1,
      day: exerciseDay(ex),
      bodyweight: ex.bodyweight === true,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ ...emptyForm, day: trainingDay })
  }

  const onSubmitExercise = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload =
      form.muscleGroup === 'Cardio'
        ? {
            muscleGroup: form.muscleGroup,
            name: form.name.trim(),
            sets: 1,
            reps: 0,
            repsDone: 0,
            previousWeight: 0,
            currentWeight: 0,
            durationMin: Number(form.durationMin) || 0,
            incline: form.useIncline ? Number(form.incline) || 0 : undefined,
            day: trainingDay,
          }
        : {
            muscleGroup: form.muscleGroup,
            name: form.name.trim(),
            sets: form.sets,
            reps: form.reps,
            repsDone: form.repsDone,
            previousWeight: form.bodyweight ? 0 : form.previousWeight,
            currentWeight: form.bodyweight ? 0 : form.currentWeight,
            bodyweight: form.bodyweight,
            durationMin: undefined,
            incline: undefined,
            day: trainingDay,
          }
    if (editingId) {
      updateExercise(editingId, payload, sid)
      flash('Exercício atualizado')
      cancelEdit()
    } else {
      addExercise(payload, sid)
      flash('Exercício adicionado')
      setForm({ ...emptyForm, day: form.day })
    }
  }

  const onSaveStudent = (e: FormEvent) => {
    e.preventDefault()
    if (!studentForm.name.trim()) return
    updateStudent(
      {
        name: studentForm.name.trim(),
        email: studentForm.email.trim() || undefined,
        phone: studentForm.phone.trim() || undefined,
        enrollmentDate: studentForm.enrollmentDate,
        daysAccompanied: Number(studentForm.daysAccompanied) || 0,
      },
      sid,
    )
    updateMetricsMeta(
      {
        frequency: Number(metaForm.frequency) || 0,
      },
      sid,
    )
    flash('Dados do aluno salvos')
  }

  const onSavePhysical = (e: FormEvent) => {
    e.preventDefault()
    updatePhysical(
      {
        record1km: physicalForm.record1km,
        timeReduction1km: physicalForm.timeReduction1km,
        maxTreadmillSpeed: Number(physicalForm.maxTreadmillSpeed) || 0,
        maxAbsAverage: Number(physicalForm.maxAbsAverage) || 0,
        plankRecord: physicalForm.plankRecord,
      },
      sid,
    )
    flash('Parâmetros físicos salvos')
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="space-y-6">
      {guideExercise && (
        <ExerciseGuideModal
          exerciseName={guideExercise.name}
          muscleGroup={guideExercise.muscleGroup}
          onClose={() => setGuideExercise(null)}
        />
      )}

      <section className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            to={`/aluno/${sid}`}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-ink-muted hover:bg-brand-50 dark:border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div>
            <p className="tech-label text-brand-600 dark:text-brand-300">
              montar treino
            </p>
            <StudentName
              student={record.student}
              as="h1"
              className="font-display text-2xl font-bold sm:text-3xl"
            />
            <p className="mt-1 text-sm text-ink-muted">
              Matrícula {formatDate(record.student.enrollmentDate)} · Treino{' '}
              {trainingDay} · {dayExercises.length} exercícios neste treino ·{' '}
              {record.exercises.length} no total
            </p>
          </div>
        </div>
        {flashMsg && (
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {flashMsg}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel delay="delay-1">
          <SectionTitle
            title="Dados do aluno"
            subtitle="Informações no painel"
            action={<UserRound className="h-5 w-5 text-brand-500" />}
          />
          <form onSubmit={onSaveStudent} className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Nome
              </span>
              <input
                className={field}
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm((s) => ({ ...s, name: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                E-mail
              </span>
              <input
                type="email"
                className={field}
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm((s) => ({ ...s, email: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                WhatsApp
              </span>
              <input
                className={field}
                value={studentForm.phone}
                onChange={(e) =>
                  setStudentForm((s) => ({ ...s, phone: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Matrícula
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
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Frequência (x/semana)
              </span>
              <input
                type="number"
                min={0}
                max={7}
                step={0.5}
                className={field}
                value={metaForm.frequency}
                onChange={(e) =>
                  setMetaForm((m) => ({
                    ...m,
                    frequency: Number(e.target.value),
                  }))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                <Save className="h-4 w-4" />
                Salvar dados
              </button>
            </div>
          </form>
        </Panel>

        <Panel delay="delay-2">
          <SectionTitle
            title="Parâmetros físicos"
            subtitle="Cardio e core"
          />
          <form
            onSubmit={onSavePhysical}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Recorde 1 km
              </span>
              <input
                className={field}
                value={physicalForm.record1km}
                onChange={(e) =>
                  setPhysicalForm((p) => ({ ...p, record1km: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Redução de tempo
              </span>
              <input
                className={field}
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
                Vel. máx. esteira
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
                Max. abdominais
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
                value={physicalForm.plankRecord}
                onChange={(e) =>
                  setPhysicalForm((p) => ({
                    ...p,
                    plankRecord: e.target.value,
                  }))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                <Save className="h-4 w-4" />
                Salvar parâmetros
              </button>
            </div>
          </form>
        </Panel>
      </div>

      <Panel delay="delay-3">
        <SectionTitle
          title={editingId ? 'Editar exercício' : 'Adicionar exercício'}
          subtitle={`Programação do Treino ${form.day}`}
        />
        <div className="mb-4">
          <WorkoutDayTabs
            exercises={record.exercises}
            value={trainingDay}
            onChange={setTrainingDay}
          />
        </div>
        <form
          onSubmit={onSubmitExercise}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Treino
            </span>
            <select
              className={field}
              value={form.day}
              onChange={(e) =>
                setForm((f) => ({ ...f, day: e.target.value as TrainingDay }))
              }
            >
              {(['A', 'B', 'C', 'D', 'E'] as const).map((d) => (
                <option key={d} value={d}>
                  Treino {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Grupo muscular
            </span>
            <select
              className={field}
              value={form.muscleGroup}
              onChange={(e) => {
                const muscleGroup = e.target.value as MuscleGroup
                setForm((f) => ({
                  ...f,
                  muscleGroup,
                  ...(muscleGroup === 'Cardio'
                    ? {
                        durationMin: f.durationMin || 20,
                        incline: f.incline || 1,
                      }
                    : {}),
                }))
              }}
            >
              {muscleGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Exercício
            </span>
            <input
              className={field}
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                setForm((f) => ({
                  ...f,
                  name,
                  useIncline: isTreadmillName(name)
                    ? isTreadmillName(f.name)
                      ? f.useIncline
                      : true
                    : f.useIncline,
                }))
              }}
              placeholder={
                form.muscleGroup === 'Cardio'
                  ? 'Ex.: Esteira, bike, elíptico'
                  : undefined
              }
              required
            />
          </label>
          {form.muscleGroup === 'Cardio' ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Minutos
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={field}
                  value={form.durationMin}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationMin: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="flex items-center gap-2 self-end rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-ink dark:border-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#2c4566]"
                  checked={form.useIncline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, useIncline: e.target.checked }))
                  }
                />
                Inclinar esteira
              </label>
              {form.useIncline && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-muted">
                    Inclinação (%)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    className={field}
                    value={form.incline}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        incline: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              )}
            </>
          ) : (
            <>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.bodyweight}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  bodyweight: e.target.checked,
                  previousWeight: e.target.checked ? 0 : f.previousWeight,
                  currentWeight: e.target.checked ? 0 : f.currentWeight,
                }))
              }
            />
            <span className="text-sm font-semibold text-ink">
              Peso corporal (sem carga externa)
            </span>
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
          {!form.bodyweight && (
            <>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Peso anterior (kg)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
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
              step={0.5}
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
            </>
          )}
            </>
          )}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
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
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel delay="delay-4">
        <SectionTitle
          title={`Programação · Treino ${trainingDay}`}
          subtitle={`${dayExercises.length} exercícios neste treino · ${record.exercises.length} no total`}
        />
        <div className="mb-3">
          <WorkoutDayTabs
            exercises={record.exercises}
            value={trainingDay}
            onChange={setTrainingDay}
          />
        </div>
        <MuscleGroupFilter
          exercises={dayExercises}
          value={muscleFilter}
          onChange={setMuscleFilter}
        />
        <div className="table-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px] text-left text-sm sm:min-w-[900px]">
            <thead>
              <tr className="border-b border-brand-100 text-[10px] tracking-wider text-ink-muted uppercase dark:border-slate-800">
                <th className="px-3 py-3 font-mono">Grupo</th>
                <th className="px-3 py-3 font-mono">Exercício</th>
                <th className="px-3 py-3 text-center font-mono">Séries / min</th>
                <th className="px-3 py-3 text-center font-mono">Reps</th>
                <th className="px-3 py-3 text-center font-mono">Realizadas</th>
                <th className="px-3 py-3 text-center font-mono">Peso ant.</th>
                <th className="px-3 py-3 text-center font-mono">Peso at.</th>
                <th className="px-3 py-3 text-center font-mono">Vol. kg</th>
                <th className="px-3 py-3 text-center font-mono">% ↑</th>
                <th className="px-3 py-3 text-right font-mono">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((ex) => {
                const inc = exerciseProgressPercent(ex)
                const pr = isPrNow(ex, record.personalRecords)
                const bw = isBodyweightExercise(ex)
                return (
                  <tr
                    key={ex.id}
                    className="border-b border-slate-50 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-3">
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-300">
                        {ex.muscleGroup}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setGuideExercise({
                            name: ex.name,
                            muscleGroup: ex.muscleGroup,
                          })
                        }
                        className="text-left font-medium text-brand-800 hover:text-[#b33a3a] hover:underline dark:text-brand-200"
                        title="Ver como executar"
                      >
                        {ex.name}
                      </button>
                      {bw && (
                        <span className="ml-1">
                          <BodyweightBadge compact />
                        </span>
                      )}
                      {ex.muscleGroup === 'Cardio' && ex.incline != null && (
                          <p className="mt-0.5 text-[11px] text-ink-muted">
                            {ex.incline}% inclinação
                          </p>
                        )}
                      {pr && (
                        <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <Trophy className="h-3 w-3" />
                          PR
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.muscleGroup === 'Cardio'
                        ? `${cardioMinutes(ex)} min`
                        : ex.sets}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.muscleGroup === 'Cardio' ? '—' : ex.reps}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {ex.muscleGroup === 'Cardio' ? (
                        '—'
                      ) : (
                        <RepsDoneInput
                          value={ex.repsDone}
                          onChange={(repsDone) =>
                            updateExercise(ex.id, { repsDone }, sid)
                          }
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-ink-muted">
                      {bw ? 'PC' : ex.previousWeight || '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums">
                      {bw ? 'PC' : ex.currentWeight || '—'}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {formatExerciseVolume(ex)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={
                          inc > 0
                            ? 'text-xs font-bold text-emerald-600'
                            : 'text-xs text-ink-muted'
                        }
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
                          className="rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeExercise(ex.id, sid)
                            flash('Exercício removido')
                          }}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
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
                    colSpan={10}
                    className="px-3 py-10 text-center text-ink-muted"
                  >
                    Nenhum exercício neste filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {dayExercises.length > 0 && (
        <Panel>
          <SectionTitle
            title="Músculos trabalhados"
            subtitle={`Volume por grupo no Treino ${trainingDay}`}
          />
          <div className="chart-frame h-[200px] sm:h-[240px]">
            <MusclesWorkedBars data={musclesWorked(dayExercises)} />
          </div>
        </Panel>
      )}
    </div>
  )
}
