import type { Assessment, BilateralMobility, CompensationLevel, MobilityScore, YesNo } from '../types'
import {
  COMPENSATION_LABEL,
  PARQ_QUESTIONS,
  parQRisk,
} from '../lib/assessment'

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950'

function CompensationSelect({
  value,
  onChange,
}: {
  value: CompensationLevel | ''
  onChange: (v: CompensationLevel | '') => void
}) {
  return (
    <select
      className={field}
      value={value}
      onChange={(e) => onChange(e.target.value as CompensationLevel | '')}
    >
      <option value="">—</option>
      <option value="normal">{COMPENSATION_LABEL.normal}</option>
      <option value="leves">{COMPENSATION_LABEL.leves}</option>
      <option value="importantes">{COMPENSATION_LABEL.importantes}</option>
    </select>
  )
}

function YesNoButtons({
  value,
  onChange,
}: {
  value: YesNo
  onChange: (v: YesNo) => void
}) {
  return (
    <div className="flex gap-1.5">
      {(['nao', 'sim'] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            'rounded-lg px-3 py-1.5 text-xs font-bold',
            value === opt
              ? opt === 'sim'
                ? 'bg-[#b33a3a] text-white'
                : 'bg-emerald-600 text-white'
              : 'border border-slate-200 text-ink-muted dark:border-slate-700',
          ].join(' ')}
        >
          {opt === 'sim' ? 'Sim' : 'Não'}
        </button>
      ))}
    </div>
  )
}

function MobilityBlock({
  title,
  value,
  onChange,
}: {
  title: string
  value: MobilityScore
  onChange: (v: MobilityScore) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          {title} — classificação
        </span>
        <CompensationSelect
          value={value.classification}
          onChange={(classification) => onChange({ ...value, classification })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Observações
        </span>
        <input
          className={field}
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
        />
      </label>
    </div>
  )
}

function BilateralBlock({
  title,
  value,
  onChange,
}: {
  title: string
  value: BilateralMobility
  onChange: (v: BilateralMobility) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <p className="sm:col-span-3 text-sm font-semibold text-ink">{title}</p>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Esquerdo
        </span>
        <CompensationSelect
          value={value.left}
          onChange={(left) => onChange({ ...value, left })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Direito
        </span>
        <CompensationSelect
          value={value.right}
          onChange={(right) => onChange({ ...value, right })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Observações
        </span>
        <input
          className={field}
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
        />
      </label>
    </div>
  )
}

export function AssessmentForm({
  value,
  onChange,
}: {
  value: Assessment
  onChange: (next: Assessment) => void
}) {
  const risk = parQRisk(value.parQ)
  const patch = (partial: Partial<Assessment>) => onChange({ ...value, ...partial })

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 font-display text-base font-bold text-ink">
          PAR-Q
        </h3>
        <p className="mb-3 text-sm text-ink-muted">
          Questionário de prontidão para atividade física. Qualquer “Sim” indica
          encaminhamento médico antes do treino.
        </p>
        {risk && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            Há resposta positiva no PAR-Q. Avaliar contraindicação e liberação
            médica.
          </p>
        )}
        <ol className="space-y-3">
          {PARQ_QUESTIONS.map((q, i) => (
            <li
              key={q.key}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800"
            >
              <p className="text-sm text-ink">
                <span className="mr-1 font-mono text-xs text-ink-muted">
                  {i + 1}.
                </span>
                {q.text}
              </p>
              <YesNoButtons
                value={value.parQ[q.key]}
                onChange={(v) =>
                  patch({ parQ: { ...value.parQ, [q.key]: v } })
                }
              />
            </li>
          ))}
        </ol>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            Notas do PAR-Q
          </span>
          <textarea
            className={`${field} min-h-[72px]`}
            value={value.parQ.notes}
            onChange={(e) =>
              patch({ parQ: { ...value.parQ, notes: e.target.value } })
            }
          />
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Mobilidade e funcionalidade
          </h3>
          <p className="text-sm text-ink-muted">
            Classificação: normal, compensações leves ou compensações importantes.
          </p>
        </div>
        <MobilityBlock
          title="Agachamento profundo"
          value={value.deepSquat}
          onChange={(deepSquat) => patch({ deepSquat })}
        />
        <MobilityBlock
          title="Movimentos simples"
          value={value.simpleMovements}
          onChange={(simpleMovements) => patch({ simpleMovements })}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-base font-bold text-ink">
          Teste de mobilidade de ombro
        </h3>
        <BilateralBlock
          title="Flexão"
          value={value.shoulderFlexion}
          onChange={(shoulderFlexion) => patch({ shoulderFlexion })}
        />
        <BilateralBlock
          title="Rotação"
          value={value.shoulderRotation}
          onChange={(shoulderRotation) => patch({ shoulderRotation })}
        />
        <BilateralBlock
          title="Extensão"
          value={value.shoulderExtension}
          onChange={(shoulderExtension) => patch({ shoulderExtension })}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-base font-bold text-ink">
          Knee to Wall
        </h3>
        <p className="text-sm text-ink-muted">
          Distância em centímetros até o joelho tocar a parede.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Esquerdo (cm)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              className={field}
              value={value.kneeToWallLeftCm}
              onChange={(e) =>
                patch({ kneeToWallLeftCm: Number(e.target.value) })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Direito (cm)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              className={field}
              value={value.kneeToWallRightCm}
              onChange={(e) =>
                patch({ kneeToWallRightCm: Number(e.target.value) })
              }
            />
          </label>
        </div>
      </div>

      <BilateralBlock
        title="Elevação ativa da perna"
        value={value.activeLegRaise}
        onChange={(activeLegRaise) => patch({ activeLegRaise })}
      />

      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-ink">
          Equilíbrio unipodal
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Esquerdo (s)
            </span>
            <input
              type="number"
              min={0}
              className={field}
              value={value.unipedalLeftSec}
              onChange={(e) =>
                patch({ unipedalLeftSec: Number(e.target.value) })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Direito (s)
            </span>
            <input
              type="number"
              min={0}
              className={field}
              value={value.unipedalRightSec}
              onChange={(e) =>
                patch({ unipedalRightSec: Number(e.target.value) })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Observações
            </span>
            <input
              className={field}
              value={value.unipedalNotes}
              onChange={(e) => patch({ unipedalNotes: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-ink">
          Resistência
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Flexões de braço (máx.)
            </span>
            <input
              type="number"
              min={0}
              className={field}
              value={value.maxPushUps}
              onChange={(e) => patch({ maxPushUps: Number(e.target.value) })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Prancha (tempo máximo)
            </span>
            <input
              className={field}
              placeholder="mm:ss"
              value={value.plankMax}
              onChange={(e) => patch({ plankMax: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Elevação de quadril isométrica
            </span>
            <input
              className={field}
              placeholder="mm:ss"
              value={value.hipIsometric}
              onChange={(e) => patch({ hipIsometric: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-ink">
          Cardiorrespiratório
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              Corrida de 1 km
            </span>
            <input
              className={field}
              placeholder="mm:ss"
              value={value.run1km}
              onChange={(e) => patch({ run1km: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">
              HIIT intervalado
            </span>
            <input
              className={field}
              placeholder="Ex.: 8x 200 m / 60 s · FC média"
              value={value.hiitInterval}
              onChange={(e) => patch({ hiitInterval: e.target.value })}
            />
          </label>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-muted">
          Notas gerais da avaliação
        </span>
        <textarea
          className={`${field} min-h-[80px]`}
          value={value.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </label>
    </div>
  )
}
