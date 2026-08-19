import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronRight,
  Palette,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
  Users,
  UsersRound,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { energyLabel, formatDate } from '../data/mock'
import { Panel, SectionTitle } from '../components/ui'
import { StudentName } from '../components/StudentIdentity'
import { dayGreeting, firstName } from '../lib/greeting'
import { STUDENT_COLORS } from '../lib/training'

export function StudentsPanel() {
  const { students, createStudent, updateStudent, removeStudent, setActiveId, pinStudent, pinnedIds } =
    useGym()
  const { user } = useAuth()
  const hello = dayGreeting()
  const trainerName = firstName(
    (user?.user_metadata?.full_name as string | undefined) || user?.email,
  )
  const [query, setQuery] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    enrollmentDate: new Date().toISOString().slice(0, 10),
    color: STUDENT_COLORS[0] as string,
  })
  const [error, setError] = useState<string | null>(null)

  const filtered = students.filter((s) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      s.student.name.toLowerCase().includes(q) ||
      (s.student.email ?? '').toLowerCase().includes(q)
    )
  })

  const emptyForm = () => {
    const used = new Set(students.map((s) => s.student.color.toLowerCase()))
    const next =
      STUDENT_COLORS.find((c) => !used.has(c.toLowerCase())) ?? STUDENT_COLORS[0]
    return {
      name: '',
      email: '',
      phone: '',
      enrollmentDate: new Date().toISOString().slice(0, 10),
      color: next as string,
    }
  }

  const closeForm = () => {
    setOpenForm(false)
    setEditingId(null)
    setError(null)
  }

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Informe o nome do aluno.')
      return
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      enrollmentDate: form.enrollmentDate,
      color: form.color,
    }
    if (editingId) {
      updateStudent(payload, editingId)
      setForm(emptyForm())
      closeForm()
      return
    }
    const id = createStudent(payload)
    setActiveId(id)
    setForm(emptyForm())
    closeForm()
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="space-y-6">
      <section className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-tight text-ink sm:text-5xl">
            {hello}
            {trainerName ? ',' : ''}
            {trainerName ? (
              <>
                {' '}
                <span className="bg-gradient-to-r from-[#2c4566] to-[#b33a3a] bg-clip-text text-transparent">
                  {trainerName}
                </span>
              </>
            ) : null}
          </h1>
          <p className="mt-2 text-sm font-semibold tracking-wide text-ink-muted">
            Meus alunos
          </p>
          <p className="mt-0.5 hidden max-w-md text-xs text-ink-muted sm:block">
            Cadastre alunos, monte treinos e acompanhe o desempenho.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {pinnedIds.length === 2 && (
            <Link
              to="/dupla"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-bold text-brand-800 hover:bg-brand-50 dark:border-slate-700 dark:text-brand-200"
            >
              <UsersRound className="h-4 w-4" />
              Atendimento em dupla
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              if (openForm && !editingId) {
                closeForm()
                return
              }
              setEditingId(null)
              setForm(emptyForm())
              setError(null)
              setOpenForm(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2c4566] to-[#b33a3a] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo aluno
          </button>
        </div>
      </section>

      {openForm && (
        <Panel delay="delay-1">
          <SectionTitle
            title={editingId ? 'Editar aluno' : 'Cadastrar aluno'}
            subtitle={editingId ? 'Atualize os dados e a cor do card' : 'Dados básicos'}
          />
          <form
            onSubmit={onSave}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                Nome *
              </span>
              <input
                className={field}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                E-mail
              </span>
              <input
                type="email"
                className={field}
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                WhatsApp
              </span>
              <input
                className={field}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
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
                value={form.enrollmentDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enrollmentDate: e.target.value }))
                }
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-4">
              <span className="mb-2 block text-xs font-semibold text-ink-muted">
                Cor do card
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {STUDENT_COLORS.map((c) => {
                  const selected = form.color.toLowerCase() === c.toLowerCase()
                  return (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        selected
                          ? 'scale-110 border-white ring-2 ring-[#2c4566] dark:border-slate-900'
                          : 'border-white/80 hover:scale-105 dark:border-slate-800'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Cor ${c}`}
                      aria-pressed={selected}
                    />
                  )
                })}
                <label
                  className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                  title="Escolher qualquer cor"
                >
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: form.color }}
                  />
                  <Palette className="relative z-10 h-3.5 w-3.5 text-white drop-shadow" />
                  <input
                    type="color"
                    value={
                      /^#[0-9a-fA-F]{6}$/.test(form.color)
                        ? form.color
                        : '#2c4566'
                    }
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Escolher cor personalizada"
                  />
                </label>
              </div>
              <p className="mt-1.5 text-[11px] text-ink-muted">
                Cores prontas ou o seletor para o tom que quiser.
              </p>
            </div>
            {error && (
              <p className="sm:col-span-2 text-sm font-semibold text-danger">
                {error}
              </p>
            )}
            <div className="flex items-end gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                {editingId ? 'Salvar alterações' : 'Criar aluno'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink-muted dark:border-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Panel>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar aluno..."
          className="w-full rounded-xl border border-brand-100 bg-white py-2.5 pr-3 pl-10 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s, i) => (
          <div
            key={s.student.id}
            className={`tech-panel animate-fade-up delay-${Math.min(i + 1, 4)} p-4 sm:p-5`}
            style={{ borderLeft: `4px solid ${s.student.color}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-sm font-bold text-white"
                  style={{ backgroundColor: s.student.color }}
                >
                  {s.student.avatarInitials}
                </div>
                <div>
                  <StudentName
                    student={s.student}
                    as="h2"
                    className="font-display text-lg font-bold"
                  />
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(s.student.enrollmentDate)} ·{' '}
                    {s.student.daysAccompanied} dias
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(s.student.id)
                    setForm({
                      name: s.student.name,
                      email: s.student.email ?? '',
                      phone: s.student.phone ?? '',
                      enrollmentDate: s.student.enrollmentDate.slice(0, 10),
                      color: s.student.color || STUDENT_COLORS[0],
                    })
                    setError(null)
                    setOpenForm(true)
                  }}
                  className="rounded-lg p-2 text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800"
                  title="Editar aluno"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => pinStudent(s.student.id)}
                  className={`rounded-lg p-2 ${
                    pinnedIds.includes(s.student.id)
                      ? 'text-brand-700'
                      : 'text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-800'
                  }`}
                  title="Fixar na dupla"
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remover ${s.student.name} do painel?`)) {
                      removeStudent(s.student.id)
                    }
                  }}
                  className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-950/30"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-brand-50/80 px-2 py-2 dark:bg-slate-900">
                <p className="tech-label !text-[9px]">Carga (kg)</p>
                <p className="font-mono text-sm font-bold text-ink">
                  {s.metrics.totalLoad.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="rounded-lg bg-brand-50/80 px-2 py-2 dark:bg-slate-900">
                <p className="tech-label !text-[9px]">Exercícios</p>
                <p className="font-mono text-sm font-bold text-ink">
                  {s.metrics.totalExercises}
                </p>
              </div>
              <div className="rounded-lg bg-brand-50/80 px-2 py-2 dark:bg-slate-900">
                <p className="tech-label !text-[9px]">Energia</p>
                <p className="font-mono text-sm font-bold text-ink">
                  {energyLabel(s.metrics.energyLevel)}
                </p>
              </div>
            </div>

            <Link
              to={`/aluno/${s.student.id}`}
              onClick={() => setActiveId(s.student.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition"
              style={{ backgroundColor: s.student.color }}
            >
              Acessar dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="tech-panel col-span-full flex flex-col items-center gap-2 p-12 text-center">
            <Users className="h-8 w-8 text-ink-muted" />
            <p className="font-semibold text-ink">Nenhum aluno encontrado</p>
            <p className="text-sm text-ink-muted">
              Cadastre o primeiro aluno para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
