import { Check, Copy, Mail, MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import type { ShareDispatchResult } from '../types'

interface ShareResultModalProps {
  result: ShareDispatchResult
  studentName: string
  studentEmail: string
  onClose: () => void
}

export function ShareResultModal({
  result,
  studentName,
  studentEmail,
  onClose,
}: ShareResultModalProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = result.link
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="tech-panel animate-scale-in w-full max-w-lg p-5 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="tech-label text-brand-600 dark:text-brand-300">
              treino publicado
            </p>
            <h2
              id="share-title"
              className="font-display text-2xl font-bold tracking-wide text-ink"
            >
              Link gerado
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Treino de <strong className="text-ink">{studentName}</strong> pronto
              para envio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tech-icon-btn !h-9 !w-9"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 space-y-2 rounded-xl border border-brand-100 bg-brand-50/50 p-3 dark:border-white/25 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
            <div>
              <p className="font-semibold text-ink">E-mail</p>
              <p className="font-mono text-xs text-ink-muted">
                {result.email.detail}
                {result.email.method === 'service'
                  ? ' (envio automático)'
                  : ' (cliente de e-mail)'}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">→ {studentEmail}</p>
            </div>
          </div>
        </div>

        <label className="mb-1 block tech-label">Link do aluno</label>
        <div className="mb-4 flex gap-2">
          <input
            readOnly
            value={result.link}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs text-ink outline-none dark:border-slate-700 dark:bg-slate-950"
            onFocus={(e) => e.target.select()}
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar no WhatsApp
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-ink-muted hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            Fechar
          </button>
        </div>

        <p className="mt-4 font-mono text-[10px] tracking-wide text-ink-muted uppercase">
          id // {result.shareId}
        </p>
      </div>
    </div>
  )
}
