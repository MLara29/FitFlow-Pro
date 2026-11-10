import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton, Icon, TabScreen, mediaSrc } from '../components/ui'
import { EXERCISES, EXERCISE_BY_ID, LIBRARY_SECTIONS } from '../data/exercises'
import { dayFocus } from '../lib/plan'
import { DOW3, GOAL_LABEL, LEVEL_LABEL, PLACE_LABEL, SPLIT_LABEL, finished, plural, weekStart, ymd } from '../lib/stats'
import { useCurrent } from '../lib/store'

export default function Workouts() {
  const { profile, plan, days, sessions } = useCurrent()
  if (!profile || !plan) return null
  const today = new Date()
  const mondayKey = ymd(weekStart(today))
  const doneThisWeek = new Set(finished(sessions).filter((s) => s.date >= mondayKey).map((s) => s.workoutDayId))

  return (
    <TabScreen>
      <h1 className="h-screen">Treinos</h1>

      <section className="card col" style={{ gap: 6 }}>
        <div className="between" style={{ alignItems: 'center' }}>
          <span className="eyebrow accent">Plano ativo</span>
          <span className="small muted">{profile.daysPerWeek} dias por semana</span>
        </div>
        <h2 className="display" style={{ fontSize: 22 }}>{SPLIT_LABEL[plan.splitType]}</h2>
        <span className="small muted">{LEVEL_LABEL[profile.level]} · {GOAL_LABEL[profile.goal]} · {PLACE_LABEL[profile.location]}</span>
      </section>

      <div className="col" style={{ gap: 10 }}>
        {days.map((d) => {
          const isToday = d.weekday === today.getDay()
          const done = doneThisWeek.has(d.id)
          return (
            <Link key={d.id} to={`/treino/${d.id}`} className={`day-row${isToday ? ' is-today' : ''}`}>
              <span className="badge">{DOW3[d.weekday]}</span>
              <span className="col grow" style={{ gap: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{d.name}</span>
                <span className="small muted">{dayFocus(d, 2)} · {plural(d.exercises.length, 'exercício', 'exercícios')}</span>
              </span>
              <span className="small" style={{ fontWeight: 600, color: isToday && !done ? 'var(--accent)' : 'var(--muted)' }}>{done ? 'Concluído' : isToday ? 'Hoje' : ''}</span>
            </Link>
          )
        })}
      </div>

      <Link to="/exercicios" className="link-row">
        <span>Biblioteca de exercícios</span>
        <span className="row muted" style={{ gap: 8, fontWeight: 500 }}>
          {EXERCISES.length}
          <Icon name="chevron" size={18} stroke={2.2} />
        </span>
      </Link>
    </TabScreen>
  )
}

export function Library() {
  const nav = useNavigate()
  return (
    <div className="screen page" style={{ gap: 20, padding: '20px 20px 32px' }}>
      <header className="row" style={{ gap: 8 }}>
        <BackButton label="Voltar para Treinos" onClick={() => nav('/treinos')} />
        <h1 className="display grow" style={{ fontSize: 22 }}>Exercícios</h1>
        <span className="small muted">{EXERCISES.length} no total</span>
      </header>
      {LIBRARY_SECTIONS.map((sec) => {
        const items = EXERCISES.filter((e) => sec.groups.includes(e.muscleGroup))
        return (
          <section key={sec.name} className="col" style={{ gap: 6 }}>
            <div className="between" style={{ paddingBottom: 4 }}>
              <h2 className="eyebrow accent">{sec.name}</h2>
              <span className="muted" style={{ fontSize: 12 }}>{items.length} exercícios</span>
            </div>
            {items.map((e) => (
              <Link key={e.id} to={`/exercicio/${e.id}`} className="lib-row">
                <span className="grow" style={{ fontWeight: 600 }}>{e.name}</span>
                <span className="muted" style={{ flexShrink: 0, fontSize: 12 }}>{e.equipment}</span>
                <Icon name="chevron" size={16} stroke={2.2} color="var(--muted)" />
              </Link>
            ))}
          </section>
        )
      })}
    </div>
  )
}

export function ExerciseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const e = id ? EXERCISE_BY_ID[id] : undefined
  if (!e) {
    return (
      <div className="screen page" style={{ gap: 16 }}>
        <h1 className="h-screen">Exercício não encontrado</h1>
        <Link to="/exercicios" className="btn">Ver a biblioteca</Link>
      </div>
    )
  }
  return (
    <div className="screen">
      <div className="detail-media">
        <img src={mediaSrc(e.mediaUrl)} alt={`Demonstração da execução: ${e.name}`} />
        <button type="button" className="close-btn" aria-label="Fechar" onClick={() => nav(-1)}>
          <Icon name="close" size={20} stroke={2.2} />
        </button>
      </div>
      <div className="col grow" style={{ gap: 16, padding: '20px 20px 24px' }}>
        <div className="col" style={{ gap: 10 }}>
          <h1 className="h-screen">{e.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span className="chip chip-accent" style={{ padding: '6px 12px' }}>{e.muscleGroup}</span>
            <span className="chip" style={{ padding: '6px 12px' }}>{e.equipment}</span>
          </div>
        </div>
        <div className="col" style={{ gap: 10 }}>
          <h2 className="eyebrow muted">Execução</h2>
          <ol className="steps">
            {e.instructions.map((text, i) => (
              <li key={i}>
                <b>{i + 1}</b>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
