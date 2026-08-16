import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import type { ChartPoint, Exercise, MuscleGroup, RepsSessionPoint } from '../types'
import { useTheme } from '../context/ThemeContext'

function useChartTheme() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  return {
    isDark,
    grid: isDark ? 'rgba(148,168,196,0.1)' : 'rgba(61,90,128,0.1)',
    tick: isDark ? '#8b93a0' : '#6b7380',
    blue: isDark ? '#7a94b5' : '#3d5a80',
    red: isDark ? '#c96a6a' : '#b33a3a',
    muted: isDark ? '#3a4250' : '#d5d9e0',
    tooltip: {
      backgroundColor: isDark ? 'rgba(20,26,34,0.96)' : 'rgba(21,31,46,0.96)',
      border: '1px solid rgba(61,90,128,0.25)',
      borderRadius: 10,
      fontSize: 11,
      fontFamily: '"JetBrains Mono", monospace',
      color: '#e8ebf0',
      padding: '10px 12px',
    },
  }
}

export function PerformanceRepsChart({ data }: { data: RepsSessionPoint[] }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip contentStyle={t.tooltip} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
          iconType="plainline"
        />
        <Line
          type="monotone"
          dataKey="planned"
          name="Repetições"
          stroke={t.muted}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="done"
          name="Repetições finalizadas"
          stroke={t.red}
          strokeWidth={2.5}
          dot={{ r: 3, fill: t.red, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ExerciseCompareBars({ exercises }: { exercises: Exercise[] }) {
  const t = useChartTheme()
  const data = exercises.map((e) => ({
    name: e.name.length > 16 ? e.name.slice(0, 14) + '…' : e.name,
    fullName: e.name,
    planejado: e.sets * e.reps,
    realizado: e.sets * e.repsDone,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: t.tick, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-18}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip contentStyle={t.tooltip} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="planejado" name="Planejado" fill={t.muted} radius={[4, 4, 0, 0]} />
        <Bar dataKey="realizado" name="Realizado" fill={t.red} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FrequencyDonut({ percent }: { percent: number }) {
  const t = useChartTheme()
  const value = Math.min(Math.max(percent, 0), 100)
  const data = [
    { name: 'freq', value },
    { name: 'rest', value: 100 - value },
  ]

  return (
    <div className="relative mx-auto h-[160px] w-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={52}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={t.red} />
            <Cell fill={t.muted} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold text-ink">{value}%</span>
      </div>
    </div>
  )
}

export function LoadAreaChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={t.tooltip} />
        <Line type="monotone" dataKey="value" name="Carga" stroke={t.blue} strokeWidth={2.5} dot={{ r: 3, fill: t.blue }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PerformanceLineChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={t.tooltip} />
        <Line type="monotone" dataKey="value" name="Desempenho %" stroke={t.red} strokeWidth={2.5} dot={{ r: 3, fill: t.red }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function RunningChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => {
            const m = Math.floor(Number(v) / 60)
            const s = Number(v) % 60
            return `${m}:${String(s).padStart(2, '0')}`
          }}
        />
        <Tooltip
          contentStyle={t.tooltip}
          formatter={(value) => {
            const v = Number(value)
            const m = Math.floor(v / 60)
            const s = v % 60
            return [`${m}:${String(s).padStart(2, '0')}`, 'Tempo 1km']
          }}
        />
        <Line type="monotone" dataKey="value" stroke={t.blue} strokeWidth={2.5} dot={{ r: 3, fill: t.blue }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function AbsBarChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={t.tooltip} />
        <Bar dataKey="value" name="Abs" fill={t.red} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PlankAreaChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: t.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => {
            const m = Math.floor(Number(v) / 60)
            const s = Number(v) % 60
            return `${m}:${String(s).padStart(2, '0')}`
          }}
        />
        <Tooltip contentStyle={t.tooltip} />
        <Line type="monotone" dataKey="value" name="Prancha" stroke={t.blue} strokeWidth={2.5} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function VolumeHistoryChart({
  data,
}: {
  data: { label: string; volume: number; change: number }[]
}) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="kg"
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={t.tooltip}
          formatter={(value, name) => {
            const n = Number(value)
            if (name === 'Variação %') return [`${n > 0 ? '+' : ''}${n}%`, name]
            return [`${n.toLocaleString('pt-BR')} kg`, 'Carga']
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar
          yAxisId="pct"
          dataKey="change"
          name="Variação %"
          fill={t.muted}
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="kg"
          type="monotone"
          dataKey="volume"
          name="Carga (kg)"
          stroke={t.red}
          strokeWidth={2.5}
          dot={{ r: 3, fill: t.red, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  Peito: '#b33a3a',
  Costas: '#2c4566',
  Ombros: '#b45309',
  Bíceps: '#6d28d9',
  Tríceps: '#9f1239',
  Pernas: '#166534',
  Glúteos: '#854d0e',
  Abdômen: '#0f766e',
  Cardio: '#1d4ed8',
}

export function MusclesWorkedBars({
  data,
}: {
  data: { group: MuscleGroup; volumeKg: number; sets: number }[]
}) {
  const t = useChartTheme()
  const rows = data.map((d) => ({
    name: d.group,
    volume: Math.round(d.volumeKg * 10) / 10,
    sets: d.sets,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 6" stroke={t.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: t.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip
          contentStyle={t.tooltip}
          formatter={(value, name) =>
            name === 'sets'
              ? [value, 'Séries']
              : [`${Number(value).toLocaleString('pt-BR')} kg`, 'Volume']
          }
        />
        <Bar dataKey="volume" name="Volume (kg)" radius={[0, 4, 4, 0]}>
          {rows.map((row) => (
            <Cell
              key={row.name}
              fill={MUSCLE_COLORS[row.name as MuscleGroup] ?? t.blue}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Mantido por compatibilidade */
export function RadarMetrics({
  metrics,
}: {
  metrics: { label: string; value: number; max: number }[]
}) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-ink-muted">
      {metrics.length} métricas
    </div>
  )
}
