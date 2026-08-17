import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useGym } from '../context/DataContext'
import { formatDate } from '../data/mock'
import {
  bmi,
  colorForStudent,
  formatDuration,
  formatExerciseDose,
  musclesWorked,
  programVolumeKg,
} from '../lib/training'
import {
  bilateralLabel,
  compensationLabel,
  parQRisk,
  PARQ_QUESTIONS,
} from '../lib/assessment'
import { StudentAvatar, StudentName } from '../components/StudentIdentity'
import { ReportShare } from '../components/ReportShare'

const experienceLabel = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

function Row({ label, value }: { label: string; value: string | number }) {
  if (value === '' || value === 0) return null
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-sm dark:border-slate-800">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}

export function ReportPage() {
  const { studentId } = useParams()
  const { students, setActiveId, updateStudent } = useGym()
  const record = students.find((s) => s.student.id === studentId)

  useEffect(() => {
    if (studentId) setActiveId(studentId)
  }, [studentId, setActiveId])

  if (!record) return <Navigate to="/" replace />

  const { student, anamnesis, assessment, exercises, metrics, history, personalRecords } =
    record
  const color = colorForStudent(student)
  const imc = bmi(anamnesis.weightKg, anamnesis.heightCm)
  const volume = programVolumeKg(exercises)
  const muscles = musclesWorked(exercises)
  const last = history[history.length - 1]
  const prs = personalRecords.filter((r) => r.weight > 0)

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/aluno/${student.id}/protocolo`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 px-2.5 py-1.5 text-sm text-ink-muted hover:bg-brand-50 dark:border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Protocolo
          </Link>
          <StudentName
            student={student}
            as="h1"
            className="font-display text-2xl font-bold"
          />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2c4566] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Printer className="h-4 w-4" />
          Imprimir / PDF
        </button>
      </div>

      <ReportShare
        record={record}
        onSaveContact={(patch) => updateStudent(patch, student.id)}
      />

      <article className="print-sheet rounded-2xl border border-brand-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <header className="mb-6 flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: color }}>
          <div className="flex items-center gap-3">
            <StudentAvatar student={student} size="lg" />
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                Égua Fit · relatório personalizado
              </p>
              <StudentName
                student={student}
                as="h2"
                className="font-display text-2xl font-bold"
              />
              <p className="text-sm text-ink-muted">
                Matrícula {formatDate(student.enrollmentDate)} ·{' '}
                {student.daysAccompanied} dias acompanhados
              </p>
            </div>
          </div>
          <p className="text-right text-xs text-ink-muted">
            Emitido em{' '}
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </header>

        <section className="mb-6">
          <h3 className="mb-2 font-display text-lg font-bold text-ink">
            Anamnese
          </h3>
          <Row label="Objetivo" value={anamnesis.goal} />
          <Row
            label="Experiência"
            value={experienceLabel[anamnesis.experience]}
          />
          <Row label="Ocupação" value={anamnesis.occupation} />
          <Row label="Lesões" value={anamnesis.injuries} />
          <Row label="Limitações" value={anamnesis.limitations} />
          <Row label="Sono" value={anamnesis.sleepHours ? `${anamnesis.sleepHours} h` : ''} />
          <Row label="Estresse" value={anamnesis.stress} />
          <Row
            label="Peso / altura / IMC"
            value={
              anamnesis.weightKg
                ? `${anamnesis.weightKg} kg · ${anamnesis.heightCm} cm${imc ? ` · IMC ${imc}` : ''}`
                : ''
            }
          />
          <Row
            label="Gordura corporal"
            value={anamnesis.bodyFat ? `${anamnesis.bodyFat}%` : ''}
          />
          <Row label="Pressão arterial" value={anamnesis.bloodPressure} />
          <Row
            label="FC repouso"
            value={anamnesis.restingHr ? `${anamnesis.restingHr} bpm` : ''}
          />
          <Row
            label="Disponibilidade"
            value={`${anamnesis.availabilityPerWeek}x / semana`}
          />
          {anamnesis.medicalNotes && (
            <p className="mt-2 text-sm text-ink">{anamnesis.medicalNotes}</p>
          )}
        </section>

        <section className="mb-6">
          <h3 className="mb-2 font-display text-lg font-bold text-ink">
            Testes / Avaliação
          </h3>
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            PAR-Q
          </p>
          {parQRisk(assessment.parQ) ? (
            <p className="mb-2 text-sm font-semibold text-red-600">
              Há resposta positiva — avaliar liberação médica.
            </p>
          ) : PARQ_QUESTIONS.every((q) => assessment.parQ[q.key] === 'nao') ? (
            <p className="mb-2 text-sm text-emerald-700">
              Sem respostas positivas no PAR-Q.
            </p>
          ) : (
            <p className="mb-2 text-sm text-ink-muted">PAR-Q ainda incompleto.</p>
          )}
          {PARQ_QUESTIONS.map((q, i) => (
            <Row
              key={q.key}
              label={`${i + 1}. ${q.text}`}
              value={compensationLabel(assessment.parQ[q.key])}
            />
          ))}
          {assessment.parQ.notes && (
            <p className="mt-2 text-sm text-ink">{assessment.parQ.notes}</p>
          )}

          <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Mobilidade e funcionalidade
          </p>
          <Row
            label="Agachamento profundo"
            value={
              compensationLabel(assessment.deepSquat.classification) +
              (assessment.deepSquat.notes ? ` — ${assessment.deepSquat.notes}` : '')
            }
          />
          <Row
            label="Movimentos simples"
            value={
              compensationLabel(assessment.simpleMovements.classification) +
              (assessment.simpleMovements.notes
                ? ` — ${assessment.simpleMovements.notes}`
                : '')
            }
          />
          <Row
            label="Ombro — flexão"
            value={bilateralLabel(assessment.shoulderFlexion)}
          />
          <Row
            label="Ombro — rotação"
            value={bilateralLabel(assessment.shoulderRotation)}
          />
          <Row
            label="Ombro — extensão"
            value={bilateralLabel(assessment.shoulderExtension)}
          />
          <Row
            label="Knee to Wall"
            value={
              assessment.kneeToWallLeftCm || assessment.kneeToWallRightCm
                ? `E ${assessment.kneeToWallLeftCm} cm · D ${assessment.kneeToWallRightCm} cm`
                : ''
            }
          />
          <Row
            label="Elevação ativa da perna"
            value={bilateralLabel(assessment.activeLegRaise)}
          />
          <Row
            label="Equilíbrio unipodal"
            value={
              assessment.unipedalLeftSec || assessment.unipedalRightSec
                ? `E ${assessment.unipedalLeftSec}s · D ${assessment.unipedalRightSec}s${
                    assessment.unipedalNotes
                      ? ` — ${assessment.unipedalNotes}`
                      : ''
                  }`
                : assessment.unipedalNotes
            }
          />

          <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Resistência
          </p>
          <Row
            label="Flexões de braço (máx.)"
            value={assessment.maxPushUps || ''}
          />
          <Row label="Prancha (tempo máximo)" value={assessment.plankMax} />
          <Row
            label="Elevação de quadril isométrica"
            value={assessment.hipIsometric}
          />

          <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Cardiorrespiratório
          </p>
          <Row label="Corrida de 1 km" value={assessment.run1km} />
          <Row label="HIIT intervalado" value={assessment.hiitInterval} />
          {assessment.notes && (
            <p className="mt-2 text-sm text-ink">{assessment.notes}</p>
          )}
        </section>

        <section className="mb-6">
          <h3 className="mb-2 font-display text-lg font-bold text-ink">
            Protocolo prescrito
          </h3>
          <Row label="Foco" value={anamnesis.trainingFocus} />
          {anamnesis.weeklyStructure && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
              {anamnesis.weeklyStructure}
            </p>
          )}
          {anamnesis.methods && (
            <p className="mt-2 text-sm">
              <span className="text-ink-muted">Métodos: </span>
              {anamnesis.methods}
            </p>
          )}
          {anamnesis.progression && (
            <p className="mt-2 text-sm">
              <span className="text-ink-muted">Progressão: </span>
              {anamnesis.progression}
            </p>
          )}
          {anamnesis.notes && (
            <p className="mt-2 text-sm text-ink">{anamnesis.notes}</p>
          )}
        </section>

        <section className="mb-6">
          <h3 className="mb-2 font-display text-lg font-bold text-ink">
            Treino atual
          </h3>
          <p className="mb-3 text-sm text-ink-muted">
            Carga levantada{' '}
            <strong className="text-ink">
              {volume.toLocaleString('pt-BR')} kg
            </strong>
            {' · '}
            {metrics.totalExercises} exercícios · {metrics.totalSets} séries ·{' '}
            {metrics.acPercent}% de conclusão
          </p>
          <ul className="mb-3 flex flex-wrap gap-2">
            {muscles.map((m) => (
              <li
                key={m.group}
                className="rounded-full border border-brand-100 px-2.5 py-1 text-xs font-semibold dark:border-slate-700"
              >
                {m.group} · {Math.round(m.volumeKg)} kg
              </li>
            ))}
          </ul>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] tracking-wider text-ink-muted uppercase">
                <th className="py-2">Exercício</th>
                <th className="py-2 text-center">Séries / min</th>
                <th className="py-2 text-center">Reps</th>
                <th className="py-2 text-right">Carga</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 dark:border-slate-800">
                  <td className="py-1.5">
                    {e.name}{' '}
                    <span className="text-ink-muted">({e.muscleGroup})</span>
                  </td>
                  <td className="py-1.5 text-center">
                    {e.muscleGroup === 'Cardio' ? formatExerciseDose(e) : e.sets}
                  </td>
                  <td className="py-1.5 text-center">
                    {e.muscleGroup === 'Cardio' ? '—' : `${e.repsDone}/${e.reps}`}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {e.currentWeight > 0 ? `${e.currentWeight} kg` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {prs.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-2 font-display text-lg font-bold text-ink">
              Recordes pessoais
            </h3>
            <ul className="grid gap-1 sm:grid-cols-2">
              {prs.map((pr) => (
                <li key={pr.exerciseName} className="text-sm">
                  <strong>{pr.exerciseName}</strong> · {pr.weight} kg
                </li>
              ))}
            </ul>
          </section>
        )}

        {last && (
          <section>
            <h3 className="mb-2 font-display text-lg font-bold text-ink">
              Última sessão salva
            </h3>
            <p className="text-sm text-ink-muted">
              {formatDate(last.date.slice(0, 10))} ·{' '}
              {last.volumeKg.toLocaleString('pt-BR')} kg
              {last.volumeChangePercent
                ? ` (${last.volumeChangePercent > 0 ? '+' : ''}${last.volumeChangePercent}%)`
                : ''}
              {' · sessão '}
              {formatDuration(last.sessionDurationSec)}
              {' · trabalho '}
              {formatDuration(last.workDurationSec)}
            </p>
          </section>
        )}
      </article>
    </div>
  )
}
