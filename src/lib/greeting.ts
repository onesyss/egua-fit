export function dayGreeting(date = new Date()): 'Bom dia' | 'Boa tarde' | 'Boa noite' {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function firstName(name?: string | null): string {
  if (!name?.trim()) return ''
  return name.trim().split(/\s+/)[0] ?? ''
}

export function greetPerson(name?: string | null): string {
  const greeting = dayGreeting()
  const person = firstName(name)
  return person ? `${greeting}, ${person}` : greeting
}
