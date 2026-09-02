import { supabase, supabaseConfigured, humanErrorMessage } from './supabase'
import type { MonthlyEvolution } from './monthlyEvolution'

export interface EvolutionSharePayload {
  studentName: string
  goal?: string
  data: MonthlyEvolution
  createdAt: string
  /** Título editável da capa (ex.: Parabéns, Sheila!) */
  headline?: string
  /** Texto editável da capa */
  message?: string
}

export interface EvolutionShareRecord {
  id: string
  studentId: string
  studentName: string
  year: number
  month: number
  payload: EvolutionSharePayload
  createdAt: string
}

function newShareId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function evolutionShareUrl(shareId: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${base}/evolucao/${shareId}`
}

export async function createEvolutionShare(input: {
  userId: string
  studentId: string
  studentName: string
  year: number
  month: number
  goal?: string
  data: MonthlyEvolution
  headline?: string
  message?: string
}): Promise<{ id: string; url: string }> {
  if (!supabaseConfigured || !supabase) {
    throw new Error(
      'Supabase não configurado. O link público precisa da nuvem para o aluno abrir em outro aparelho.',
    )
  }

  const id = newShareId()
  const createdAt = new Date().toISOString()
  const payload: EvolutionSharePayload = {
    studentName: input.studentName,
    goal: input.goal,
    data: input.data,
    createdAt,
    headline: input.headline?.trim() || undefined,
    message: input.message?.trim() || undefined,
  }

  const { error } = await supabase.from('evolution_shares').insert({
    id,
    user_id: input.userId,
    student_id: input.studentId,
    student_name: input.studentName,
    year: input.year,
    month: input.month,
    payload,
    created_at: createdAt,
  })

  if (error) {
    throw new Error(
      humanErrorMessage(
        error,
        'Não foi possível criar o link. Confira se a tabela evolution_shares existe no Supabase.',
      ),
    )
  }

  return { id, url: evolutionShareUrl(id) }
}

export async function fetchEvolutionShare(
  shareId: string,
): Promise<EvolutionShareRecord | null> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await supabase
    .from('evolution_shares')
    .select('id, student_id, student_name, year, month, payload, created_at')
    .eq('id', shareId)
    .maybeSingle()

  if (error) {
    throw new Error(humanErrorMessage(error, 'Não foi possível carregar o relatório.'))
  }
  if (!data) return null

  const payload = data.payload as EvolutionSharePayload
  return {
    id: data.id,
    studentId: data.student_id,
    studentName: data.student_name || payload.studentName,
    year: data.year,
    month: data.month,
    payload,
    createdAt: data.created_at,
  }
}
