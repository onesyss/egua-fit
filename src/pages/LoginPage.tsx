import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Activity, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { dayGreeting } from '../lib/greeting'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-11 pl-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  show,
  onToggleShow,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
  show: boolean
  onToggleShow: () => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-muted">
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={fieldClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          title={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  )
}

export function LoginPage() {
  const { session, loading, configured, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  const mismatch =
    mode === 'signup' &&
    confirmPassword.length > 0 &&
    password !== confirmPassword

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Informe o nome do personal.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
      } else {
        await signUp({
          name: name.trim(),
          email: email.trim(),
          password,
        })
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Não foi possível entrar'
      if (/invalid login/i.test(raw)) setError('E-mail ou senha inválidos.')
      else if (/already registered/i.test(raw))
        setError('Este e-mail já tem conta. Entre com a senha.')
      else setError(raw)
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="flex min-h-screen flex-col">
      <header className="tech-header flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white">
            <Activity className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-[0.06em] text-brand-800 uppercase dark:text-brand-200">
              Égua Fit
            </p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
              acesso do personal
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="tech-panel p-6 sm:p-8">
          <p className="tech-label text-brand-600 dark:text-brand-300">
            {dayGreeting()}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            {mode === 'login' ? 'Área do personal' : 'Cadastrar personal'}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Cada professor vê só os próprios alunos.
          </p>

          {!configured && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
              Login indisponível: o site no ar precisa das variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no deploy.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-muted">
                  Nome
                </span>
                <input
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">
                E-mail
              </span>
              <input
                type="email"
                className={field}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                required
              />
            </label>

            <PasswordField
              label="Senha"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              show={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
            />

            {mode === 'signup' && (
              <>
                <PasswordField
                  label="Confirmar senha"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  show={showConfirm}
                  onToggleShow={() => setShowConfirm((v) => !v)}
                />
                {mismatch && (
                  <p className="text-sm font-semibold text-danger">
                    As senhas não coincidem.
                  </p>
                )}
              </>
            )}

            {error && (
              <p className="text-sm font-semibold text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy || !configured}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2c4566] to-[#b33a3a] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  {busy ? 'Entrando…' : 'Entrar'}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {busy ? 'Criando…' : 'Criar conta'}
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'signup' : 'login'))
              setError(null)
              setConfirmPassword('')
              setShowConfirm(false)
            }}
            className="mt-4 w-full text-center text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            {mode === 'login'
              ? 'Outro professor? Criar conta'
              : 'Já tem conta? Entrar'}
          </button>
        </div>
      </main>
    </div>
  )
}
