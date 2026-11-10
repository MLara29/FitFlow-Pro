import { useMemo, useSyncExternalStore } from 'react'
import { setExercises } from '../data/exercises'
import type { Exercise, ProfileDraft, User, UserProfile, WorkoutDay, WorkoutLog, WorkoutPlan, WorkoutSession } from '../types'
import { buildPlan, profileSignature } from './plan'
import { ymd } from './stats'
import { supabase } from './supabase'

/**
 * Estado do app em memória, lido de forma síncrona pelas telas.
 * - Com Supabase configurado: carregado do banco após o login e gravado a cada ação.
 * - Sem Supabase: modo local, persistido em localStorage.
 */
interface DB {
  users: User[]
  sessionUserId: string | null
  profiles: UserProfile[]
  plans: WorkoutPlan[]
  days: WorkoutDay[]
  sessions: WorkoutSession[]
  logs: WorkoutLog[]
  ready: boolean
  syncError: string
  /** A pessoa chegou pelo link de redefinição de senha e precisa definir a nova. */
  recovery: boolean
}

export const REMOTE = !!supabase
export const CONFIRM_EMAIL = 'Conta criada. Confirme pelo link que enviamos ao seu e-mail e depois entre.'

const KEY = 'fitflow-pro:v1'
const EMPTY: DB = { users: [], sessionUserId: null, profiles: [], plans: [], days: [], sessions: [], logs: [], ready: !REMOTE, syncError: '', recovery: false }

function load(): DB {
  if (REMOTE) return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw), ready: true, syncError: '', recovery: false }
  } catch {
    // armazenamento indisponível ou corrompido: começa vazio
  }
  return EMPTY
}

let db = load()
const listeners = new Set<() => void>()

function commit(next: DB) {
  db = next
  if (!REMOTE) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db))
    } catch {
      // sem persistência (modo privado, cota): o app segue funcionando em memória
    }
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))

export const dismissSyncError = () => commit({ ...db, syncError: '' })

// ---------- Supabase: conversão de linhas e gravação ----------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>

const toProfile = (r: Row): UserProfile => ({
  userId: r.user_id, age: r.age, sex: r.sex, weightKg: Number(r.weight_kg), heightCm: Number(r.height_cm), level: r.level, goal: r.goal,
  daysPerWeek: r.days_per_week, location: r.location, restrictions: r.restrictions ?? [], restrictionsNote: r.restrictions_note ?? '',
})
const fromProfile = (p: UserProfile, name: string): Row => ({
  user_id: p.userId, name, age: p.age, sex: p.sex, weight_kg: p.weightKg, height_cm: p.heightCm, level: p.level, goal: p.goal,
  days_per_week: p.daysPerWeek, location: p.location, restrictions: p.restrictions, restrictions_note: p.restrictionsNote,
})
const toPlan = (r: Row): WorkoutPlan => ({ id: r.id, userId: r.user_id, splitType: r.split_type, active: r.active, createdAt: r.created_at, basedOn: r.based_on })
const fromPlan = (p: WorkoutPlan): Row => ({ id: p.id, user_id: p.userId, split_type: p.splitType, active: p.active, created_at: p.createdAt, based_on: p.basedOn })
const toDay = (r: Row): WorkoutDay => ({ id: r.id, planId: r.plan_id, name: r.name, weekday: r.weekday, exercises: r.exercises ?? [] })
const fromDay = (d: WorkoutDay, userId: string): Row => ({ id: d.id, plan_id: d.planId, user_id: userId, name: d.name, weekday: d.weekday, exercises: d.exercises })
const toSession = (r: Row): WorkoutSession => ({
  id: r.id, userId: r.user_id, workoutDayId: r.workout_day_id, dayName: r.day_name, date: r.date,
  startedAt: Date.parse(r.started_at), finishedAt: r.finished_at ? Date.parse(r.finished_at) : null,
})
const fromSession = (s: WorkoutSession): Row => ({
  id: s.id, user_id: s.userId, workout_day_id: s.workoutDayId, day_name: s.dayName, date: s.date,
  started_at: new Date(s.startedAt).toISOString(), finished_at: s.finishedAt ? new Date(s.finishedAt).toISOString() : null,
})
const toLog = (r: Row): WorkoutLog => ({
  id: r.id, userId: r.user_id, date: r.date, exerciseId: r.exercise_id, setNumber: r.set_number, weightKg: Number(r.weight_kg), reps: r.reps, sessionId: r.session_id,
})
const fromLog = (l: WorkoutLog): Row => ({
  id: l.id, user_id: l.userId, date: l.date, exercise_id: l.exerciseId, set_number: l.setNumber, weight_kg: l.weightKg, reps: l.reps, session_id: l.sessionId,
})
const toExercise = (r: Row): Exercise => ({ id: r.id, name: r.name, muscleGroup: r.muscle_group, equipment: r.equipment, instructions: r.instructions ?? [], mediaUrl: r.media_url ?? '' })

