import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, KeyRound, Trash2, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Panel, SectionTitle } from '../components/ui'

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

const fieldPassword =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-11 pl-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-muted">
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={fieldPassword}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  )
}

export function ProfilePage() {
  const { user, updateName, updatePassword, deleteAccount } = useAuth()
  const [name, setName] = useState(
    () => (user?.user_metadata?.full_name as string | undefined) ?? '',
  )
  const [nameMsg, setNameMsg] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameBusy, setNameBusy] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passMsg, setPassMsg] = useState<string | null>(null)
  const [passError, setPassError] = useState<string | null>(null)
  const [passBusy, setPassBusy] = useState(false)

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const onSaveName = async (e: FormEvent) => {
    e.preventDefault()
    setNameMsg(null)
    setNameError(null)
    setNameBusy(true)
    try {
      await updateName(name)
      setNameMsg('Nome atualizado.')
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setNameBusy(false)
    }
  }

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPassMsg(null)
    setPassError(null)
    if (nextPassword !== confirmPassword) {
      setPassError('As senhas novas não coincidem.')
      return
    }
    setPassBusy(true)
    try {
      await updatePassword(currentPassword, nextPassword)
      setCurrentPassword('')
      setNextPassword('')
      setConfirmPassword('')
      setPassMsg('Senha alterada.')
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.')
    } finally {
      setPassBusy(false)
    }
  }

  const onDelete = async (e: FormEvent) => {
    e.preventDefault()
    setDeleteError(null)
    if (deleteConfirm.trim().toUpperCase() !== 'EXCLUIR') {
      setDeleteError('Digite EXCLUIR para confirmar.')
      return
    }
    setDeleteBusy(true)
    try {
      await deleteAccount(deletePassword)
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : 'Não foi possível excluir a conta.',
      )
      setDeleteBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Meu perfil
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Dados da sua conta de personal.
        </p>
      </section>

      <Panel>
        <SectionTitle
          title="Dados"
          subtitle="Nome de exibição e e-mail de acesso"
          action={<UserRound className="h-5 w-5 text-ink-muted" />}
        />
        <form onSubmit={onSaveName} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Nome
            </span>
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              E-mail
            </span>
            <input className={field} value={user?.email ?? ''} disabled />
          </label>
          {nameMsg && (
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {nameMsg}
            </p>
          )}
          {nameError && (
            <p className="text-sm font-semibold text-danger">{nameError}</p>
          )}
          <button
            type="submit"
            disabled={nameBusy}
            className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {nameBusy ? 'Salvando…' : 'Salvar nome'}
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle
          title="Senha"
          subtitle="Troque a senha desta conta"
          action={<KeyRound className="h-5 w-5 text-ink-muted" />}
        />
        <form onSubmit={onChangePassword} className="space-y-3">
          <PasswordField
            label="Senha atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            label="Nova senha"
            value={nextPassword}
            onChange={setNextPassword}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          {passMsg && (
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {passMsg}
            </p>
          )}
          {passError && (
            <p className="text-sm font-semibold text-danger">{passError}</p>
          )}
          <button
            type="submit"
            disabled={passBusy}
            className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {passBusy ? 'Alterando…' : 'Alterar senha'}
          </button>
        </form>
      </Panel>

      <Panel className="border-red-200 dark:border-red-900/60">
        <SectionTitle
          title="Excluir conta"
          subtitle="Apaga seu login e os alunos desta conta. Não dá para desfazer."
          action={<Trash2 className="h-5 w-5 text-danger" />}
        />
        <form onSubmit={onDelete} className="space-y-3">
          <PasswordField
            label="Confirme sua senha"
            value={deletePassword}
            onChange={setDeletePassword}
            autoComplete="current-password"
          />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Digite EXCLUIR para confirmar
            </span>
            <input
              className={field}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="EXCLUIR"
              autoComplete="off"
              required
            />
          </label>
          {deleteError && (
            <p className="text-sm font-semibold text-danger">{deleteError}</p>
          )}
          <button
            type="submit"
            disabled={deleteBusy}
            className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {deleteBusy ? 'Excluindo…' : 'Excluir minha conta'}
          </button>
        </form>
      </Panel>
    </div>
  )
}
