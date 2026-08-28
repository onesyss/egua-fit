import { useEffect, useMemo, useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import type { StudentRecord } from '../types'
import {
  buildProtocolMessage,
  isValidEmail,
  mailtoHref,
  whatsappHref,
} from '../lib/reportShare'

export function ProtocolShare({
  record,
  onSaveContact,
}: {
  record: StudentRecord
  onSaveContact: (patch: { phone?: string; email?: string }) => void
}) {
  const [phone, setPhone] = useState(record.student.phone ?? '')
  const [email, setEmail] = useState(record.student.email ?? '')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    setPhone(record.student.phone ?? '')
    setEmail(record.student.email ?? '')
  }, [record.student.id, record.student.phone, record.student.email])

  const message = useMemo(
    () => buildProtocolMessage(record, note),
    [record, note],
  )

  const persistContact = (patch: { phone?: string; email?: string }) => {
    onSaveContact(patch)
  }

  const sendWhatsApp = () => {
    const href = whatsappHref(phone, message)
    if (!href) {
      setError('Informe um WhatsApp válido com DDD (ex.: 11999998888).')
      setHint(null)
      return
    }
    persistContact({ phone: phone.trim() })
    setError(null)
    setHint('Abrindo o WhatsApp…')
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const sendEmail = () => {
    const href = mailtoHref(email, record.student.name, message)
    if (!href) {
      setError('Informe um e-mail válido.')
      setHint(null)
      return
    }
    persistContact({ email: email.trim() })
    setError(null)
    setHint('Abrindo o e-mail…')
    window.location.href = href
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
      <h2 className="font-display text-lg font-bold text-ink">
        Enviar protocolo ao aluno
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Envia a prescrição e o resumo dos treinos salvos. Use Imprimir / PDF
        para mandar os gráficos como imagem ou anexo.
      </p>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Mensagem extra (opcional)
        </span>
        <textarea
          className={`${field} min-h-[72px]`}
          placeholder={`Oi, ${record.student.name.split(' ')[0]}! Segue seu protocolo Égua Fit.`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
            />
          </label>
          <button
            type="button"
            onClick={sendWhatsApp}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7368]"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar no Zap
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              E-mail
            </span>
            <input
              type="email"
              className={field}
              placeholder="aluno@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={sendEmail}
            disabled={email.trim() !== '' && !isValidEmail(email)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2c4566] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#233650] disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            Enviar e-mail
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}
      {hint && !error && (
        <p className="mt-3 text-sm font-semibold text-emerald-700">{hint}</p>
      )}
    </div>
  )
}
