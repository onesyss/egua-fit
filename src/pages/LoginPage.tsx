import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Activity,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Mail,
  UserPlus,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LoginHeroVisual } from '../components/LoginHeroVisual'
import { ThemeToggle } from '../components/ThemeToggle'
import { BrandBackdrop } from '../components/BrandBackdrop'
import { dayGreeting } from '../lib/greeting'
import { humanAuthError } from '../lib/supabase'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-11 pl-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
  show,
  onToggleShow,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
  name?: string
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
          name={name}
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
  const {
    session,
    loading,
    configured,
    passwordRecovery,
    emailJustConfirmed,
    passwordJustUpdated,
    signIn,
    signUp,
    resetPassword,
    completePasswordRecovery,
    signOut,
  } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  const clearFields = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
    setError(null)
    setFormKey((k) => k + 1)
  }

  if (
    !loading &&
    session &&
    !verifyEmail &&
    !resetEmail &&
    !passwordRecovery &&
    !emailJustConfirmed &&
    !passwordJustUpdated
  ) {
    return <Navigate to="/" replace />
  }

  const needConfirm = mode === 'signup' || passwordRecovery
  const mismatch =
    needConfirm && confirmPassword.length > 0 && password !== confirmPassword

  const onForgotPassword = () => {
    setMode('forgot')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
    setError(null)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (passwordRecovery) {
      if (!password) {
        setError('Informe a nova senha.')
        return
      }
      if (password.length < 6) {
        setError('A senha precisa ter pelo menos 6 caracteres.')
        return
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        return
      }
      setBusy(true)
      try {
        await completePasswordRecovery(password)
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setShowPassword(false)
        setShowConfirm(false)
      } catch (err: unknown) {
        setError(humanAuthError(err, 'Não foi possível salvar a senha.'))
      } finally {
        setBusy(false)
      }
      return
    }
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Informe o e-mail da sua conta.')
        return
      }
      setBusy(true)
      try {
        await resetPassword(email.trim())
        setResetEmail(email.trim())
        setMode('login')
      } catch (err: unknown) {
        setError(humanAuthError(err, 'Não foi possível enviar o e-mail.'))
      } finally {
        setBusy(false)
      }
      return
    }
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
        const createdEmail = email.trim()
        await signUp({
          name: name.trim(),
          email: createdEmail,
          password,
        })
        setMode('login')
        setVerifyEmail(createdEmail)
        clearFields()
      }
    } catch (err: unknown) {
      const raw = humanAuthError(err, 'Não foi possível entrar')
      if (/user not found|invalid login|invalid credentials/i.test(raw)) {
        setError('Usuário inexistente ou não cadastrado.')
      } else if (/already registered|já tem conta/i.test(raw))
        setError('Este e-mail já tem conta. Entre com a senha.')
      else if (/email not confirmed/i.test(raw))
        setError('Valide a conta no e-mail antes de entrar.')
      else setError(raw)
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="login-page relative flex min-h-screen flex-col overflow-hidden">
      <BrandBackdrop />

      <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white shadow-lg shadow-[#2c4566]/25">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
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

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-6">
        <div className="login-shell animate-fade-up grid w-full overflow-hidden lg:grid-cols-2">
          <LoginHeroVisual greeting={dayGreeting()} />
          <section className="flex h-full flex-col justify-center overflow-y-auto p-5 sm:p-8 lg:p-10">
            {!passwordRecovery && mode !== 'forgot' && (
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-brand-50 p-1 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  mode === 'login'
                    ? 'bg-white text-brand-800 shadow-sm dark:bg-slate-800 dark:text-brand-200'
                    : 'text-ink-muted'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'signup') return
                  setMode('signup')
                  clearFields()
                }}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  mode === 'signup'
                    ? 'bg-white text-brand-800 shadow-sm dark:bg-slate-800 dark:text-brand-200'
                    : 'text-ink-muted'
                }`}
              >
                Criar conta
              </button>
            </div>
            )}

            <h2 className="hidden font-display text-2xl font-bold text-ink lg:block">
              {passwordRecovery
                ? 'Redefinir senha'
                : mode === 'forgot'
                  ? 'Recuperar senha'
                  : mode === 'login'
                    ? 'Área do personal'
                    : 'Cadastrar personal'}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {passwordRecovery
                ? 'Escolha uma senha nova para voltar ao painel.'
                : mode === 'forgot'
                  ? 'Informe o e-mail da sua conta. Se ele existir, enviamos o link para redefinir a senha.'
                  : mode === 'login'
                    ? 'Acesse o painel com seu e-mail e senha.'
                    : 'Crie sua conta. Vamos enviar um link no e-mail para validar.'}
            </p>

            {!configured && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                Login indisponível no momento. Tente de novo em instantes.
              </p>
            )}

            {emailJustConfirmed && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                E-mail validado. Entre com e-mail e senha para acessar o painel.
              </p>
            )}

            {passwordJustUpdated && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                Senha alterada. Entre com e-mail e senha para acessar o painel.
              </p>
            )}

            <form
              key={formKey}
              onSubmit={onSubmit}
              autoComplete="off"
              className="mt-5 space-y-3"
            >
              {mode === 'signup' && !passwordRecovery && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-muted">
                    Nome
                  </span>
                  <input
                    className={field}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    name={`egua-name-${formKey}`}
                    autoComplete="off"
                  />
                </label>
              )}
              {!passwordRecovery && (
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
                  name={`egua-email-${formKey}`}
                  autoComplete={mode === 'signup' ? 'off' : 'username'}
                  required
                />
              </label>
              )}

              {!passwordRecovery && mode !== 'forgot' && (
              <PasswordField
                label="Senha"
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 6 caracteres"
                name={`egua-password-${formKey}`}
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
              />
              )}

              {passwordRecovery && (
              <PasswordField
                label="Nova senha"
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 6 caracteres"
                name={`egua-password-${formKey}`}
                autoComplete="new-password"
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
              />
              )}

              {mode === 'login' && !passwordRecovery && (
                <div className="-mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    disabled={busy || !configured}
                    className="text-sm font-semibold text-brand-700 hover:underline disabled:opacity-60 dark:text-brand-300"
                  >
                    Recuperar senha
                  </button>
                </div>
              )}

              {needConfirm && (
                <>
                  <PasswordField
                    label={
                      passwordRecovery ? 'Confirmar nova senha' : 'Confirmar senha'
                    }
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repita a senha"
                    name={`egua-confirm-${formKey}`}
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2c4566] to-[#b33a3a] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#2c4566]/20 transition hover:opacity-95 disabled:opacity-60"
              >
                {passwordRecovery ? (
                  <>
                    <KeyRound className="h-4 w-4" />
                    {busy ? 'Salvando…' : 'Salvar nova senha'}
                  </>
                ) : mode === 'forgot' ? (
                  <>
                    <Mail className="h-4 w-4" />
                    {busy ? 'Verificando…' : 'Enviar link'}
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="h-4 w-4" />
                    {busy ? 'Entrando…' : 'Entrar no painel'}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {busy ? 'Criando…' : 'Criar e validar e-mail'}
                  </>
                )}
              </button>
              {(passwordRecovery || mode === 'forgot') && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    if (passwordRecovery) {
                      void signOut()
                      return
                    }
                    setMode('login')
                  }}
                  disabled={busy}
                  className="w-full text-sm font-semibold text-ink-muted hover:underline disabled:opacity-60"
                >
                  Cancelar e voltar ao login
                </button>
              )}
            </form>
          </section>
        </div>
      </main>

      {(verifyEmail || resetEmail) && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#141a22]/55 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-title"
        >
          <div className="animate-fade-up w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2c4566] to-[#b33a3a] text-white">
                <Mail className="h-6 w-6" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setVerifyEmail(null)
                  setResetEmail(null)
                  setMode('login')
                }}
                className="rounded-lg p-1 text-ink-muted hover:bg-brand-50 dark:hover:bg-slate-800"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2
              id="verify-title"
              className="mt-4 font-display text-2xl font-bold text-ink"
            >
              Acesse seu e-mail
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Enviamos um link para{' '}
              <strong className="text-ink">{verifyEmail ?? resetEmail}</strong>.
              {resetEmail
                ? ' Abra a mensagem e defina uma nova senha.'
                : ' Abra a mensagem e valide a conta. Depois volte aqui e entre com e-mail e senha.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setVerifyEmail(null)
                setResetEmail(null)
                setMode('login')
              }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2c4566] to-[#b33a3a] px-4 py-2.5 text-sm font-bold text-white"
            >
              Ir para o login
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
