import type { Student } from '../types'
import { colorForStudent } from '../lib/training'

const sizes = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-12 w-12 text-sm',
  lg: 'h-14 w-14 text-base',
}

export function StudentAvatar({
  student,
  size = 'md',
}: {
  student: Pick<Student, 'id' | 'color' | 'avatarInitials' | 'name'>
  size?: keyof typeof sizes
}) {
  const color = colorForStudent(student)
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-mono font-bold text-white shadow-sm ${sizes[size]}`}
      style={{ backgroundColor: color }}
      title={student.name}
    >
      {student.avatarInitials}
    </div>
  )
}

export function StudentName({
  student,
  className = '',
  as: Tag = 'span',
}: {
  student: Pick<Student, 'id' | 'color' | 'name'>
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'p'
}) {
  const color = colorForStudent(student)
  return (
    <Tag className={className} style={{ color }}>
      {student.name}
    </Tag>
  )
}

export function StudentColorMark({
  student,
}: {
  student: Pick<Student, 'id' | 'color'>
}) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: colorForStudent(student) }}
    />
  )
}
