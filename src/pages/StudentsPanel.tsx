import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronRight,
  Pin,
  Plus,
  Search,
  Trash2,
  Users,
  UsersRound,
} from 'lucide-react'
import { useGym } from '../context/DataContext'
import { energyLabel, formatDate } from '../data/mock'
import { Panel, SectionTitle } from '../components/ui'
import { StudentName } from '../components/StudentIdentity'

export function StudentsPanel() {
  const { students, createStudent, removeStudent, setActiveId, pinStudent, pinnedIds } =
    useGym()
  const [query, setQuery] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    enrollmentDate: new Date().toISOString().slice(0, 10),
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

  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Informe o nome do aluno.')
      return
    }
    const id = createStudent({
      name: form.name,
      email: form.email,
      phone: form.phone,
      enrollmentDate: form.enrollmentDate,
    })
    setActiveId(id)
    setForm({
      name: '',
      email: '',
      phone: '',
      enrollmentDate: new Date().toISOString().slice(0, 10),
    })
    setError(null)
    setOpenForm(false)
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="space-y-6">
      <section className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tech-label text-brand-600 dark:text-brand-300">
            painel do personal
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
            Meus alunos
          </h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Cadastre alunos, monte treinos e acompanhe o desempenho — tudo no seu
            painel interno.
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
            onClick={() => setOpenForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2c4566] to-[#b33a3a] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo aluno
          </button>
        </div>
      </section>

      {openForm && (
        <Panel delay="delay-1">
          <SectionTitle title="Cadastrar aluno" subtitle="Dados básicos" />
          <form
            onSubmit={onCreate}
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
                Criar aluno
              </button>
              <button
                type="button"
                onClick={() => setOpenForm(false)}
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
