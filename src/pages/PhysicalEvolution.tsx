import {
  Clock,
  Flame,
  Timer,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { useAppData } from '../context/DataContext'
import {
  AbsBarChart,
  PlankAreaChart,
  RunningChart,
} from '../components/Charts'
import { MetricCard, Panel, SectionTitle } from '../components/ui'

export function PhysicalEvolution() {
  const { data } = useAppData()
  const { student, physical, evolution } = data

  return (
    <div className="space-y-6">
      <section className="animate-fade-up">
        <p className="tech-label text-brand-600 dark:text-brand-300">
          evolução física integrada
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Desempenho de {student.name.split(' ')[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Acompanhe cardiorespiratório, abdominais e prancha — todos os parâmetros
          de performance do aluno em um só lugar.
        </p>
      </section>

      {/* Cards de recordes */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Recorde 1 km"
          value={physical.record1km}
          subtitle="melhor tempo"
          icon={Timer}
          accent="blue"
          delay="delay-1"
        />
        <MetricCard
          title="Redução de tempo"
          value={physical.timeReduction1km}
          subtitle="no 1 km"
          icon={TrendingDown}
          accent="green"
          delay="delay-1"
        />
        <MetricCard
          title="Vel. máxima"
          value={`${physical.maxTreadmillSpeed}`}
          subtitle="km/h na esteira"
          icon={Zap}
          accent="muted"
          delay="delay-2"
        />
        <MetricCard
          title="Max. abdominais"
          value={physical.maxAbsAverage}
          subtitle="média por série"
          icon={Flame}
          accent="red"
          delay="delay-2"
        />
        <MetricCard
          title="Recorde prancha"
          value={physical.plankRecord}
          subtitle="tempo isométrico"
          icon={Clock}
          accent="blue"
          delay="delay-3"
        />
      </section>

      {/* Destaque cardio / abs */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel delay="delay-2" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-brand-100/80 blur-2xl" />
          <SectionTitle
            title="Cardio em foco"
            subtitle="Corrida e esteira"
          />
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-slate-50 p-4 dark:border-white/25 dark:from-slate-900 dark:to-slate-900/60">
              <p className="tech-label">Ritmo atual 1 km</p>
              <p className="tech-value mt-1 text-3xl text-brand-800 dark:text-brand-200">
                {physical.record1km}
              </p>
              <p className="mt-1 font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {physical.timeReduction1km} vs início
              </p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-slate-50 to-brand-50 p-4 dark:border-white/25 dark:from-slate-900 dark:to-slate-900/60">
              <p className="tech-label">Pico na esteira</p>
              <p className="tech-value mt-1 text-3xl text-brand-800 dark:text-brand-200">
                {physical.maxTreadmillSpeed}
                <span className="text-base font-medium text-ink-muted"> km/h</span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">velocidade máxima</p>
            </div>
          </div>
        </Panel>

        <Panel delay="delay-3" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-sky-100/80 blur-2xl" />
          <SectionTitle
            title="Core em foco"
            subtitle="Abdominais e prancha"
          />
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-red-50/40 p-4 dark:border-white/25 dark:from-slate-900 dark:to-slate-900/60">
              <p className="tech-label">Média abdominais</p>
              <p className="tech-value mt-1 text-3xl text-brand-800 dark:text-brand-200">
                {physical.maxAbsAverage}
              </p>
              <p className="mt-1 text-xs text-ink-muted">reps por série</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-brand-50 p-4 dark:border-white/25 dark:from-slate-900 dark:to-slate-900/60">
              <p className="tech-label">Recorde prancha</p>
              <p className="tech-value mt-1 text-3xl text-brand-800 dark:text-brand-200">
                {physical.plankRecord}
              </p>
              <p className="mt-1 text-xs text-ink-muted">tempo sustentado</p>
            </div>
          </div>
        </Panel>
      </section>

      {/* Gráficos de evolução */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel delay="delay-2">
          <SectionTitle
            title="Tempo de corrida"
            subtitle="Evolução do 1 km (menor é melhor)"
          />
          <RunningChart data={evolution.runningTime} />
        </Panel>
        <Panel delay="delay-3">
          <SectionTitle
            title="Média de abdominais"
            subtitle="Progressão mensal"
          />
          <AbsBarChart data={evolution.absAverage} />
        </Panel>
        <Panel delay="delay-4">
          <SectionTitle
            title="Prancha"
            subtitle="Tempo isométrico (segundos)"
          />
          <PlankAreaChart data={evolution.plank} />
        </Panel>
      </section>

      {/* Tabela resumo parâmetros */}
      <Panel delay="delay-4">
        <SectionTitle
          title="Parâmetros de desempenho"
          subtitle="Resumo consolidado do aluno"
        />
        <div className="table-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-ink-muted dark:border-slate-800">
                <th className="px-3 py-3 font-semibold">Parâmetro</th>
                <th className="px-3 py-3 font-semibold">Valor atual</th>
                <th className="px-3 py-3 font-semibold">Categoria</th>
                <th className="px-3 py-3 font-semibold">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {[
                {
                  param: 'Recorde 1 km',
                  value: physical.record1km,
                  cat: 'Cardio',
                  note: 'Melhor tempo registrado',
                },
                {
                  param: 'Redução de tempo (1 km)',
                  value: physical.timeReduction1km,
                  cat: 'Cardio',
                  note: 'Ganho desde o início do acompanhamento',
                },
                {
                  param: 'Vel. máxima (esteira)',
                  value: `${physical.maxTreadmillSpeed} km/h`,
                  cat: 'Cardio',
                  note: 'Pico em sessão monitorada',
                },
                {
                  param: 'Max. abdominais (média)',
                  value: String(physical.maxAbsAverage),
                  cat: 'Core',
                  note: 'Média de repetições por série',
                },
                {
                  param: 'Recorde prancha',
                  value: physical.plankRecord,
                  cat: 'Core',
                  note: 'Tempo máximo sustentado',
                },
              ].map((row) => (
                <tr key={row.param} className="hover:bg-brand-50/40 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-3 font-medium">{row.param}</td>
                  <td className="px-3 py-3 font-display text-base font-bold text-brand-700 dark:text-brand-300">
                    {row.value}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-200">
                      {row.cat}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
