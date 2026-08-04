import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint } from '../types'
import { useTheme } from '../context/ThemeContext'

function useChartTheme() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  return {
    isDark,
    grid: isDark ? 'rgba(148,168,196,0.08)' : 'rgba(61,90,128,0.08)',
    tick: isDark ? '#8b93a0' : '#6b7380',
    radarGrid: isDark ? 'rgba(148,168,196,0.16)' : 'rgba(61,90,128,0.14)',
    stroke: isDark ? '#94a8c4' : '#2c4566',
    strokeAlt: isDark ? '#e07070' : '#b33a3a',
    fill: isDark ? '#5f7a9e' : '#3d5a80',
    bar: isDark ? '#b33a3a' : '#b33a3a',
    tooltip: {
      backgroundColor: isDark ? 'rgba(20,26,34,0.96)' : 'rgba(21,31,46,0.96)',
      border: isDark
        ? '1px solid rgba(148,168,196,0.2)'
        : '1px solid rgba(61,90,128,0.25)',
      borderRadius: 8,
      fontSize: 11,
      fontFamily: '"JetBrains Mono", monospace',
      letterSpacing: '0.03em',
      color: '#e8ebf0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      padding: '10px 12px',
    },
  }
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function LoadAreaChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.fill} stopOpacity={0.45} />
              <stop offset="55%" stopColor={t.fill} stopOpacity={0.12} />
              <stop offset="100%" stopColor={t.fill} stopOpacity={0} />
            </linearGradient>
            <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke={t.grid}
            vertical
            horizontal
          />
          <XAxis
            dataKey="month"
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: t.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip contentStyle={t.tooltip} cursor={{ stroke: t.stroke, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="value"
            name="Carga (kg)"
            stroke={t.stroke}
            strokeWidth={2.5}
            fill="url(#loadFill)"
            filter="url(#glowLine)"
            dot={{ r: 3, fill: t.stroke, strokeWidth: 0 }}
            activeDot={{
              r: 6,
              fill: t.stroke,
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function PerformanceLineChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <filter id="glowPerf" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="2 6" stroke={t.grid} vertical horizontal />
          <XAxis
            dataKey="month"
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: t.grid }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip contentStyle={t.tooltip} cursor={{ stroke: t.strokeAlt, strokeDasharray: '4 4' }} />
          <Line
            type="monotone"
            dataKey="value"
            name="Desempenho %"
            stroke={t.strokeAlt}
            strokeWidth={2.5}
            filter="url(#glowPerf)"
            dot={{ fill: t.strokeAlt, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: t.strokeAlt, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function RunningChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 6" stroke={t.grid} vertical horizontal />
          <XAxis
            dataKey="month"
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: t.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={42}
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
          <Line
            type="monotone"
            dataKey="value"
            name="Tempo 1km (s)"
            stroke={t.stroke}
            strokeWidth={2.5}
            strokeDasharray="0"
            dot={{ fill: t.stroke, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: t.stroke, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function AbsBarChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barTech" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.bar} stopOpacity={1} />
              <stop offset="100%" stopColor={t.bar} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 6" stroke={t.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: t.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip contentStyle={t.tooltip} cursor={{ fill: 'rgba(61,90,128,0.06)' }} />
          <Bar
            dataKey="value"
            name="Média abdominais"
            fill="url(#barTech)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function PlankAreaChart({ data }: { data: ChartPoint[] }) {
  const t = useChartTheme()
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="plankFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.strokeAlt} stopOpacity={0.5} />
              <stop offset="100%" stopColor={t.strokeAlt} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 6" stroke={t.grid} vertical horizontal />
          <XAxis
            dataKey="month"
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: t.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: t.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={42}
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
              return [`${m}:${String(s).padStart(2, '0')}`, 'Prancha']
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Prancha (s)"
            stroke={t.strokeAlt}
            strokeWidth={2.5}
            fill="url(#plankFill)"
            dot={{ fill: t.strokeAlt, r: 3.5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function RadarMetrics({
  metrics,
}: {
  metrics: {
    label: string
    value: number
    max: number
  }[]
}) {
  const t = useChartTheme()
  const points = metrics.map((m, i) => {
    const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2
    const ratio = Math.min(m.value / m.max, 1)
    const r = 70 * ratio
    const cx = 100 + r * Math.cos(angle)
    const cy = 100 + r * Math.sin(angle)
    return {
      ...m,
      cx,
      cy,
      angle,
      labelX: 100 + 92 * Math.cos(angle),
      labelY: 100 + 92 * Math.sin(angle),
    }
  })

  const path =
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ') +
    ' Z'
  const grid = [0.25, 0.5, 0.75, 1].map(
    (scale) =>
      metrics
        .map((_, i) => {
          const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2
          const x = 100 + 70 * scale * Math.cos(angle)
          const y = 100 + 70 * scale * Math.sin(angle)
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
        })
        .join(' ') + ' Z',
  )

  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-full w-full max-w-[280px]">
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={t.stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={t.stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="radarSoft">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="72" fill="url(#radarGlow)" />
      {grid.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={t.radarGrid}
          strokeWidth="1"
          strokeDasharray={i === grid.length - 1 ? '0' : '3 3'}
        />
      ))}
      {points.map((p, i) => (
        <line
          key={i}
          x1={100}
          y1={100}
          x2={100 + 70 * Math.cos(p.angle)}
          y2={100 + 70 * Math.sin(p.angle)}
          stroke={t.radarGrid}
          strokeWidth="1"
        />
      ))}
      <path
        d={path}
        fill={`${t.stroke}33`}
        stroke={t.stroke}
        strokeWidth="2"
        filter="url(#radarSoft)"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.cx} cy={p.cy} r="5" fill={t.stroke} opacity="0.25" />
          <circle cx={p.cx} cy={p.cy} r="3" fill={t.stroke} />
          <text
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={t.tick}
            style={{
              fontSize: 9,
              fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.04em',
            }}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