let queue: Promise<unknown> = Promise.resolve()

/** Grava em segundo plano, uma operação por vez e na ordem das ações, e avisa na tela se falhar. */
function push(what: string, run: () => PromiseLike<{ error: { message: string } | null }>) {
  queue = queue
    .then(run)
    .then(
      ({ error }) => error,
      (e: Error) => e,
    )
    .then((error) => {
      if (!error) return
      console.error(`Supabase (${what}):`, error.message)
      commit({ ...db, syncError: `Não foi possível salvar ${what} no servidor. Verifique a conexão; o que você registrou continua na tela.` })
    })
}

function explain(error: { message: string; code?: string }): string {
  if (error.code === '42P01' || error.code === 'PGRST205') return 'As tabelas do app ainda não existem no Supabase. Rode o arquivo supabase/schema.sql no SQL Editor do projeto.'
  return `Não foi possível carregar seus dados: ${error.message}`
}

/** Lê todas as linhas do usuário, de 1000 em 1000 (limite padrão da API). */
async function fetchAll(table: string, userId: string, orderBy: string): Promise<Row[]> {
  const rows: Row[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase!.from(table).select('*').eq('user_id', userId).order(orderBy).range(from, from + 999)
    if (error) throw new Error(explain(error))
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}

async function hydrate(authUser: { id: string; email?: string; user_metadata?: Row }) {
  const sb = supabase!
  const id = authUser.id
  const [exercises, profile, plans, days, sessions, logs] = await Promise.all([
    sb.from('exercises').select('*'),
    sb.from('profiles').select('*').eq('user_id', id).maybeSingle(),
    fetchAll('workout_plans', id, 'created_at'),
    fetchAll('workout_days', id, 'weekday'),
    fetchAll('workout_sessions', id, 'started_at'),
    fetchAll('workout_logs', id, 'date'),
  ])
  if (exercises.error) throw new Error(explain(exercises.error))
  if (profile.error) throw new Error(explain(profile.error))
  setExercises(exercises.data.map(toExercise))
  const email = authUser.email ?? ''
  const name = (authUser.user_metadata?.name as string) || profile.data?.name || email.split('@')[0] || 'Atleta'
  commit({
    users: [{ id, name, email, passHash: '' }],
    sessionUserId: id,
    profiles: profile.data ? [toProfile(profile.data)] : [],
    plans: plans.map(toPlan),
    days: days.map(toDay),
    sessions: sessions.map(toSession),
    logs: logs.map(toLog),
    ready: true,
    syncError: '',
    recovery: db.recovery,
  })
}

let resettingByCode = false

if (supabase) {
  supabase.auth
    .getSession()
    .then(async ({ data }) => {
      if (data.session) await hydrate(data.session.user)
      else commit({ ...db, ready: true })
    })
    .catch((e: Error) => commit({ ...EMPTY, ready: true, syncError: e.message }))
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      resettingByCode = false
      commit({ ...EMPTY, ready: true })
    }
    // Só o link do e-mail leva à tela de nova senha; no fluxo por código a senha já foi informada.
    if (event === 'PASSWORD_RECOVERY' && !resettingByCode) commit({ ...db, recovery: true })
  })
}

function authMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.'
  if (/already registered/i.test(message)) return 'Já existe uma conta com este e-mail. Entre com a sua senha.'
  if (/not confirmed/i.test(message)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
  if (/expired or is invalid|otp/i.test(message)) return 'Código inválido ou expirado. Confira o e-mail mais recente ou peça um novo código.'
  if (/security purposes|rate limit/i.test(message)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.'
  if (/should be different/i.test(message)) return 'A nova senha precisa ser diferente da anterior.'
  if (/at least 6|weak/i.test(message)) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (/failed to fetch|network/i.test(message)) return 'Sem conexão com o servidor. Tente de novo.'
  return message
}

// ---------- Conta ----------

async function hash(email: string, password: string): Promise<string> {
  const text = `${email}:${password}`
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return `d${h}`
}

/** Devolve `null` em caso de sucesso, ou a mensagem a mostrar. */
export async function signUp(name: string, emailRaw: string, password: string): Promise<string | null> {
  const email = emailRaw.trim().toLowerCase()
  if (!name.trim()) return 'Informe seu nome.'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Informe um e-mail válido.'
  if (password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() } } })
    if (error) return authMessage(error.message)
    if (!data.session || !data.user) return CONFIRM_EMAIL
    try {
      await hydrate(data.user)
    } catch (e) {
      return (e as Error).message
    }
    return null
  }
  if (db.users.some((u) => u.email === email)) return 'Já existe uma conta com este e-mail. Entre com a sua senha.'
  const user: User = { id: uid(), name: name.trim(), email, passHash: await hash(email, password) }
  commit({ ...db, users: [...db.users, user], sessionUserId: user.id })
  return null
}

export async function signIn(emailRaw: string, password: string): Promise<string | null> {
  const email = emailRaw.trim().toLowerCase()
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return authMessage(error.message)
    try {
      await hydrate(data.user)
    } catch (e) {
      return (e as Error).message
    }
    return null
  }
  const user = db.users.find((u) => u.email === email)
  if (!user || user.passHash !== (await hash(email, password))) return 'E-mail ou senha incorretos.'
  commit({ ...db, sessionUserId: user.id })
  return null
}

export function signOut() {
  if (supabase) {
    supabase.auth.signOut()
    commit({ ...EMPTY, ready: true })
  } else commit({ ...db, sessionUserId: null })
}

async function enter(user: { id: string; email?: string } | null): Promise<string | null> {
  if (!user) return 'Não foi possível entrar. Tente de novo.'
  try {
    await hydrate(user)
  } catch (e) {
    return (e as Error).message
  }
  return null
}

/** Confirma o cadastro com o código recebido por e-mail e já entra na conta. */
export async function confirmSignUp(emailRaw: string, code: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.verifyOtp({ email: emailRaw.trim().toLowerCase(), token: code.trim(), type: 'signup' })
  return error ? authMessage(error.message) : enter(data.user)
}

/** Envia o e-mail de redefinição de senha (com código e link). */
export async function sendPasswordReset(emailRaw: string): Promise<string | null> {
  const email = emailRaw.trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Informe o e-mail da sua conta.'
  if (!supabase) return 'No modo local as contas ficam só neste aparelho; não há como redefinir a senha por e-mail.'
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + import.meta.env.BASE_URL })
  return error ? authMessage(error.message) : null
}

