import { EXERCISE_BY_ID } from '../data/exercises'
import type { ProfileDraft, Restriction, SplitType, WorkoutDay, WorkoutDayExercise } from '../types'

const HOME_EQUIPMENT = new Set(['Peso corporal', 'Halteres', 'Halter'])

const AVOID: Record<Restriction, string[]> = {
  ombros: ['desenvolvimento-militar', 'desenvolvimento-halteres', 'mergulho', 'mergulho-banco', 'elevacao-frontal'],
  joelhos: ['agachamento-livre', 'afundo', 'agachamento-bulgaro', 'cadeira-extensora'],
  lombar: ['levantamento-terra', 'remada-curvada', 'stiff', 'agachamento-livre', 'desenvolvimento-militar'],
  punhos: ['flexao', 'triceps-testa', 'rosca-direta', 'mergulho', 'mergulho-banco'],
}

const COMPOUND = new Set([
  'supino-reto', 'supino-inclinado', 'flexao', 'barra-fixa', 'puxada-frontal',
  'remada-curvada', 'remada-unilateral', 'remada-baixa', 'levantamento-terra', 'desenvolvimento-halteres',
  'desenvolvimento-militar', 'mergulho', 'agachamento-livre', 'leg-press', 'afundo', 'agachamento-bulgaro',
  'elevacao-pelvica', 'stiff',
])

/** Cada vaga lista candidatos em ordem de preferência; os últimos servem de alternativa para treino em casa. */
interface Template {
  name: string
  slots: string[][]
}

const LOWER_A: string[][] = [
  ['agachamento-livre', 'agachamento-bulgaro'],
  ['leg-press', 'afundo'],
  ['stiff'],
  ['cadeira-extensora', 'afundo'],
  ['mesa-flexora'],
  ['panturrilha-em-pe'],
  ['prancha'],
  ['abdominal-supra'],
  ['abdominal-infra'],
]
const LOWER_B: string[][] = [
  ['elevacao-pelvica', 'afundo'],
  ['levantamento-terra', 'agachamento-bulgaro'],
  ['afundo', 'agachamento-bulgaro'],
  ['cadeira-flexora'],
  ['panturrilha-sentado'],
  ['abdominal-polia', 'abdominal-supra'],
  ['elevacao-pernas', 'prancha'],
  ['abdominal-obliquo'],
]

const T: Record<string, Template> = {
  fullA: {
    name: 'Corpo inteiro A',
    slots: [
      ['agachamento-livre', 'agachamento-bulgaro'],
      ['supino-reto', 'flexao'],
      ['remada-curvada', 'remada-unilateral'],
      ['desenvolvimento-halteres', 'elevacao-lateral'],
      ['stiff', 'afundo'],
      ['prancha'],
      ['rosca-direta', 'rosca-alternada'],
    ],
  },
  fullB: {
    name: 'Corpo inteiro B',
    slots: [
      ['leg-press', 'afundo'],
      ['supino-inclinado'],
      ['puxada-frontal', 'barra-fixa'],
      ['elevacao-lateral'],
      ['mesa-flexora', 'agachamento-bulgaro'],
      ['abdominal-supra'],
      ['triceps-polia', 'triceps-frances'],
    ],
  },
  fullC: {
    name: 'Corpo inteiro C',
    slots: [
      ['afundo', 'leg-press'],
      ['crossover', 'crucifixo'],
      ['remada-baixa', 'remada-unilateral'],
      ['desenvolvimento-militar', 'desenvolvimento-halteres', 'elevacao-lateral'],
      ['elevacao-pelvica', 'agachamento-bulgaro'],
      ['elevacao-pernas', 'prancha'],
      ['rosca-martelo'],
    ],
  },
  upperA: {
    name: 'Superior A',
    slots: [
      ['supino-reto', 'supino-inclinado', 'flexao'],
      ['remada-curvada', 'remada-unilateral'],
      ['desenvolvimento-halteres', 'elevacao-lateral'],
      ['puxada-frontal', 'barra-fixa'],
      ['elevacao-lateral', 'elevacao-frontal'],
      ['triceps-polia', 'triceps-frances'],
      ['rosca-direta', 'rosca-alternada'],
    ],
  },
  upperB: {
    name: 'Superior B',
    slots: [
      ['puxada-frontal', 'barra-fixa'],
      ['supino-inclinado', 'flexao'],
      ['remada-baixa', 'remada-unilateral'],
      ['desenvolvimento-militar', 'desenvolvimento-halteres', 'elevacao-lateral'],
      ['rosca-alternada', 'rosca-scott'],
      ['triceps-testa', 'triceps-frances'],
      ['crucifixo-inverso', 'elevacao-lateral'],
    ],
  },
  lowerA: { name: 'Inferior A', slots: LOWER_A },
  lowerB: { name: 'Inferior B', slots: LOWER_B },
  pushA: {
    name: 'Empurrar A',
    slots: [
      ['supino-reto', 'flexao'],
      ['desenvolvimento-halteres', 'elevacao-lateral'],
      ['supino-inclinado'],
      ['elevacao-lateral', 'elevacao-frontal'],
      ['triceps-polia', 'triceps-frances'],
      ['crossover', 'crucifixo'],
      ['mergulho', 'mergulho-banco'],
    ],
  },
  pushB: {
    name: 'Empurrar B',
    slots: [
      ['desenvolvimento-militar', 'desenvolvimento-halteres', 'elevacao-lateral'],
      ['supino-inclinado', 'flexao'],
      ['peck-deck', 'crucifixo'],
      ['elevacao-lateral'],
      ['triceps-testa', 'triceps-frances'],
      ['elevacao-frontal', 'flexao'],
      ['mergulho', 'mergulho-banco'],
    ],
  },
  pullA: {
    name: 'Puxar A',
    slots: [
      ['levantamento-terra', 'barra-fixa'],
      ['puxada-frontal', 'barra-fixa'],
      ['remada-curvada', 'remada-unilateral'],
      ['crucifixo-inverso'],
      ['rosca-direta', 'rosca-alternada'],
      ['rosca-martelo'],
      ['remada-baixa'],
    ],
  },
  pullB: {
    name: 'Puxar B',
    slots: [
      ['barra-fixa', 'puxada-frontal'],
      ['remada-baixa', 'remada-unilateral'],
      ['puxada-frontal'],
      ['crucifixo-inverso'],
      ['rosca-scott', 'rosca-alternada'],
      ['rosca-martelo'],
      ['remada-unilateral'],
    ],
  },
  legsA: { name: 'Pernas A', slots: LOWER_A },
  legsB: { name: 'Pernas B', slots: LOWER_B },
}

