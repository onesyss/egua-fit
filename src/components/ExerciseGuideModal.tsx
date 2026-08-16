import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, X, Play } from 'lucide-react'
import {
  EXERCISE_DB_CREDIT,
  findExerciseGuide,
  imageUrl,
  type FreeExercise,
} from '../lib/exerciseMedia'

interface ExerciseGuideModalProps {
  exerciseName: string
  muscleGroup?: string
  onClose: () => void
}

export function ExerciseGuideModal({
  exerciseName,
  muscleGroup,
  onClose,
}: ExerciseGuideModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guide, setGuide] = useState<FreeExercise | null>(null)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    setGuide(null)

    findExerciseGuide(exerciseName)
      .then((ex) => {
        if (!alive) return
        setGuide(ex)
        if (!ex) setError('Não encontramos demonstração para este exercício.')
      })
      .catch(() => {
        if (!alive) return
        setError('Erro ao carregar a base de exercícios. Verifique a conexão.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [exerciseName])

  // Alterna fotos 0/1 como animação simples (dataset traz inicio/fim do movimento)
  useEffect(() => {
    if (!guide?.images || guide.images.length < 2) return
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % guide.images!.length)
    }, 900)
    return () => window.clearInterval(id)
  }, [guide])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const imgs = guide?.images ?? []
  const currentImg = imgs[frame] ? imageUrl(imgs[frame]) : null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="tech-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto p-0 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-brand-100/80 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-5">
          <div>
            <p className="tech-label text-brand-600 dark:text-brand-300">
              execução correta
            </p>
            <h2
              id="guide-title"
              className="font-display text-xl font-bold text-ink sm:text-2xl"
            >
              {exerciseName}
            </h2>
            {muscleGroup && (
              <p className="mt-0.5 text-sm text-ink-muted">{muscleGroup}</p>
            )}
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

        <div className="space-y-4 p-4 sm:p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              <p className="text-sm">Carregando demonstração…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center dark:border-amber-900 dark:bg-amber-950/40">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {error}
              </p>
              <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-200/70">
                A base em inglês nem sempre tem o nome exato em PT-BR. Tente
                renomear o exercício (ex.: “Barbell Bench Press”) ou cadastre um
                nome mais genérico.
              </p>
            </div>
          )}

          {!loading && guide && (
            <>
              <div className="relative overflow-hidden rounded-xl border border-brand-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                {currentImg ? (
                  <img
                    key={currentImg}
                    src={currentImg}
                    alt={`Demonstração: ${guide.name}`}
                    className="mx-auto max-h-[320px] w-full object-contain"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-ink-muted">
                    Sem imagem
                  </div>
                )}
                {imgs.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-mono text-white">
                    <Play className="h-3 w-3" />
                    animação {frame + 1}/{imgs.length}
                  </div>
                )}
              </div>

              {imgs.length > 1 && (
                <div className="flex justify-center gap-2">
                  {imgs.map((path, i) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => setFrame(i)}
                      className={[
                        'h-14 w-14 overflow-hidden rounded-lg border-2',
                        i === frame
                          ? 'border-[#b33a3a]'
                          : 'border-transparent opacity-70 hover:opacity-100',
                      ].join(' ')}
                    >
                      <img
                        src={imageUrl(path)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                {guide.equipment && (
                  <span className="rounded-md bg-brand-50 px-2 py-1 font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-300">
                    Equipamento: {guide.equipment}
                  </span>
                )}
                {guide.level && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-ink-muted dark:bg-slate-800">
                    Nível: {guide.level}
                  </span>
                )}
                {guide.primaryMuscles?.map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-[#b33a3a]/10 px-2 py-1 font-semibold text-[#b33a3a]"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {guide.name !== exerciseName && (
                <p className="text-xs text-ink-muted">
                  Correspondência na base:{' '}
                  <strong className="text-ink">{guide.name}</strong>
                </p>
              )}

              {guide.instructions && guide.instructions.length > 0 && (
                <div>
                  <h3 className="mb-2 font-display text-base font-bold text-ink">
                    Como executar
                  </h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                    {guide.instructions.map((step, i) => (
                      <li key={i} className="pl-1">
                        <span className="text-ink">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <p className="flex items-center gap-1.5 border-t border-brand-50 pt-3 text-[11px] text-ink-muted dark:border-slate-800">
                Dados e imagens:{' '}
                <a
                  href={EXERCISE_DB_CREDIT.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  {EXERCISE_DB_CREDIT.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
