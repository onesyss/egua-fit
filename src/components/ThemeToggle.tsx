import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemeMode } from '../context/ThemeContext'

const cycle: ThemeMode[] = ['light', 'dark', 'system']

const meta: Record<ThemeMode, { label: string; icon: typeof Sun }> = {
  light: { label: 'Modo claro', icon: Sun },
  dark: { label: 'Modo escuro', icon: Moon },
  system: { label: 'Automático (sistema)', icon: Monitor },
}

export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  const current = meta[mode]
  const Icon = current.icon

  const next = () => {
    const i = cycle.indexOf(mode)
    setMode(cycle[(i + 1) % cycle.length])
  }

  return (
    <button
      type="button"
      onClick={next}
      title={`${current.label} · clique para alternar`}
      aria-label={`${current.label}. Clique para alternar tema`}
      className="tech-icon-btn group"
    >
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-active:rotate-12" />
    </button>
  )
}
