import type { Goal, Level, Place, Restriction, Sex, SplitType, WorkoutDay, WorkoutLog, WorkoutPlan, WorkoutSession } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}
/** Segunda-feira da semana de `d`. */
export const weekStart = (d: Date) => addDays(d, -((d.getDay() + 6) % 7))

export const DOW3 = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
export const DOW_FULL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
export const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export const GOAL_LABEL: Record<Goal, string> = { massa: 'Ganhar massa', peso: 'Perder peso', manter: 'Manter' }
export const LEVEL_LABEL: Record<Level, string> = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }
export const PLACE_LABEL: Record<Place, string> = { academia: 'Academia', casa: 'Casa' }
export const SEX_SHORT: Record<Sex, string> = { masculino: 'Masc.', feminino: 'Fem.', outro: 'Outro' }
export const RESTRICTION_LABEL: Record<Restriction, string> = { ombros: 'Ombros', joelhos: 'Joelhos', lombar: 'Lombar', punhos: 'Punhos' }
export const SPLIT_LABEL: Record<SplitType, string> = {
  'corpo-inteiro': 'Corpo inteiro',
  'superior-inferior': 'Superior / Inferior',
  'empurrar-puxar-pernas': 'Empurrar / Puxar / Pernas',
}

export const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
export const clock = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

export function sessionStats(session: WorkoutSession, logs: WorkoutLog[]) {
  const own = logs.filter((l) => l.sessionId === session.id)
  const end = session.finishedAt ?? Date.now()
  return {
    sets: own.length,
    volume: own.reduce((s, l) => s + l.weightKg * l.reps, 0),
    minutes: Math.max(1, Math.round((end - session.startedAt) / 60000)),
  }
}

export const finished = (sessions: WorkoutSession[]) => sessions.filter((s) => s.finishedAt)

/**
 * Sequência de dias treinados sem falhar: conta os dias com treino concluído,
 * voltando no tempo até encontrar um dia previsto no plano que ficou sem treino.
 * Dias de descanso não quebram a sequência.
 */
export function streak(sessions: WorkoutSession[], days: WorkoutDay[], plan: WorkoutPlan | null, today = new Date()): number {
  const trained = new Set(finished(sessions).map((s) => s.date))
  if (!trained.size) return 0
  const scheduled = new Set(days.map((d) => d.weekday))
  const planStart = plan ? ymd(new Date(plan.createdAt)) : ymd(today)
  const first = [...trained].sort()[0]
  const todayKey = ymd(today)
  let count = 0
  for (let i = 0; i < 730; i++) {
    const d = addDays(today, -i)
    const key = ymd(d)
    if (key < first) break
    if (trained.has(key)) count++
    else if (key !== todayKey && key > planStart && scheduled.has(d.getDay())) break
  }
  return count
}
