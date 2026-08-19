import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  clearDeviceLogin,
  clearEmailConfirmedNotice,
  clearPasswordRecovery,
  clearPasswordUpdatedNotice,
  deviceLoginExpired,
  emailIsRegistered,
  hasDeviceLogin,
  hasPasswordRecovery,
  humanAuthError,
  isSignupEmailRedirect,
  markDeviceLogin,
  markEmailConfirmedNotice,
  markPasswordRecovery,
  markPasswordUpdatedNotice,
  peekEmailConfirmedNotice,
  peekPasswordUpdatedNotice,
  supabase,
  supabaseConfigured,
} from '../lib/supabase'
import { cloudErrorMessage, syncStudentRecords } from '../lib/supabaseStudents'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  passwordRecovery: boolean
  emailJustConfirmed: boolean
  passwordJustUpdated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: {
    name: string
    email: string
    password: string
  }) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  completePasswordRecovery: (password: string) => Promise<void>
  signOut: () => Promise<void>
  updateName: (name: string) => Promise<void>
  updatePassword: (currentPassword: string, nextPassword: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(hasPasswordRecovery)
  const [emailJustConfirmed, setEmailJustConfirmed] = useState(
    () => isSignupEmailRedirect() || peekEmailConfirmedNotice(),
  )
  const [passwordJustUpdated, setPasswordJustUpdated] = useState(
    peekPasswordUpdatedNotice,
  )

  useEffect(() => {
    const client = supabase
    if (!client) {
      setLoading(false)
      return
    }
    let alive = true

    const acceptSession = async (
      next: Session | null,
      stampIfMissing = false,
    ) => {
      if (!next) {
        if (alive) setSession(null)
        return
      }
      if (isSignupEmailRedirect() || peekEmailConfirmedNotice()) {
        markEmailConfirmedNotice()
        clearDeviceLogin()
        if (alive) {
          setEmailJustConfirmed(true)
          setSession(null)
        }
        await client.auth.signOut({ scope: 'local' })
        return
      }
      if (hasPasswordRecovery()) {
        clearDeviceLogin()
        markDeviceLogin()
        markPasswordRecovery()
        if (alive) setPasswordRecovery(true)
      } else if (stampIfMissing && !hasDeviceLogin()) {
        markDeviceLogin()
      }
      if (deviceLoginExpired()) {
        clearDeviceLogin()
        await client.auth.signOut()
        if (alive) setSession(null)
        return
      }
      if (alive) setSession(next)
    }

    client.auth.getSession().then(({ data }) => {
      if (!alive) return
      void acceptSession(data.session, true).finally(() => {
        if (alive) setLoading(false)
      })
    })
    const { data: sub } = client.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_OUT') {
        clearDeviceLogin()
        clearPasswordRecovery()
        if (alive) {
          setPasswordRecovery(false)
          setSession(null)
        }
        return
      }
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
        (isSignupEmailRedirect() || peekEmailConfirmedNotice())
      ) {
        markEmailConfirmedNotice()
        if (alive) {
          setEmailJustConfirmed(true)
          setSession(null)
        }
        void client.auth.signOut({ scope: 'local' })
        return
      }
      if (event === 'PASSWORD_RECOVERY') {
        markPasswordRecovery()
        if (alive) setPasswordRecovery(true)
        void acceptSession(next, true)
        return
      }
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void acceptSession(next, false)
        return
      }
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        void acceptSession(next, true)
      }
    })

    const tick = window.setInterval(() => {
      if (!alive) return
      if (deviceLoginExpired()) {
        clearDeviceLogin()
        void client.auth.signOut()
      }
    }, 30_000)

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (deviceLoginExpired()) {
        clearDeviceLogin()
        void client.auth.signOut()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      alive = false
      window.clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const code = 'code' in error ? String(error.code ?? '') : ''
      const msg = error.message ?? ''
      const unknownUser =
        code === 'user_not_found' || /user not found/i.test(msg)
      const badCredentials =
        code === 'invalid_credentials' || /invalid login|invalid credentials/i.test(msg)
      const unconfirmed =
        code === 'email_not_confirmed' || /email not confirmed/i.test(msg)

      if (unconfirmed) {
        throw new Error('Valide a conta no e-mail antes de entrar.')
      }
      if (unknownUser || badCredentials) {
        const registered = unknownUser ? false : await emailIsRegistered(email)
        if (registered === false) {
          throw new Error('Usuário inexistente ou não cadastrado.')
        }
        if (registered === true) {
          throw new Error('Senha incorreta.')
        }
        throw new Error(
          'Usuário inexistente ou não cadastrado. Se já tem conta, confira a senha.',
        )
      }
      throw error
    }
    clearEmailConfirmedNotice()
    clearPasswordUpdatedNotice()
    setEmailJustConfirmed(false)
    setPasswordJustUpdated(false)
    markDeviceLogin()
  }, [])

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      if (!supabase) throw new Error('Supabase não configurado')
      const origin =
        typeof window !== 'undefined' ? window.location.origin : undefined
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { full_name: input.name.trim() },
          emailRedirectTo: origin ? `${origin}/login?confirmed=1` : undefined,
        },
      })
      const identities = data.user?.identities
      const alreadyExists =
        Boolean(data.user) &&
        Array.isArray(identities) &&
        identities.length === 0
      const created = Boolean(data.user) && !alreadyExists

      if (alreadyExists) {
        throw new Error('Este e-mail já tem conta. Entre com a senha.')
      }
      if (error && !created) {
        throw new Error(
          humanAuthError(error, 'Não foi possível criar a conta.'),
        )
      }
      if (!created) {
        throw new Error('Não foi possível criar a conta.')
      }
      clearDeviceLogin()
      clearPasswordRecovery()
      if (data.session) {
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch {
          /* conta já criada; o aviso de e-mail continua */
        }
      }
    },
    [],
  )

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    const trimmed = email.trim()
    if (!trimmed) throw new Error('Informe o e-mail para recuperar a senha.')
    const registered = await emailIsRegistered(trimmed)
    if (registered === false) {
      throw new Error('Usuário inexistente ou não cadastrado.')
    }
    const origin =
      typeof window !== 'undefined' ? window.location.origin : undefined
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: origin ? `${origin}/login` : undefined,
    })
    if (error) throw error
  }, [])

  const completePasswordRecovery = useCallback(async (password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    if (password.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 caracteres.')
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    markPasswordUpdatedNotice()
    clearPasswordRecovery()
    clearDeviceLogin()
    setPasswordRecovery(false)
    setPasswordJustUpdated(true)
    await supabase.auth.signOut({ scope: 'local' })
  }, [])

  const signOut = useCallback(async () => {
    clearDeviceLogin()
    clearPasswordRecovery()
    setPasswordRecovery(false)
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const updateName = useCallback(async (name: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Informe o nome.')
    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(
    async (currentPassword: string, nextPassword: string) => {
      if (!supabase) throw new Error('Supabase não configurado')
      const email = session?.user.email
      if (!email) throw new Error('Sessão inválida')
      if (nextPassword.length < 6) {
        throw new Error('A nova senha precisa ter pelo menos 6 caracteres.')
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (authError) throw new Error('Senha atual incorreta.')
      const { error } = await supabase.auth.updateUser({ password: nextPassword })
      if (error) throw error
    },
    [session],
  )

  const deleteAccount = useCallback(
    async (password: string) => {
      if (!supabase) throw new Error('Supabase não configurado')
      const email = session?.user.email
      const userId = session?.user.id
      const token = session?.access_token
      if (!email || !userId || !token) throw new Error('Sessão inválida')

      const { data: reauth, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })
      if (authError) throw new Error('Senha incorreta.')
      const accessToken = reauth.session?.access_token ?? token

      try {
        await syncStudentRecords([], userId)
      } catch {
        /* ainda tenta apagar o login */
      }

      localStorage.removeItem(`egua-fit-personal-students:${userId}`)
      localStorage.removeItem(`equafit-pinned-students:${userId}`)
      clearDeviceLogin()

      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      const res = await fetch(`${url}/auth/v1/user`, {
        method: 'DELETE',
        headers: {
          apikey: key,
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!res.ok) {
        const { error } = await supabase.rpc('delete_own_account')
        if (error) {
          await supabase.auth.signOut()
          throw new Error(
            cloudErrorMessage(
              error,
              'Não foi possível excluir o login. Os alunos desta conta já foram removidos.',
            ),
          )
        }
      }

      await supabase.auth.signOut()
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: supabaseConfigured,
      passwordRecovery,
      emailJustConfirmed,
      passwordJustUpdated,
      signIn,
      signUp,
      resetPassword,
      completePasswordRecovery,
      signOut,
      updateName,
      updatePassword,
      deleteAccount,
    }),
    [
      session,
      loading,
      passwordRecovery,
      emailJustConfirmed,
      passwordJustUpdated,
      signIn,
      signUp,
      resetPassword,
      completePasswordRecovery,
      signOut,
      updateName,
      updatePassword,
      deleteAccount,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
