import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import heroDuoDark from '../assets/login-hero-duo.png'
import heroDuoLight from '../assets/login-hero-duo-light.png'
import heroManDark from '../assets/login-hero-man.png'
import heroManLight from '../assets/login-hero-man-light.png'
import heroManBlackDark from '../assets/login-hero-man-black.png'
import heroManBlackLight from '../assets/login-hero-man-black-light.png'
import heroWomanDark from '../assets/login-hero-woman.png'
import heroWomanLight from '../assets/login-hero-woman-light.png'
import heroWomanBlackDark from '../assets/login-hero-woman-black.png'
import heroWomanBlackLight from '../assets/login-hero-woman-black-light.png'

const slides = [
  { dark: heroManDark, light: heroManLight },
  { dark: heroWomanBlackDark, light: heroWomanBlackLight },
  { dark: heroWomanDark, light: heroWomanLight },
  { dark: heroManBlackDark, light: heroManBlackLight },
  { dark: heroDuoDark, light: heroDuoLight },
] as const

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

export function LoginHeroVisual({ greeting }: { greeting: string }) {
  const { resolved } = useTheme()
  const light = resolved === 'light'
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(id)
  }, [reduced])

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden ${
        light ? 'bg-[#eef1f5]' : 'bg-[#0c121c]'
      }`}
    >
      {slides.map((slide, i) => {
        const src = light ? slide.light : slide.dark
        return (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-contain object-top ${
              i === index ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-1000`}
          />
        )
      })}
      <div
        className={`absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t to-transparent ${
          light ? 'from-white/92' : 'from-[#070b12]/90'
        }`}
      />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <div className="login-bar mb-4 h-1 rounded-full bg-gradient-to-r from-[#b33a3a] to-[#2c4566]" />
        <h1
          className={`font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl ${
            light ? 'text-ink' : 'text-white'
          }`}
        >
          {greeting},
          <span className="mt-1 block bg-gradient-to-r from-[#2c4566] to-[#b33a3a] bg-clip-text text-transparent">
            personal
          </span>
        </h1>
        <p
          className={`mt-3 max-w-[16rem] text-sm font-semibold leading-snug ${
            light ? 'text-ink-muted' : 'text-white/80'
          }`}
        >
          O painel do treino. Força, evolução e protocolo.
        </p>
      </div>
    </div>
  )
}
