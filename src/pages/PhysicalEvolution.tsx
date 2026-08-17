import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Flame, Timer, TrendingDown, Zap } from 'lucide-react'
import { useGym } from '../context/DataContext'
import {
  AbsBarChart,
  PlankAreaChart,
  RunningChart,
} from '../components/Charts'
import { MetricCard, Panel, SectionTitle } from '../components/ui'
import { StudentName } from '../components/StudentIdentity'

export function PhysicalEvolution() {
  const { studentId } = useParams()
  const { students, setActiveId } = useGym()
  const record = students.find((s) => s.student.id === studentId)

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  if (!record) return <Navigate to="/" replace />

  const { student, physical, evolution } = record

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/aluno/${student.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-ink-muted hover:bg-brand-50 dark:border-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div>
          <p className="tech-label text-brand-600 dark:text-brand-300">
            evolução física
          </p>
          <StudentName
            student={student}
            as="h1"
            className="font-display text-2xl font-bold sm:text-3xl"
          />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Recorde 1 km"
          value={physical.record1km}
          subtitle="melhor tempo"
          icon={Timer}
          accent="blue"
        />
        <MetricCard
          title="Redução de tempo"
          value={physical.timeReduction1km}
          subtitle="no 1 km"
          icon={TrendingDown}
          accent="green"
        />
        <MetricCard
          title="Vel. máxima"
          value={`${physical.maxTreadmillSpeed}`}
          subtitle="km/h na esteira"
          icon={Zap}
          accent="red"
        />
        <MetricCard
          title="Max. abdominais"
          value={physical.maxAbsAverage}
          subtitle="média por série"
          icon={Flame}
          accent="red"
        />
        <MetricCard
          title="Recorde prancha"
          value={physical.plankRecord}
          subtitle="tempo isométrico"
          icon={Clock}
          accent="blue"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <SectionTitle title="Tempo de corrida" subtitle="1 km" />
          <RunningChart data={evolution.runningTime} />
        </Panel>
        <Panel>
          <SectionTitle title="Média de abdominais" subtitle="Progressão" />
          <AbsBarChart data={evolution.absAverage} />
        </Panel>
        <Panel>
          <SectionTitle title="Prancha" subtitle="Tempo (s)" />
          <PlankAreaChart data={evolution.plank} />
        </Panel>
      </section>
    </div>
  )
}
