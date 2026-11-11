import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton, Icon, ExerciseMedia } from '../components/ui'
import { EXERCISE_BY_ID } from '../data/exercises'
import { clock, fmt, plural, sessionStats } from '../lib/stats'
import { finishSession, logSet, startSession, useCurrent } from '../lib/store'
import type { WorkoutLog } from '../types'

const num = (s: string) => Number(s.replace(',', '.'))

export default function Workout() {
  const { dayId } = useParams()
  const nav = useNavigate()
  const { days, sessions, logs } = useCurrent()
  const day = days.find((d) => d.id === dayId)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [jump, setJump] = useState<number | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [error, setError] = useState('')
  const [rest, setRest] = useState<{ end: number; total: number } | null>(null)
  const [now, setNow] = useState(Date.now())
  const repsRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dayId) setSessionId(startSession(dayId))
  }, [dayId])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [])

  const restLeft = rest ? Math.ceil((rest.end - now) / 1000) : 0
  useEffect(() => {
    if (rest && restLeft <= 0) {
      setRest(null)
      navigator.vibrate?.(300)
    }
  }, [rest, restLeft])

  const session = sessions.find((s) => s.id === sessionId)
  if (!day) {
    return (
      <div className="screen page" style={{ gap: 16 }}>
        <h1 className="h-screen">Treino não encontrado</h1>
        <Link to="/treinos" className="btn">Ver meus treinos</Link>
      </div>
    )
  }
  if (!session) return null

  if (session.finishedAt) {
    const st = sessionStats(session, logs)
    return (
      <div className="screen page" style={{ gap: 24, padding: '40px 20px 24px' }}>
        <div className="col" style={{ gap: 16 }}>
          <div className="avatar" style={{ width: 56, height: 56 }}>
            <Icon name="check" size={28} stroke={2.6} />
          </div>
          <h1 className="h-flow">Treino concluído</h1>
          <p className="muted">{day.name} registrado no seu histórico.</p>
        </div>
        <section className="card card-lg stat3">
          <div><strong>{st.minutes} min</strong><span>Tempo</span></div>
          <div><strong>{fmt(st.volume)} kg</strong><span>Volume</span></div>
          <div><strong>{st.sets}</strong><span>Séries</span></div>
        </section>
        <div className="grow" />
        <Link to="/progresso" replace className="btn btn-outline">Ver progresso</Link>
        <Link to="/" replace className="btn">Ir para a Home</Link>
      </div>
    )
  }

  const own = logs.filter((l) => l.sessionId === session.id)
  const setsOf = (exerciseId: string) => own.filter((l) => l.exerciseId === exerciseId).sort((a, b) => a.setNumber - b.setNumber)
  const firstOpen = day.exercises.findIndex((e) => setsOf(e.exerciseId).length < e.sets)
  const allDone = firstOpen === -1
  const idx = jump ?? (allDone ? day.exercises.length - 1 : firstOpen)
  const item = day.exercises[idx]
  const exercise = EXERCISE_BY_ID[item.exerciseId]
  const doneSets = setsOf(item.exerciseId)
  const currentSet = doneSets.length < item.sets ? doneSets.length + 1 : null

  // Referência: o treino anterior mais recente com este exercício
  const earlier = logs.filter((l) => l.exerciseId === item.exerciseId && l.sessionId !== session.id)
  const lastSessionId = earlier.length ? earlier.reduce((a, b) => (a.date > b.date ? a : b)).sessionId : null
  const lastSets = earlier.filter((l) => l.sessionId === lastSessionId)
  const best = lastSets.reduce<WorkoutLog | null>((a, b) => (!a || b.weightKg > a.weightKg || (b.weightKg === a.weightKg && b.reps > a.reps) ? b : a), null)
  const guide = currentSet ? (lastSets.find((l) => l.setNumber === currentSet) ?? doneSets[doneSets.length - 1] ?? best) : null

  function complete() {
    if (!session || !currentSet) return
    const w = weight.trim() ? num(weight) : (guide?.weightKg ?? 0)
    const r = reps.trim() ? Math.round(num(reps)) : (guide?.reps ?? 0)
    if (!Number.isFinite(w) || w < 0 || !Number.isFinite(r) || r < 1) {
      setError('Informe as repetições da série.')
      repsRef.current?.focus()
      return
    }
    logSet({ sessionId: session.id, exerciseId: item.exerciseId, setNumber: currentSet, weightKg: w, reps: r })
    setWeight('')
    setReps('')
    setError('')
    const exerciseDone = currentSet === item.sets
    const workoutDone = exerciseDone && day!.exercises.every((e, i) => i === idx || setsOf(e.exerciseId).length >= e.sets)
    if (exerciseDone) setJump(null)
    const t = Date.now()
    setNow(t)
    setRest(workoutDone ? null : { end: t + item.restSeconds * 1000, total: item.restSeconds })
  }

  const goTo = (i: number) => {
    setJump(i)
    setWeight('')
    setReps('')
    setError('')
  }

  const upcoming = day.exercises.map((e, i) => ({ e, i })).filter(({ e, i }) => i !== idx && setsOf(e.exerciseId).length < e.sets)

  return (
    <div className="screen page" style={{ gap: 16, padding: '20px 20px 24px' }}>
      <header className="row" style={{ gap: 8 }}>
        <BackButton label="Sair do treino" onClick={() => nav('/')} />
        <div className="col grow" style={{ gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{day.name}</span>
          <span className="small muted">Exercício {idx + 1} de {day.exercises.length}</span>
        </div>
        <span className="display" style={{ fontSize: 18 }} aria-label="Tempo de treino">{clock((now - session.startedAt) / 1000)}</span>
      </header>

      <div className="segments">
        {day.exercises.map((e, i) => {
          const done = setsOf(e.exerciseId).length >= e.sets
          return (
            <button key={e.exerciseId} type="button" className={done ? 'done' : i === idx ? 'current' : ''} aria-label={`Ir para ${EXERCISE_BY_ID[e.exerciseId].name}${done ? ' (concluído)' : ''}`} aria-current={i === idx ? 'step' : undefined} onClick={() => goTo(i)}>
              <i />
            </button>
          )
        })}
      </div>

      <section className="card card-lg col" style={{ gap: 14 }}>
        <Link to={`/exercicio/${exercise.id}`} className="col" style={{ gap: 12 }}>
          <span className="col" style={{ gap: 4 }}>
            <h1 className="h-screen">{exercise.name}</h1>
            <span className="small muted">{exercise.muscleGroup} · {exercise.equipment} · {item.sets} séries de {item.reps}</span>
            <span className="small accent" style={{ fontWeight: 600 }}>Toque para ver a execução</span>
          </span>
          <span className="media">
            <ExerciseMedia exercise={exercise} />
          </span>
        </Link>

        <div className="last-ref">
          <span className="small muted">Último treino</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{best ? `${fmt(best.weightKg)} kg × ${best.reps} reps` : 'Primeira vez neste exercício'}</span>
        </div>

        <div className="col" style={{ gap: 8 }}>
          <div className="set-grid head">
            <span>Série</span><span>Carga (kg)</span><span>Reps</span><span />
          </div>
          {Array.from({ length: item.sets }, (_, i) => {
            const n = i + 1
            const logged = doneSets.find((l) => l.setNumber === n)
            if (logged) {
              return (
                <div key={n} className="set-grid">
                  <span className="set-n">{n}</span>
                  <span className="set-v">{fmt(logged.weightKg)}</span>
                  <span className="set-v">{logged.reps}</span>
                  <span className="set-check" role="img" aria-label="Série concluída"><Icon name="check" size={16} stroke={3} color="var(--on-accent)" /></span>
                </div>
              )
            }
            if (n === currentSet) {
              return (
                <div key={n} className="set-grid">
                  <span className="set-n accent">{n}</span>
                  <input className="set-input" inputMode="decimal" aria-label={`Carga da série ${n}, em kg`} placeholder={guide ? fmt(guide.weightKg) : '0'} value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, ''))} />
                  <input ref={repsRef} className="set-input" inputMode="numeric" aria-label={`Repetições da série ${n}`} placeholder={guide ? String(guide.reps) : item.reps.split(' ')[0]} value={reps} onChange={(e) => setReps(e.target.value.replace(/\D/g, ''))} />
                  <span />
                </div>
              )
            }
            return (
              <div key={n} className="set-grid" style={{ color: 'var(--faint)' }}>
                <span className="set-n" style={{ color: 'inherit' }}>{n}</span>
                <span style={{ fontSize: 17 }}>–</span>
                <span style={{ fontSize: 17 }}>–</span>
                <span />
              </div>
            )
          })}
          {error && <p className="error" role="alert">{error}</p>}
        </div>
      </section>

      {rest && restLeft > 0 && (
        <section className="rest" aria-label="Cronômetro de descanso">
          <div className="col grow" style={{ gap: 2 }}>
            <span className="eyebrow accent">Descanso · {rest.total} s</span>
            <span className="display" style={{ fontSize: 34, lineHeight: 1.1 }} role="timer">{clock(restLeft)}</span>
          </div>
          <button type="button" style={{ border: '1px solid var(--sel-line)', background: 'transparent' }} onClick={() => setRest({ end: rest.end + 15000, total: rest.total + 15 })}>+15 s</button>
          <button type="button" style={{ border: 0, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 700 }} onClick={() => setRest(null)}>Pular</button>
        </section>
      )}

      <section className="col grow" style={{ gap: 4 }}>
        {upcoming.length > 0 && <h2 className="small muted" style={{ fontWeight: 600, marginBottom: 4 }}>A seguir</h2>}
        {upcoming.map(({ e }) => (
          <Link key={e.exerciseId} to={`/exercicio/${e.exerciseId}`} className="next-row">
            <span style={{ fontWeight: 600 }}>{EXERCISE_BY_ID[e.exerciseId].name}</span>
            <span className="row muted" style={{ gap: 8, whiteSpace: 'nowrap' }}>
              {e.sets} × {e.reps.replace(' a ', '–')} · {e.restSeconds} s
              <Icon name="chevron" size={16} stroke={2.2} />
            </span>
          </Link>
        ))}
      </section>

      <div className="sticky-cta">
        {currentSet ? (
          <button type="button" className="btn" onClick={complete}>Concluir série {currentSet}</button>
        ) : allDone ? (
          <button type="button" className="btn" onClick={() => finishSession(session.id)}>Finalizar treino</button>
        ) : (
          <button type="button" className="btn" onClick={() => goTo(firstOpen)}>Ir para o próximo exercício</button>
        )}
        {!allDone && own.length > 0 && (
          <button type="button" className="btn-text" onClick={() => finishSession(session.id)}>
            Finalizar agora com {plural(own.length, 'série', 'séries')}
          </button>
        )}
      </div>
    </div>
  )
}
