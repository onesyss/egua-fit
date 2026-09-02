import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { EvolutionReportView } from '../components/EvolutionReportView'
import {
  fetchEvolutionShare,
  type EvolutionShareRecord,
} from '../lib/evolutionShareStore'

export function SharedEvolutionPage() {
  const { shareId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [share, setShare] = useState<EvolutionShareRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    if (!shareId) {
      setError('Link inválido.')
      setLoading(false)
      return
    }

    fetchEvolutionShare(shareId)
      .then((row) => {
        if (cancelled) return
        if (!row?.payload?.data) {
          setError('Este relatório não foi encontrado ou o link expirou.')
          setShare(null)
        } else {
          setShare(row)
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível abrir o relatório.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [shareId])

  return (
    <div className="evolucao-doc-page min-h-screen bg-[#e8ebf0] text-slate-900">
      <div className="mx-auto max-w-[820px] px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 no-print">
          <p className="text-xs font-medium text-slate-500">
            Relatório compartilhado · Égua Fit
          </p>
          {share && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2c4566] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233650]"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir / PDF
            </button>
          )}
        </div>

        {loading && (
          <div className="rounded-sm bg-white px-8 py-16 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-slate-500">Carregando relatório…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-sm bg-white px-8 py-16 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            <p className="font-semibold text-red-600">{error}</p>
            <p className="mt-2 text-sm text-slate-500">
              Peça um novo link ao seu personal trainer.
            </p>
          </div>
        )}

        {!loading && share && (
          <div className="evolucao-doc-paper rounded-sm bg-white px-5 py-7 shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
            <EvolutionReportView
              data={share.payload.data}
              studentName={share.payload.studentName}
              goal={share.payload.goal}
              showHero
              documentStyle
              emittedAt={share.payload.createdAt ?? share.createdAt}
              headline={share.payload.headline}
              message={share.payload.message}
            />
          </div>
        )}
      </div>
    </div>
  )
}
