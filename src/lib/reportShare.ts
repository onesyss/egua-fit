import type { StudentRecord } from '../types'
import {
  bilateralLabel,
  compensationLabel,
  parQRisk,
  PARQ_QUESTIONS,
} from './assessment'
import { bmi, formatDuration, formatExerciseDose, musclesWorked, programVolumeKg } from './training'
import { formatDate } from '../data/mock'

const experienceLabel = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

function line(label: string, value: string | number | undefined | null) {
  if (value === undefined || value === null || value === '' || value === 0) return ''
  return `${label}: ${value}`
}

export function digitsPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('55')) return digits
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())
}

export function buildProtocolMessage(record: StudentRecord, extraNote = ''): string {
  const { student, anamnesis, history } = record
  const emitted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const parts: string[] = [
    `Égua Fit — Protocolo de ${student.name}`,
    `Emitido em ${emitted}`,
  ]

  if (extraNote.trim()) {
    parts.push('', extraNote.trim())
  }

  parts.push(
    '',
    '*Prescrição*',
    line('Foco', anamnesis.trainingFocus),
    anamnesis.weeklyStructure ? anamnesis.weeklyStructure : '',
    line('Métodos', anamnesis.methods),
    line('Progressão', anamnesis.progression),
  )

  if (anamnesis.notes) {
    parts.push('', `Notas: ${anamnesis.notes}`)
  }

  if (history.length) {
    parts.push('', '*Treinos salvos*')
    history.forEach((s, i) => {
      parts.push(
        `T${i + 1} · ${formatDate(s.date.slice(0, 10))} · ${s.volumeKg.toLocaleString('pt-BR')} kg${
          s.volumeChangePercent
            ? ` (${s.volumeChangePercent > 0 ? '+' : ''}${s.volumeChangePercent}%)`
            : ''
        } · sessão ${formatDuration(s.sessionDurationSec)} · trabalho ${formatDuration(s.workDurationSec)}`,
      )
    })
    parts.push('', 'Gráficos completos: imprima a tela de protocolo em PDF.')
  } else {
    parts.push('', 'Ainda não há treinos salvos no histórico.')
  }

  parts.push('', '— Égua Fit')
  return parts.filter((p) => p !== undefined).join('\n').replace(/\n{3,}/g, '\n\n')
}

export function buildReportMessage(record: StudentRecord, extraNote = ''): string {
  const { student, anamnesis, assessment, exercises, metrics, history, personalRecords } =
    record
  const imc = bmi(anamnesis.weightKg, anamnesis.heightCm)
  const volume = programVolumeKg(exercises)
  const muscles = musclesWorked(exercises)
  const last = history[history.length - 1]
  const emitted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const parqStatus = parQRisk(assessment.parQ)
    ? 'Atenção: há resposta positiva (avaliar liberação médica)'
    : PARQ_QUESTIONS.every((q) => assessment.parQ[q.key] === 'nao')
      ? 'Sem respostas positivas'
      : 'Incompleto'

  const parts: string[] = [
    `Égua Fit — Relatório de ${student.name}`,
    `Emitido em ${emitted}`,
  ]

  if (extraNote.trim()) {
    parts.push('', extraNote.trim())
  }

  parts.push(
    '',
    '*Anamnese*',
    line('Objetivo', anamnesis.goal),
    line('Experiência', experienceLabel[anamnesis.experience]),
    line('Lesões', anamnesis.injuries),
    line('Limitações', anamnesis.limitations),
    line(
      'Peso / altura / IMC',
      anamnesis.weightKg
        ? `${anamnesis.weightKg} kg · ${anamnesis.heightCm} cm${imc ? ` · IMC ${imc}` : ''}`
        : '',
    ),
    line('Disponibilidade', `${anamnesis.availabilityPerWeek}x / semana`),
    '',
    '*Testes / Avaliação*',
    line('PAR-Q', parqStatus),
    line(
      'Agachamento profundo',
      compensationLabel(assessment.deepSquat.classification) || assessment.deepSquat.notes,
    ),
    line(
      'Movimentos simples',
      compensationLabel(assessment.simpleMovements.classification),
    ),
    line('Ombro flexão', bilateralLabel(assessment.shoulderFlexion)),
    line('Ombro rotação', bilateralLabel(assessment.shoulderRotation)),
    line('Ombro extensão', bilateralLabel(assessment.shoulderExtension)),
    line(
      'Knee to Wall',
      assessment.kneeToWallLeftCm || assessment.kneeToWallRightCm
        ? `E ${assessment.kneeToWallLeftCm} cm · D ${assessment.kneeToWallRightCm} cm`
        : '',
    ),
    line('Elevação ativa da perna', bilateralLabel(assessment.activeLegRaise)),
    line(
      'Equilíbrio unipodal',
      assessment.unipedalLeftSec || assessment.unipedalRightSec
        ? `E ${assessment.unipedalLeftSec}s · D ${assessment.unipedalRightSec}s`
        : '',
    ),
    line('Flexões máx.', assessment.maxPushUps || ''),
    line('Prancha', assessment.plankMax),
    line('Quadril isométrico', assessment.hipIsometric),
    line('Corrida 1 km', assessment.run1km),
    line('HIIT intervalado', assessment.hiitInterval),
    '',
    '*Protocolo*',
    line('Foco', anamnesis.trainingFocus),
    anamnesis.weeklyStructure ? anamnesis.weeklyStructure : '',
    line('Métodos', anamnesis.methods),
    line('Progressão', anamnesis.progression),
    '',
    '*Treino atual*',
    `Carga levantada: ${volume.toLocaleString('pt-BR')} kg · ${metrics.totalExercises} exercícios · ${metrics.acPercent}% de conclusão`,
  )

  if (muscles.length) {
    parts.push(
      `Músculos: ${muscles.map((m) => `${m.group} ${Math.round(m.volumeKg)}kg`).join(' · ')}`,
    )
  }

  if (exercises.length) {
    parts.push(
      ...exercises.map(
        (e) =>
          `- ${e.name} (${e.muscleGroup}): ${formatExerciseDose(e)}${
            e.muscleGroup !== 'Cardio' && e.currentWeight > 0
              ? ` @ ${e.currentWeight}kg`
              : ''
          }`,
      ),
    )
  }

  const prs = personalRecords.filter((r) => r.weight > 0)
  if (prs.length) {
    parts.push('', '*Recordes*', ...prs.map((pr) => `- ${pr.exerciseName}: ${pr.weight} kg`))
  }

  if (last) {
    parts.push(
      '',
      `Última sessão: ${formatDate(last.date.slice(0, 10))} · ${last.volumeKg.toLocaleString('pt-BR')} kg${
        last.volumeChangePercent
          ? ` (${last.volumeChangePercent > 0 ? '+' : ''}${last.volumeChangePercent}%)`
          : ''
      } · sessão ${formatDuration(last.sessionDurationSec)} · trabalho ${formatDuration(last.workDurationSec)}`,
    )
  }

  parts.push('', '— Égua Fit')
  return parts.filter((p) => p !== undefined).join('\n').replace(/\n{3,}/g, '\n\n')
}

export function whatsappHref(phone: string, text: string): string | null {
  const digits = digitsPhone(phone)
  if (digits.length < 12) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function mailtoHref(
  email: string,
  studentName: string,
  text: string,
  subjectOverride?: string,
): string | null {
  const to = email.trim()
  if (!isValidEmail(to)) return null
  const subject = encodeURIComponent(
    subjectOverride ?? `Égua Fit — Relatório de ${studentName}`,
  )
  const body = encodeURIComponent(text)
  return `mailto:${to}?subject=${subject}&body=${body}`
}
