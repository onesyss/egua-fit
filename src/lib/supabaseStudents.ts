import type { StudentRecord } from '../types'
import { supabase } from './supabase'

type StudentRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  payload: StudentRecord & { ownerId?: string }
  updated_at: string
  user_id?: string
}

let userIdColumn: boolean | null = null

export function cloudErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err && 'message' in err) {
    const message = String((err as { message: unknown }).message ?? '')
    if (message) return message
  }
  if (typeof err === 'string' && err.trim()) return err
  return fallback
}

export function cloudErrorHint(err: unknown, fallback: string): string {
  return cloudErrorMessage(err, fallback)
}

async function hasUserIdColumn(): Promise<boolean> {
  if (!supabase) return false
  if (userIdColumn !== null) return userIdColumn
  const { error } = await supabase.from('students').select('user_id').limit(1)
  if (!error) {
    userIdColumn = true
    return true
  }
  const msg = error.message ?? ''
  if (/42703|user_id|schema cache|Could not find/i.test(msg)) {
    userIdColumn = false
    return false
  }
  throw error
}

function withOwner(record: StudentRecord, userId: string): StudentRecord & { ownerId: string } {
  return { ...record, ownerId: userId }
}

function fromPayload(raw: StudentRecord & { ownerId?: string }): StudentRecord {
  const { ownerId: _ownerId, ...record } = raw
  return record
}

function isOwnedBy(payload: StudentRecord & { ownerId?: string }, userId: string): boolean {
  return payload.ownerId === userId
}

function toRow(record: StudentRecord, userId: string, includeUserId: boolean): StudentRow {
  const row: StudentRow = {
    id: record.student.id,
    name: record.student.name,
    email: record.student.email ?? null,
    phone: record.student.phone ?? null,
    payload: withOwner(record, userId),
    updated_at: new Date().toISOString(),
  }
  if (includeUserId) row.user_id = userId
  return row
}

export async function fetchStudentRecords(userId: string): Promise<StudentRecord[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  if (!userId) throw new Error('Sessão inválida')

  const scoped = await hasUserIdColumn()
  let query = supabase.from('students').select('payload')
  if (scoped) query = query.eq('user_id', userId)

  const { data, error } = await query.order('name', { ascending: true })
  if (error) throw error

  return (data ?? [])
    .map((row) => row.payload as StudentRecord & { ownerId?: string })
    .filter((payload) => Boolean(payload) && (scoped || isOwnedBy(payload, userId)))
    .map(fromPayload)
}

export async function syncStudentRecords(
  records: StudentRecord[],
  userId: string,
): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  if (!userId) throw new Error('Sessão inválida para salvar alunos')

  const scoped = await hasUserIdColumn()
  const read = scoped
    ? supabase.from('students').select('id').eq('user_id', userId)
    : supabase.from('students').select('id, payload')

  const { data: existing, error: readError } = await read
  if (readError) throw readError

  const keep = new Set(records.map((r) => r.student.id))
  const mine = (existing ?? []).filter((row) => {
    if (scoped) return true
    const payload = 'payload' in row
      ? (row.payload as StudentRecord & { ownerId?: string } | null)
      : null
    return payload ? isOwnedBy(payload, userId) : false
  })
  const toDelete = mine
    .map((row) => row.id)
    .filter((id) => !keep.has(id))

  if (toDelete.length > 0) {
    let del = supabase.from('students').delete().in('id', toDelete)
    if (scoped) del = del.eq('user_id', userId)
    const { error } = await del
    if (error) throw error
  }

  if (records.length === 0) return

  const { error } = await supabase
    .from('students')
    .upsert(records.map((r) => toRow(r, userId, scoped)), { onConflict: 'id' })
  if (error) throw error
}
