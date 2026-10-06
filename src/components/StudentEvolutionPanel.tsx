import { useEffect, useMemo, useState } from 'react'
import { Printer, TrendingUp } from 'lucide-react'
import { useGym } from '../context/DataContext'
import type { StudentRecord } from '../types'
import {
  computeEvolutionInRange,
  defaultEvolutionDateRange,
} from '../lib/monthlyEvolution'
import { EvolutionShare } from '../components/EvolutionShare'
import { EvolutionReportView } from '../components/EvolutionReportView'
import { CollapsibleCard } from '../components/ui'
import { setPdfLight } from '../lib/pdfLight'

export function StudentEvolutionPanel({
  record,
  studentName,
}: {
  record: StudentRecord
  studentName: string
}) {
  const { updateStudent } = useGym()
  const defaults = useMemo(
    () => defaultEvolutionDateRange(record),
    [record],
  )
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    setStartDate(defaults.start)
    setEndDate(defaults.end)
  }, [record.student.id, defaults.start, defaults.end])

  const data = useMemo(
    () => computeEvolutionInRange(record, startDate, endDate),
    [record, startDate, endDate],
  )

  const printPdf = () => {
    setPanelOpen(true)
    setPdfLight(true)
    const liveBody = document.querySelector(
      '#evolucao-mensal .collapsible-body',
    ) as HTMLElement | null
    if (liveBody?.classList.contains('hidden')) {
      liveBody.classList.remove('hidden')
    }

    document.body.classList.add('evolucao-printing')

    const expandCharts = () => {
      document
        .querySelectorAll<HTMLElement>(
          '#evolucao-mensal .recharts-responsive-container > div, #painel-desempenho .recharts-responsive-container > div',
        )
        .forEach((node) => {
          node.style.setProperty('width', '100%', 'important')
          node.style.setProperty('height', '100%', 'important')
          node.style.setProperty('overflow', 'visible', 'important')
        })
    }

    const cleanup = () => {
      document.body.classList.remove('evolucao-printing')
      setPdfLight(false)
      document
        .querySelectorAll<HTMLElement>(
          '#evolucao-mensal .recharts-responsive-container > div, #painel-desempenho .recharts-responsive-container > div',
        )
        .forEach((node) => {
          node.style.removeProperty('width')
          node.style.removeProperty('height')
          node.style.removeProperty('overflow')
        })
    }

    window.addEventListener('afterprint', cleanup, { once: true })

    const started = Date.now()
    const tryPrint = () => {
      const svgs = [
        ...document.querySelectorAll(
          '#evolucao-mensal svg.recharts-surface, #painel-desempenho svg.recharts-surface',
        ),
      ]
      const ready =
        svgs.length > 0 &&
        svgs.every((svg) => svg.getBoundingClientRect().width > 8)
      if (!ready && Date.now() - started < 900) {
        window.setTimeout(tryPrint, 50)
        return
      }
      expandCharts()
      window.print()
    }
    window.setTimeout(tryPrint, 60)
  }

  const field =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950'

  const headerExtra = (
    <div className="no-print flex flex-wrap items-end gap-2">
      <label className="block text-xs text-ink-muted">
        De
        <input
          type="date"
          className={`ml-2 ${field}`}
          value={startDate}
          max={endDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>
      <label className="block text-xs text-ink-muted">
        Até
        <input
          type="date"
          className={`ml-2 ${field}`}
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={printPdf}
        className="inline-flex items-center gap-2 rounded-xl bg-[#2c4566] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#233650]"
      >
        <Printer className="h-4 w-4" />
        PDF
      </button>
    </div>
  )

  return (
    <CollapsibleCard
      id="evolucao-mensal"
      title="Evolução do aluno"
      subtitle={`${data.periodLabel} · força, frequência e desempenho por treino`}
      icon={TrendingUp}
      headerExtra={headerExtra}
      open={panelOpen}
      onOpenChange={setPanelOpen}
    >
      <div className="no-print">
        <EvolutionShare
          record={record}
          data={data}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSaveContact={(patch) => updateStudent(patch, record.student.id)}
        />
      </div>

      <EvolutionReportView
        data={data}
        studentName={studentName}
        goal={record.anamnesis.goal}
        showHero
      />
    </CollapsibleCard>
  )
}
