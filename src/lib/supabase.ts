import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const SESSION_MS = 3 * 60 * 60 * 1000
const LOGIN_AT_KEY = 'egua-fit-login-at'
const RECOVERY_KEY = 'egua-fit-password-recovery'
const AUTH_TYPE_KEY = 'egua-fit-auth-redirect-type'
const CONFIRMED_KEY = 'egua-fit-email-confirmed'
const PASSWORD_UPDATED_KEY = 'egua-fit-password-updated'

function readUrlAuthType(): string | null {
  if (typeof window === 'undefined') return null
  const hash = new URLSearchParams((window.location.hash ?? '').replace(/^#/, ''))
  const search = new URLSearchParams(window.location.search ?? '')
  const type = hash.get('type') ?? search.get('type')
  if (type) return type
  if (search.get('confirmed') === '1') return 'signup'
  return null
}

if (typeof window !== 'undefined') {
  const type = readUrlAuthType()
  if (type) sessionStorage.setItem(AUTH_TYPE_KEY, type)
}

export function authRedirectType(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(AUTH_TYPE_KEY) ?? readUrlAuthType()
}

export function isSignupEmailRedirect(): boolean {
  const type = authRedirectType()
  return type === 'signup' || type === 'email' || type === 'invite'
}

export function markEmailConfirmedNotice(): void {
  sessionStorage.setItem(CONFIRMED_KEY, '1')
}

export function peekEmailConfirmedNotice(): boolean {
  return sessionStorage.getItem(CONFIRMED_KEY) === '1'
}

export function clearEmailConfirmedNotice(): void {
  sessionStorage.removeItem(CONFIRMED_KEY)
  sessionStorage.removeItem(AUTH_TYPE_KEY)
}

export function markPasswordUpdatedNotice(): void {
  sessionStorage.setItem(PASSWORD_UPDATED_KEY, '1')
}

export function peekPasswordUpdatedNotice(): boolean {
  return sessionStorage.getItem(PASSWORD_UPDATED_KEY) === '1'
}

export function clearPasswordUpdatedNotice(): void {
  sessionStorage.removeItem(PASSWORD_UPDATED_KEY)
}

export function markDeviceLogin(): void {
  localStorage.setItem(LOGIN_AT_KEY, String(Date.now()))
}

export function clearDeviceLogin(): void {
  localStorage.removeItem(LOGIN_AT_KEY)
}

export function deviceLoginExpired(): boolean {
  const at = Number(localStorage.getItem(LOGIN_AT_KEY))
  if (!Number.isFinite(at) || at <= 0) return false
  return Date.now() - at > SESSION_MS
}

export function hasDeviceLogin(): boolean {
  return Boolean(localStorage.getItem(LOGIN_AT_KEY))
}

export function markPasswordRecovery(): void {
  sessionStorage.setItem(RECOVERY_KEY, '1')
}

export function clearPasswordRecovery(): void {
  sessionStorage.removeItem(RECOVERY_KEY)
}

export function hasPasswordRecovery(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(RECOVERY_KEY) === '1') return true
  return authRedirectType() === 'recovery'
}

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export const supabaseConfigured = Boolean(supabase)

function isUsefulMessage(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const text = value.trim()
  if (!text) return false
  if (text === '{}' || text === '[]' || text === '[object Object]') return false
  if (text === 'undefined' || text === 'null') return false
  return true
}

export function humanErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && isUsefulMessage(err.message)) return err.message
  if (typeof err === 'object' && err) {
    const obj = err as Record<string, unknown>
    for (const key of ['message', 'msg', 'error_description', 'error']) {
      if (isUsefulMessage(obj[key])) return String(obj[key])
    }
  }
  if (isUsefulMessage(err)) return err
  return fallback
}

const AUTH_ERROR_PT: Record<string, string> = {
  user_already_exists: 'Este e-mail já tem conta. Entre com a senha.',
  email_exists: 'Este e-mail já tem conta. Entre com a senha.',
  identity_already_exists: 'Este e-mail já tem conta. Entre com a senha.',
  over_email_send_rate_limit:
    'Muitas tentativas. Aguarde um pouco e tente de novo.',
  over_request_rate_limit:
    'Muitas tentativas. Aguarde um pouco e tente de novo.',
  signup_disabled: 'O cadastro está desativado no momento.',
  weak_password: 'A senha é muito fraca. Use pelo menos 6 caracteres.',
  email_address_invalid: 'E-mail inválido.',
  validation_failed: 'Confira o e-mail e a senha e tente de novo.',
  unexpected_failure:
    'Não foi possível enviar o e-mail de validação. No Supabase, confira Authentication → Emails → Confirm signup e o SMTP.',
}

function authErrorCode(err: unknown): string {
  if (typeof err !== 'object' || !err) return ''
  const obj = err as Record<string, unknown>
  if (typeof obj.error_code === 'string' && obj.error_code) return obj.error_code
  if (typeof obj.code === 'string' && obj.code) return obj.code
  return ''
}

export function humanAuthError(err: unknown, fallback: string): string {
  const code = authErrorCode(err)
  if (code && AUTH_ERROR_PT[code]) return AUTH_ERROR_PT[code]
  const msg = humanErrorMessage(err, '')
  if (/already registered|already exists|user already/i.test(msg)) {
    return AUTH_ERROR_PT.user_already_exists
  }
  if (/rate limit|too many/i.test(msg)) {
    return AUTH_ERROR_PT.over_email_send_rate_limit
  }
  if (/failed to fetch|networkerror|network request failed|load failed/i.test(msg)) {
    return 'Sem conexão com o servidor. Confira a internet, desative bloqueador e tente de novo.'
  }
  if (/confirmation email|error sending|smtp|unexpected_failure/i.test(msg)) {
    return AUTH_ERROR_PT.unexpected_failure
  }
  if (isUsefulMessage(msg)) return msg
  return fallback
}

/** true/false se a função existir no banco; null se ainda não foi criada. */
export async function emailIsRegistered(email: string): Promise<boolean | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('email_is_registered', {
    p_email: email.trim().toLowerCase(),
  })
  if (error) return null
  if (typeof data === 'boolean') return data
  return null
}
