import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList, FileText, Save } from 'lucide-react'
import { useGym } from '../context/DataContext'
import type { Assessment, ExperienceLevel } from '../types'
import { bmi } from '../lib/training'
import { emptyAssessment } from '../lib/assessment'
import { StudentName } from '../components/StudentIdentity'
import { Panel, SectionTitle } from '../components/ui'
import { AssessmentForm } from '../components/AssessmentForm'

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

export function ProtocolPage() {
  const { studentId } = useParams()
  const { students, setActiveId, updateAnamnesis, updateAssessment } = useGym()
  const record = students.find((s) => s.student.id === studentId)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    goal: '',
    injuries: '',
    limitations: '',
    experience: 'iniciante' as ExperienceLevel,
    sleepHours: 7,
    stress: 5,
    occupation: '',
    medicalNotes: '',
    bloodPressure: '',
    restingHr: 0,
    weightKg: 0,
    heightCm: 0,
    bodyFat: 0,
    availabilityPerWeek: 3,
    notes: '',
    trainingFocus: '',
    weeklyStructure: '',
    methods: '',
    progression: '',
  })
  const [assess, setAssess] = useState<Assessment>(emptyAssessment())

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  useEffect(() => {
    if (!record) return
    setForm({
      goal: record.anamnesis.goal,
      injuries: record.anamnesis.injuries,
      limitations: record.anamnesis.limitations,
      experience: record.anamnesis.experience,
      sleepHours: record.anamnesis.sleepHours,
      stress: record.anamnesis.stress,
      occupation: record.anamnesis.occupation,
      medicalNotes: record.anamnesis.medicalNotes,
      bloodPressure: record.anamnesis.bloodPressure,
      restingHr: record.anamnesis.restingHr,
      weightKg: record.anamnesis.weightKg,
      heightCm: record.anamnesis.heightCm,
      bodyFat: record.anamnesis.bodyFat,
      availabilityPerWeek: record.anamnesis.availabilityPerWeek,
      notes: record.anamnesis.notes,
      trainingFocus: record.anamnesis.trainingFocus,
      weeklyStructure: record.anamnesis.weeklyStructure,
      methods: record.anamnesis.methods,
      progression: record.anamnesis.progression,
    })
    setAssess(record.assessment ?? emptyAssessment())
  }, [record])

  if (!record) return <Navigate to="/" replace />

  const set =
    (key: keyof typeof form) =>
    (e: { target: { value: string } }) =>
      setForm((f) => ({
        ...f,
        [key]:
          typeof f[key] === 'number' ? Number(e.target.value) : e.target.value,
      }))

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    updateAnamnesis(form, record.student.id)
    updateAssessment(assess, record.student.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const imc = bmi(form.weightKg, form.heightCm)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/aluno/${record.student.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-ink-muted hover:bg-brand-50 dark:border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div>
            <p className="tech-label text-brand-600 dark:text-brand-300">
              protocolo personalizado
            </p>
            <StudentName
              student={record.student}
              as="h1"
              className="font-display text-3xl font-bold"
            />
          </div>
        </div>
        <Link
          to={`/aluno/${record.student.id}/relatorio`}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-100 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
        >
          <FileText className="h-4 w-4" />
          Ver relatório
        </Link>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <Panel>
          <SectionTitle
            title="Anamnese"
            subtitle="Histórico e condição atual"
            action={<ClipboardList className="h-5 w-5 text-brand-500" />}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Objetivo
              </span>
              <input className={field} value={form.goal} onChange={set('goal')} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Experiência
              </span>
              <select
                className={field}
                value={form.experience}
                onChange={set('experience')}
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Lesões
              </span>
              <input
                className={field}
                value={form.injuries}
                onChange={set('injuries')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Limitações
              </span>
              <input
                className={field}
                value={form.limitations}
                onChange={set('limitations')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Ocupação
              </span>
              <input
                className={field}
                value={form.occupation}
                onChange={set('occupation')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Sono (h)
              </span>
              <input
                type="number"
                min={0}
                max={14}
                step={0.5}
                className={field}
                value={form.sleepHours}
                onChange={set('sleepHours')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Estresse (1–10)
              </span>
              <input
                type="number"
                min={1}
                max={10}
                className={field}
                value={form.stress}
                onChange={set('stress')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Peso (kg)
              </span>
              <input
                type="number"
                min={0}
                step={0.1}
                className={field}
                value={form.weightKg}
                onChange={set('weightKg')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Altura (cm)
              </span>
              <input
                type="number"
                min={0}
                className={field}
                value={form.heightCm}
                onChange={set('heightCm')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                IMC {imc ? `· ${imc}` : ''}
              </span>
              <input
                className={field}
                readOnly
                value={imc ?? '—'}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Gordura corporal (%)
              </span>
              <input
                type="number"
                min={0}
                step={0.1}
                className={field}
                value={form.bodyFat}
                onChange={set('bodyFat')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                PA
              </span>
              <input
                className={field}
                placeholder="120/80"
                value={form.bloodPressure}
                onChange={set('bloodPressure')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                FC repouso
              </span>
              <input
                type="number"
                min={0}
                className={field}
                value={form.restingHr}
                onChange={set('restingHr')}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Disponibilidade (x/semana)
              </span>
              <input
                type="number"
                min={1}
                max={7}
                className={field}
                value={form.availabilityPerWeek}
                onChange={set('availabilityPerWeek')}
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Observações clínicas
              </span>
              <textarea
                className={`${field} min-h-[80px]`}
                value={form.medicalNotes}
                onChange={set('medicalNotes')}
              />
            </label>
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            title="Testes / Avaliação"
            subtitle="PAR-Q, mobilidade, resistência e cardiorrespiratório"
          />
          <AssessmentForm value={assess} onChange={setAssess} />
        </Panel>

        <Panel>
          <SectionTitle
            title="Prescrição do treino"
            subtitle="Protocolo montado a partir da anamnese"
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

        <div className="flex flex-wrap items-center gap-3">
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
    </div>
  )
}
