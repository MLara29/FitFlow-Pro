import { Link } from 'react-router-dom'
import { Icon, TabScreen } from '../components/ui'
import { dayFocus, estimateMinutes } from '../lib/plan'
import { DOW_FULL, MONTHS, addDays, finished, fmt, plural, sessionStats, streak, weekStart, ymd } from '../lib/stats'
import { useCurrent } from '../lib/store'

const WEEK_LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function Home() {
  const { user, plan, days, sessions, logs } = useCurrent()
  const today = new Date()
  const todayKey = ymd(today)
  const done = finished(sessions)
  const trained = new Set(done.map((s) => s.date))

  // Treino de hoje, ou o próximo previsto quando hoje é descanso
  const todayDay = days.find((d) => d.weekday === today.getDay())
  let nextDay = todayDay
  for (let i = 1; !nextDay && i <= 7; i++) nextDay = days.find((d) => d.weekday === (today.getDay() + i) % 7)
  const doneToday = !!todayDay && done.some((s) => s.date === todayKey && s.workoutDayId === todayDay.id)
  const inProgress = !!nextDay && sessions.some((s) => s.workoutDayId === nextDay.id && s.date === todayKey && !s.finishedAt && logs.some((l) => l.sessionId === s.id))

  const monday = weekStart(today)
  const week = WEEK_LETTERS.map((label, i) => {
    const d = addDays(monday, i)
    const key = ymd(d)
    return { label, num: d.getDate(), done: trained.has(key), today: key === todayKey }
  })
  const mondayKey = ymd(monday)
  const weekSessions = done.filter((s) => s.date >= mondayKey)
  const weekDone = new Set(weekSessions.map((s) => s.workoutDayId)).size
  const totals = weekSessions.map((s) => sessionStats(s, logs)).reduce((a, s) => ({ minutes: a.minutes + s.minutes, volume: a.volume + s.volume, sets: a.sets + s.sets }), { minutes: 0, volume: 0, sets: 0 })
  const run = streak(sessions, days, plan, today)

  return (
    <TabScreen>
      <header className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <div className="col" style={{ gap: 4, minWidth: 0 }}>
          <span className="small muted">{cap(DOW_FULL[today.getDay()])}, {today.getDate()} de {MONTHS[today.getMonth()]}</span>
          <h1 className="h-screen">Olá, {user?.name.split(' ')[0]}</h1>
        </div>
        <div className="streak-pill" aria-label={`Sequência: ${plural(run, 'dia', 'dias')}`}>
          <Icon name="flame" size={18} color="var(--accent)" />
          <span>{plural(run, 'dia', 'dias')}</span>
        </div>
      </header>

      {nextDay && (
        <section className="today">
          <span className="eyebrow">{todayDay ? 'Treino de hoje' : `Hoje é descanso · próximo: ${DOW_FULL[nextDay.weekday]}`}</span>
          <div className="col" style={{ gap: 6 }}>
            <h2 className="display" style={{ fontSize: 32, lineHeight: 1.05 }}>{nextDay.name}</h2>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#2a3008' }}>
              {plural(nextDay.exercises.length, 'exercício', 'exercícios')} · cerca de {estimateMinutes(nextDay)} min · {dayFocus(nextDay)}
            </p>
          </div>
          <Link to={`/treino/${nextDay.id}`} className="today-cta">
            <span>{doneToday ? 'Concluído hoje · treinar de novo' : inProgress ? 'Continuar treino' : todayDay ? 'Começar treino' : 'Adiantar treino'}</span>
            <Icon name={doneToday ? 'check' : 'arrow'} size={20} stroke={2.4} color="var(--accent)" />
          </Link>
        </section>
      )}

      <section className="card col" style={{ gap: 14 }}>
        <div className="between">
          <h2 className="h-card">Sequência</h2>
          <span className="small muted">{run ? `${plural(run, 'dia', 'dias')} de treino sem falhar` : 'Conclua um treino para começar'}</span>
        </div>
        <div className="week">
          {week.map((d, i) => (
            <div key={i}>
              <span>{d.label}</span>
              <div className={`dot${d.done ? ' done' : d.today ? ' today' : ''}`} aria-label={d.done ? `Dia ${d.num}: treino concluído` : undefined}>
                {d.done ? <Icon name="check" size={16} stroke={3} /> : d.num}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card col" style={{ gap: 14 }}>
        <div className="between">
          <h2 className="h-card">Resumo da semana</h2>
          <span className="small muted">{weekDone} de {plural(days.length, 'treino', 'treinos')}</span>
        </div>
        <div className="progress" style={{ height: 8, flexGrow: 0 }} role="progressbar" aria-label="Treinos da semana" aria-valuemin={0} aria-valuemax={days.length} aria-valuenow={weekDone}>
          <div style={{ width: `${days.length ? Math.min(100, (weekDone / days.length) * 100) : 0}%` }} />
        </div>
        <div className="stat3">
          <div><strong>{totals.minutes} min</strong><span>Tempo</span></div>
          <div><strong>{fmt(totals.volume)} kg</strong><span>Volume</span></div>
          <div><strong>{totals.sets}</strong><span>Séries</span></div>
        </div>
      </section>
    </TabScreen>
  )
}
