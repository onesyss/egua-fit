import type { AppData, ShareDispatchResult, WorkoutShare } from '../types'

const STORE_KEY = 'egua-fit-shares'
const LAST_KEY = 'egua-fit-last-share'

function toBase64Url(raw: string): string {
  const bytes = new TextEncoder().encode(raw)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(token: string): string {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const bin = atob(padded + pad)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function readStore(): Record<string, WorkoutShare> {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, WorkoutShare>
  } catch {
    return {}
  }
}

function writeStore(map: Record<string, WorkoutShare>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(map))
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

export function normalizePhone(phone?: string): string {
  return (phone ?? '').replace(/\D/g, '')
}

export function createShare(data: AppData): WorkoutShare {
  const share: WorkoutShare = {
    id: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
    createdAt: new Date().toISOString(),
    data: structuredClone(data),
  }

  const map = readStore()
  map[share.id] = share
  writeStore(map)
  localStorage.setItem(LAST_KEY, share.id)

  return share
}

export function getShareById(id: string): WorkoutShare | null {
  return readStore()[id] ?? null
}

export function decodeShareFromHash(hash: string): WorkoutShare | null {
  const token = hash.startsWith('#') ? hash.slice(1) : hash
  if (!token || token.length < 20) return null
  try {
    const json = fromBase64Url(token)
    const parsed = JSON.parse(json) as WorkoutShare
    if (!parsed?.id || !parsed?.data?.student) return null
    return parsed
  } catch {
    return null
  }
}

export function resolveShare(
  shareId: string | undefined,
  hash: string,
): WorkoutShare | null {
  if (shareId) {
    const local = getShareById(shareId)
    if (local) return local
  }
  const fromHash = decodeShareFromHash(hash)
  if (fromHash) return fromHash
  return null
}

export function buildShareLink(share: WorkoutShare): string {
  const origin = window.location.origin
  const base = `${origin}/treino/${share.id}`
  try {
    const token = toBase64Url(JSON.stringify(share))
    // Keep portable payload when size is messenger-friendly
    if (token.length < 9000) {
      return `${base}#${token}`
    }
  } catch {
    /* ignore */
  }
  return base
}

export function buildWhatsAppUrl(link: string, studentName: string, phone?: string): string {
  const text = [
    `Olá, ${studentName}! 💪`,
    '',
    'Seu treino na *Égua Fit* já está pronto.',
    'Acesse pelo link:',
    link,
    '',
    'Bons treinos!',
  ].join('\n')

  const q = encodeURIComponent(text)
  const digits = normalizePhone(phone)
  if (digits.length >= 10) {
    const withCountry = digits.startsWith('55') ? digits : `55${digits}`
    return `https://wa.me/${withCountry}?text=${q}`
  }
  return `https://wa.me/?text=${q}`
}

function openMailto(to: string, studentName: string, link: string) {
  const subject = encodeURIComponent(`Égua Fit — Seu treino, ${studentName}`)
  const body = encodeURIComponent(
    [
      `Olá, ${studentName}!`,
      '',
      'Seu treino foi montado na Égua Fit.',
      'Acesse pelo link abaixo:',
      link,
      '',
      'Bons treinos!',
      '— Égua Fit',
    ].join('\n'),
  )
  // Auto-dispara o cliente de e-mail com destinatário já preenchido
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`
}

/**
 * Envia o link do treino para o e-mail da aluna.
 * 1) Tenta serviço público (FormSubmit)
 * 2) Se falhar, abre e-mail automaticamente via mailto
 */
export async function sendWorkoutEmail(
  to: string,
  studentName: string,
  link: string,
): Promise<{ ok: boolean; method: 'service' | 'mailto'; detail: string }> {
  const email = to.trim()

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(email)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: 'Égua Fit',
          _subject: `Seu treino na Égua Fit — ${studentName}`,
          _template: 'table',
          _captcha: 'false',
          _honey: '',
          aluno: studentName,
          mensagem: `Olá, ${studentName}! Seu treino foi montado na Égua Fit.`,
          link_do_treino: link,
          message: `Olá, ${studentName}!\n\nSeu treino foi montado na Égua Fit.\nAcesse: ${link}\n\nBons treinos!`,
        }),
        signal: controller.signal,
      },
    )
    clearTimeout(timer)

    if (res.ok) {
      return {
        ok: true,
        method: 'service',
        detail: `E-mail enviado para ${email}`,
      }
    }
  } catch {
    /* cai no mailto */
  }

  openMailto(email, studentName, link)
  return {
    ok: true,
    method: 'mailto',
    detail: `Cliente de e-mail aberto para ${email}`,
  }
}

export async function finalizeAndDispatch(
  data: AppData,
): Promise<ShareDispatchResult> {
  if (!isValidEmail(data.student.email)) {
    throw new Error('E-mail da aluna é obrigatório e deve ser válido.')
  }
  if (data.exercises.length === 0) {
    throw new Error('Adicione ao menos um exercício antes de enviar o treino.')
  }

  const share = createShare(data)
  const link = buildShareLink(share)
  const whatsappUrl = buildWhatsAppUrl(
    link,
    data.student.name,
    data.student.phone,
  )
  const email = await sendWorkoutEmail(
    data.student.email,
    data.student.name,
    link,
  )

  return {
    shareId: share.id,
    link,
    email,
    whatsappUrl,
  }
}
