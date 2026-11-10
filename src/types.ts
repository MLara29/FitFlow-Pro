export type Level = 'iniciante' | 'intermediario' | 'avancado'
export type Goal = 'massa' | 'peso' | 'manter'
export type Sex = 'masculino' | 'feminino' | 'outro'
export type Place = 'academia' | 'casa'
export type Restriction = 'ombros' | 'joelhos' | 'lombar' | 'punhos'
export type SplitType = 'corpo-inteiro' | 'superior-inferior' | 'empurrar-puxar-pernas'

export interface User {
  id: string
  name: string
  email: string
  passHash: string
}

export interface UserProfile {
  userId: string
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  level: Level
  goal: Goal
  daysPerWeek: number
  location: Place
  restrictions: Restriction[]
  restrictionsNote: string
}

export type ProfileDraft = Omit<UserProfile, 'userId'>

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  instructions: string[]
  /** GIF (ou imagem) da execução; é exibido em loop pelo próprio <img>. */
  mediaUrl: string
}

export interface WorkoutPlan {
  id: string
  userId: string
  splitType: SplitType
  active: boolean
  createdAt: string
  /** Assinatura do perfil usado na geração, para avisar quando o perfil mudar. */
  basedOn: string
}

export interface WorkoutDayExercise {
  exerciseId: string
  sets: number
  reps: string
  restSeconds: number
}

export interface WorkoutDay {
  id: string
  planId: string
  name: string
  /** 0 = domingo … 6 = sábado */
  weekday: number
  exercises: WorkoutDayExercise[]
}

export interface WorkoutLog {
  id: string
  userId: string
  /** ISO 8601 com hora */
  date: string
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  sessionId: string
}

/** Uma execução de um WorkoutDay; agrupa os logs e marca o treino como concluído. */
export interface WorkoutSession {
  id: string
  userId: string
  workoutDayId: string
  dayName: string
  /** AAAA-MM-DD (data local) */
  date: string
  startedAt: number
  finishedAt: number | null
}
