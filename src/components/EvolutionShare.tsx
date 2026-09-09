import { useEffect, useMemo, useState } from 'react'
import { Link, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { StudentRecord } from '../types'
import {
  evolutionCelebrationMessage,
  toShareableEvolution,
  type MonthlyEvolution,
} from '../lib/monthlyEvolution'
import { createEvolutionShare } from '../lib/evolutionShareStore'
import { whatsappHref } from '../lib/reportShare'

function shareMessage(
  studentName: string,
  periodLabel: string,
  url: string,
  note: string,
): string {
  const first = studentName.split(' ')[0] || studentName
  const parts = [
    note.trim() ||
      `Oi, ${first}! Segue o link da sua evolução (${periodLabel}) no Égua Fit:`,
    '',
    url,
    '',
    'É só clicar para ver o relatório completo (números e gráficos).',
  ]
  return parts.join('\n')
}

export function EvolutionShare({
  record,
  data,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSaveContact,
}: {
  record: StudentRecord
  data: MonthlyEvolution
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onSaveContact: (patch: { phone?: string }) => void
}) {
  const { user } = useAuth()
  const [phone, setPhone] = useState(record.student.phone ?? '')
  const [note, setNote] = useState('')
  const [headline, setHeadline] = useState('')
  const [coverMessage, setCoverMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [lastUrl, setLastUrl] = useState<string | null>(null)

  useEffect(() => {
    setPhone(record.student.phone ?? '')
  }, [record.student.id, record.student.phone])

  const defaults = useMemo(
    () =>
      evolutionCelebrationMessage(
        data,
        record.student.name,
        record.anamnesis.goal,
      ),
    [data, record.student.name, record.anamnesis.goal],
  )

  useEffect(() => {
    setHeadline(defaults.headline)
    setCoverMessage(defaults.message)
  }, [defaults.headline, defaults.message])

  const ensureShareLink = async () => {
    if (!user?.id) {
      throw new Error('Faça login para gerar o link do relatório.')
    }
    if (!startDate || !endDate) {
      throw new Error('Informe a data de início e a data de fim do relatório.')
    }
    const { url } = await createEvolutionShare({
      userId: user.id,
      studentId: record.student.id,
      studentName: record.student.name,
      year: data.year,
      month: data.month,
      goal: record.anamnesis.goal,
      data: toShareableEvolution(data),
      headline: headline.trim() || defaults.headline,
      message: coverMessage.trim() || defaults.message,
    })
    setLastUrl(url)
    return url
  }

  const sendWhatsApp = async () => {
    if (!whatsappHref(phone, 'ok')) {
      setError('Informe um WhatsApp válido com DDD (ex.: 11999998888).')
      setHint(null)
      return
    }

    setBusy(true)
    setError(null)
    setHint('Gerando o link do relatório…')

    try {
      const url = await ensureShareLink()
      const message = shareMessage(
        record.student.name,
        data.periodLabel,
        url,
        note,
      )
      onSaveContact({ phone: phone.trim() })

      const href = whatsappHref(phone, message)
      if (!href) {
        setError('Informe um WhatsApp válido com DDD (ex.: 11999998888).')
        return
      }

      setHint('Link pronto. Abrindo o WhatsApp…')
      window.open(href, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível gerar o link do relatório.',
      )
      setHint(null)
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    setBusy(true)
    setError(null)
    setHint('Gerando o link do relatório…')
    try {
      const url = await ensureShareLink()
      await navigator.clipboard.writeText(url)
      setHint('Link copiado. Cole no WhatsApp.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível copiar o link.',
      )
      setHint(null)
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="no-print mb-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <h3 className="font-display text-base font-bold text-ink">
        Enviar evolução ao aluno
      </h3>
      <p className="mt-1 text-sm text-ink-muted">
        Escolha o período, edite a capa e envie o link pelo WhatsApp.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Data início
          </span>
          <input
            type="date"
            className={field}
            value={startDate}
            max={endDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Data fim
          </span>
          <input
            type="date"
            className={field}
            value={endDate}
            min={startDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Título da capa
          </span>
          <input
            className={field}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={`Parabéns, ${record.student.name.split(' ')[0]}!`}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Texto da capa
          </span>
          <textarea
            className={`${field} min-h-[88px]`}
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Mensagem do WhatsApp (opcional)
          </span>
          <textarea
            className={`${field} min-h-[64px]`}
            placeholder={`Oi, ${record.student.name.split(' ')[0]}! Segue o link da sua evolução.`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            WhatsApp
          </span>
          <input
            className={field}
            inputMode="tel"
            placeholder="11999998888"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={busy}
          />
        </label>
        <button
          type="button"
          onClick={() => void sendWhatsApp()}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7368] disabled:opacity-60"
        >
          <MessageCircle className="h-4 w-4" />
          {busy ? 'Gerando…' : 'Enviar no Zap'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void copyLink()}
          disabled={busy}
          className="rounded-xl border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60 dark:border-slate-700 dark:text-brand-200"
        >
          Copiar link
        </button>
        {lastUrl && (
          <a
            href={lastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            <Link className="h-3.5 w-3.5" />
            Abrir página do aluno
          </a>
        )}
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}
      {hint && !error && (
        <p className="mt-3 text-sm font-semibold text-emerald-700">{hint}</p>
      )}
    </div>
  )
}