/** Divisão por número de dias: [modelo, dia da semana (0 = domingo)]. */
const SCHEDULE: Record<number, { split: SplitType; days: [string, number][] }> = {
  2: { split: 'corpo-inteiro', days: [['fullA', 1], ['fullB', 4]] },
  3: { split: 'corpo-inteiro', days: [['fullA', 1], ['fullB', 3], ['fullC', 5]] },
  4: { split: 'superior-inferior', days: [['upperA', 1], ['lowerA', 2], ['upperB', 4], ['lowerB', 5]] },
  5: {
    split: 'empurrar-puxar-pernas',
    days: [['pushA', 1], ['pullA', 2], ['legsA', 3], ['pushB', 5], ['pullB', 6]],
  },
  6: {
    split: 'empurrar-puxar-pernas',
    days: [['pushA', 1], ['pullA', 2], ['legsA', 3], ['pushB', 4], ['pullB', 5], ['legsB', 6]],
  },
}

export const SPLIT_SUGGESTION: Record<number, [string, string]> = {
  2: ['Corpo inteiro A/B', 'Dois treinos de corpo inteiro, cada grupo muscular duas vezes por semana.'],
  3: ['Corpo inteiro A/B/C', 'Três treinos de corpo inteiro com ênfases diferentes.'],
  4: ['Superior / Inferior', 'Dois treinos de membros superiores e dois de inferiores, com descanso entre eles.'],
  5: ['Empurrar / Puxar / Pernas', 'Cinco treinos na sequência empurrar, puxar e pernas, com um dia de descanso no meio.'],
  6: ['Empurrar / Puxar / Pernas (2x)', 'A sequência completa repetida duas vezes na semana.'],
}

function prescription(id: string, p: ProfileDraft): Omit<WorkoutDayExercise, 'exerciseId'> {
  const compound = COMPOUND.has(id)
  const sets = p.level === 'iniciante' ? 3 : p.level === 'avancado' ? 4 : compound ? 4 : 3
  if (id === 'prancha') return { sets: 3, reps: '30 a 45 s', restSeconds: 45 }
  if (p.goal === 'peso') return { sets, reps: '12 a 15', restSeconds: 45 }
  if (p.goal === 'manter') return { sets, reps: '10 a 12', restSeconds: 60 }
  return compound ? { sets, reps: '8 a 10', restSeconds: 90 } : { sets, reps: '10 a 12', restSeconds: 60 }
}

export function profileSignature(p: ProfileDraft): string {
  return [p.level, p.goal, p.daysPerWeek, p.location, [...p.restrictions].sort().join('+')].join('|')
}

export function buildPlan(p: ProfileDraft): { splitType: SplitType; days: Omit<WorkoutDay, 'id' | 'planId'>[] } {
  const schedule = SCHEDULE[p.daysPerWeek] ?? SCHEDULE[4]
  const perDay = p.level === 'iniciante' ? 5 : p.level === 'avancado' ? 7 : 6
  const blocked = new Set(p.restrictions.flatMap((r) => AVOID[r]))
  const available = (id: string) => p.location === 'academia' || HOME_EQUIPMENT.has(EXERCISE_BY_ID[id].equipment)

  const days = schedule.days.map(([key, weekday]) => {
    const tpl = T[key]
    const picked: string[] = []
    for (const slot of tpl.slots) {
      if (picked.length >= perDay) break
      const free = slot.filter((id) => available(id) && !picked.includes(id))
      // Respeita as restrições; se não sobrar alternativa no local escolhido, mantém o exercício da vaga.
      const choice = free.find((id) => !blocked.has(id)) ?? free[0]
      if (choice) picked.push(choice)
    }
    return {
      name: tpl.name,
      weekday,
      exercises: picked.map((id) => ({ exerciseId: id, ...prescription(id, p) })),
    }
  })
  return { splitType: schedule.split, days }
}

/** "Quadríceps, posteriores, panturrilha": os grupos do dia, na ordem em que aparecem. */
export function dayFocus(day: Pick<WorkoutDay, 'exercises'>, max = 3): string {
  const groups: string[] = []
  for (const e of day.exercises) {
    const g = EXERCISE_BY_ID[e.exerciseId]?.muscleGroup
    if (g && !groups.includes(g)) groups.push(g)
  }
  return groups
    .slice(0, max)
    .map((g, i) => (i ? g.toLowerCase() : g))
    .join(', ')
}

export function estimateMinutes(day: Pick<WorkoutDay, 'exercises'>): number {
  const seconds = day.exercises.reduce((s, e) => s + e.sets * (e.restSeconds + 45) + 60, 0)
  return Math.max(5, Math.round(seconds / 60 / 5) * 5)
}