/** Troca a senha usando o código do e-mail de redefinição e entra na conta. */
export async function resetPassword(emailRaw: string, code: string, password: string): Promise<string | null> {
  if (!supabase) return null
  if (password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.'
  resettingByCode = true
  const { data, error } = await supabase.auth.verifyOtp({ email: emailRaw.trim().toLowerCase(), token: code.trim(), type: 'recovery' })
  if (error) return authMessage(error.message)
  const changed = await supabase.auth.updateUser({ password })
  if (changed.error) return authMessage(changed.error.message)
  return enter(data.user)
}

/** Define a nova senha de quem chegou pelo link do e-mail (já autenticado pelo link). */
export async function setNewPassword(password: string): Promise<string | null> {
  if (!supabase) return null
  if (password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.'
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return authMessage(error.message)
  commit({ ...db, recovery: false })
  return null
}

/** Apaga a conta e todos os dados da pessoa. Não tem volta. */
export async function deleteAccount(): Promise<string | null> {
  const userId = db.sessionUserId
  if (!userId) return null
  if (supabase) {
    await queue
    const { error } = await supabase.rpc('delete_my_account')
    if (error) {
      return error.code === 'PGRST202'
        ? 'A exclusão de conta ainda não foi ativada no banco. Rode supabase/update-01.sql no SQL Editor do Supabase.'
        : `Não foi possível excluir a conta: ${error.message}`
    }
    await supabase.auth.signOut({ scope: 'local' })
    commit({ ...EMPTY, ready: true })
    return null
  }
  const planIds = new Set(db.plans.filter((p) => p.userId === userId).map((p) => p.id))
  commit({
    ...db,
    sessionUserId: null,
    users: db.users.filter((u) => u.id !== userId),
    profiles: db.profiles.filter((p) => p.userId !== userId),
    plans: db.plans.filter((p) => p.userId !== userId),
    days: db.days.filter((d) => !planIds.has(d.planId)),
    sessions: db.sessions.filter((x) => x.userId !== userId),
    logs: db.logs.filter((l) => l.userId !== userId),
  })
  return null
}

// ---------- Perfil e plano ----------

export function saveProfile(draft: ProfileDraft) {
  const userId = db.sessionUserId
  if (!userId) return
  const profile: UserProfile = { ...draft, userId }
  commit({ ...db, profiles: [...db.profiles.filter((p) => p.userId !== userId), profile] })
  if (supabase) {
    const sb = supabase
    const name = db.users.find((u) => u.id === userId)?.name ?? ''
    push('o perfil', () => sb.from('profiles').upsert(fromProfile(profile, name)))
  }
}

/** Gera um WorkoutPlan a partir do perfil atual e o torna o plano ativo. */
export function generatePlan() {
  const userId = db.sessionUserId
  const profile = db.profiles.find((p) => p.userId === userId)
  if (!userId || !profile) return
  const built = buildPlan(profile)
  const plan: WorkoutPlan = {
    id: uid(),
    userId,
    splitType: built.splitType,
    active: true,
    createdAt: new Date().toISOString(),
    basedOn: profileSignature(profile),
  }
  const days: WorkoutDay[] = built.days.map((d) => ({ ...d, id: uid(), planId: plan.id }))
  commit({
    ...db,
    plans: [...db.plans.map((p) => (p.userId === userId ? { ...p, active: false } : p)), plan],
    days: [...db.days, ...days],
  })
  if (supabase) {
    const sb = supabase
    push('o plano de treino', async () => {
        const off = await sb.from('workout_plans').update({ active: false }).eq('user_id', userId).eq('active', true)
        if (off.error) return off
        const created = await sb.from('workout_plans').insert(fromPlan(plan))
        if (created.error) return created
        return sb.from('workout_days').insert(days.map((d) => fromDay(d, userId)))
    })
  }
}

// ---------- Treino ----------

/** Retoma a sessão em aberto de hoje para o dia de treino, ou cria uma nova. */
export function startSession(workoutDayId: string): string | null {
  const userId = db.sessionUserId
  const day = db.days.find((d) => d.id === workoutDayId)
  if (!userId || !day) return null
  const today = ymd(new Date())
  const open = db.sessions.find(
    (s) => s.userId === userId && s.workoutDayId === workoutDayId && s.date === today && !s.finishedAt,
  )
  if (open) return open.id
  const session: WorkoutSession = {
    id: uid(),
    userId,
    workoutDayId,
    dayName: day.name,
    date: today,
    startedAt: Date.now(),
    finishedAt: null,
  }
  commit({ ...db, sessions: [...db.sessions, session] })
  if (supabase) push('o início do treino', () => supabase!.from('workout_sessions').insert(fromSession(session)))
  return session.id
}

export function logSet(entry: Pick<WorkoutLog, 'sessionId' | 'exerciseId' | 'setNumber' | 'weightKg' | 'reps'>) {
  const userId = db.sessionUserId
  if (!userId) return
  const log: WorkoutLog = { ...entry, id: uid(), userId, date: new Date().toISOString() }
  commit({ ...db, logs: [...db.logs, log] })
  if (supabase) push('a série', () => supabase!.from('workout_logs').insert(fromLog(log)))
}

export function finishSession(sessionId: string) {
  const finishedAt = Date.now()
  commit({ ...db, sessions: db.sessions.map((s) => (s.id === sessionId ? { ...s, finishedAt } : s)) })
  if (supabase) push('a conclusão do treino', () => supabase!.from('workout_sessions').update({ finished_at: new Date(finishedAt).toISOString() }).eq('id', sessionId))
}

// ---------- Leitura ----------

export function useCurrent() {
  const d = useSyncExternalStore(subscribe, () => db)
  return useMemo(() => {
    const user = d.users.find((u) => u.id === d.sessionUserId) ?? null
    const profile = (user && d.profiles.find((p) => p.userId === user.id)) || null
    const plan = (user && d.plans.find((p) => p.userId === user.id && p.active)) || null
    const days = plan ? d.days.filter((x) => x.planId === plan.id).sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7)) : []
    const sessions = user ? d.sessions.filter((s) => s.userId === user.id) : []
    const logs = user ? d.logs.filter((l) => l.userId === user.id) : []
    return { user, profile, plan, days, sessions, logs, ready: d.ready, syncError: d.syncError, recovery: d.recovery }
  }, [d])
}
