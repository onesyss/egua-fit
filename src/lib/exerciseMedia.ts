export interface FreeExercise {
  id: string
  name: string
  force?: string | null
  level?: string
  mechanic?: string | null
  equipment?: string | null
  primaryMuscles?: string[]
  secondaryMuscles?: string[]
  instructions?: string[]
  category?: string
  images?: string[]
}

const JSON_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

/** Mapeia nomes comuns em PT-BR para termos do free-exercise-db */
const ALIASES: Record<string, string[]> = {
  'supino reto': ['bench press', 'barbell bench press', 'dumbbell bench press'],
  'supino inclinado': ['incline bench press', 'incline dumbbell'],
  'supino declinado': ['decline bench press'],
  crucifixo: ['dumbbell flyes', 'butterfly', 'pec deck'],
  'crucifixo reto': ['dumbbell flyes'],
  'mergulho/paralela': ['dips', 'chest dip', 'parallel bar'],
  mergulho: ['dips', 'chest dip'],
  paralela: ['dips'],
  'tríceps francês': ['lying triceps', 'skull crusher', 'french press', 'triceps extension'],
  'triceps frances': ['lying triceps', 'skull crusher'],
  'tríceps corda': ['cable triceps', 'rope pushdown', 'triceps pushdown'],
  'triceps corda': ['rope pushdown', 'cable triceps'],
  'tríceps pulley': ['triceps pushdown', 'cable pushdown'],
  'puxada frontal': ['lat pulldown', 'front lat', 'wide grip lat'],
  'remada curvada': ['bent over row', 'barbell row'],
  'rosca direta': ['barbell curl', 'standing barbell curl', 'bicep curl'],
  'agachamento livre': ['barbell squat', 'full squat', 'back squat'],
  'leg press': ['leg press'],
  'desenvolvimento': ['shoulder press', 'overhead press', 'military press'],
  'abdominal supra': ['crunch', 'sit-up', 'abdominal'],
  prancha: ['plank'],
}

let cache: FreeExercise[] | null = null
let loading: Promise<FreeExercise[]> | null = null

export async function loadExerciseDb(): Promise<FreeExercise[]> {
  if (cache) return cache
  if (loading) return loading

  loading = fetch(JSON_URL)
    .then(async (res) => {
      if (!res.ok) throw new Error('Falha ao carregar base de exercícios')
      const data = (await res.json()) as FreeExercise[]
      cache = data
      return data
    })
    .finally(() => {
      loading = null
    })

  return loading
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreMatch(query: string, exerciseName: string): number {
  const q = normalize(query)
  const n = normalize(exerciseName)
  if (!q || !n) return 0
  if (n === q) return 100
  if (n.includes(q) || q.includes(n)) return 80

  const qWords = q.split(' ').filter((w) => w.length > 2)
  const hits = qWords.filter((w) => n.includes(w)).length
  if (hits === 0) return 0
  return (hits / qWords.length) * 60
}

export function imageUrl(path: string): string {
  return `${IMAGE_BASE}${path}`
}

export async function findExerciseGuide(
  exerciseName: string,
): Promise<FreeExercise | null> {
  const db = await loadExerciseDb()
  const key = normalize(exerciseName)
  const aliases = ALIASES[exerciseName.toLowerCase()] ?? ALIASES[key] ?? []

  let best: FreeExercise | null = null
  let bestScore = 0

  for (const ex of db) {
    let s = scoreMatch(exerciseName, ex.name)

    for (const alias of aliases) {
      s = Math.max(s, scoreMatch(alias, ex.name) + 5)
    }

    // boost if primary muscle keywords match PT groups loosely
    if (s > bestScore) {
      bestScore = s
      best = ex
    }
  }

  return bestScore >= 40 ? best : null
}

export const EXERCISE_DB_CREDIT = {
  name: 'free-exercise-db',
  url: 'https://github.com/yuhonas/free-exercise-db',
}
