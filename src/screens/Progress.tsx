import { useState } from 'react'
import { Icon, TabScreen } from '../components/ui'
import { EXERCISES, EXERCISE_BY_ID } from '../data/exercises'
import { DOW3, MONTHS, finished, fmt, fromYmd, plural, sessionStats } from '../lib/stats'
import { useCurrent } from '../lib/store'

const W = 308
const H = 140

export default function Progress() {
  const { days, sessions, logs } = useCurrent()

  // Exercícios com registro primeiro (do mais registrado ao menos), depois os demais do plano
  const counts = new Map<string, number>()
  logs.forEach((l) => counts.set(l.exerciseId, (counts.get(l.exerciseId) ?? 0) + 1))
  const planIds = days.flatMap((d) => d.exercises.map((e) => e.exerciseId))
  const logged = [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!)
  const options = [...new Set([...logged, ...planIds])]
  const [picked, setPicked] = useState<string | null>(null)
  const exerciseId = picked ?? options[0] ?? EXERCISES[0].id

  // Carga máxima por treino
  const bySession = new Map<string, { date: string; max: number }>()
  for (const l of logs) {
    if (l.exerciseId !== exerciseId) continue
    const cur = bySession.get(l.sessionId)
    if (!cur) bySession.set(l.sessionId, { date: l.date, max: l.weightKg })
    else cur.max = Math.max(cur.max, l.weightKg)
  }
  const points = [...bySession.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-8)
  const first = points[0]
  const last = points[points.length - 1]
  const lo = Math.min(...points.map((p) => p.max))
  const hi = Math.max(...points.map((p) => p.max))
  const xy = points.map((p, i) => ({
    x: points.length === 1 ? W / 2 : 8 + (i * (W - 16)) / (points.length - 1),
    y: hi === lo ? 70 : 120 - ((p.max - lo) / (hi - lo)) * 100,
  }))
  const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')
  const delta = last && first ? last.max - first.max : 0
  const weeks = last && first ? Math.round((new Date(last.date).getTime() - new Date(first.date).getTime()) / (7 * 864e5)) : 0
  const label = (iso: string) => {
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const done = finished(sessions).sort((a, b) => b.startedAt - a.startedAt)
  const now = new Date()
  const thisMonth = done.filter((s) => {
    const d = fromYmd(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <TabScreen>
      <h1 className="h-screen">Progresso</h1>

      <section className="card card-lg col" style={{ gap: 16 }}>
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div className="col" style={{ gap: 4, minWidth: 0 }}>
            <span className="eyebrow muted">Evolução de carga</span>
            <label className="select-btn">
              <span>{EXERCISE_BY_ID[exerciseId].name}</span>
              <Icon name="down" size={18} stroke={2.2} color="var(--muted)" />
              <select aria-label="Exercício" value={exerciseId} onChange={(e) => setPicked(e.target.value)}>
                {options.map((id) => (
                  <option key={id} value={id}>{EXERCISE_BY_ID[id].name}</option>
                ))}
              </select>
            </label>
          </div>
          {last && (
            <div className="col" style={{ alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
              <span className="display accent" style={{ fontSize: 26 }}>{fmt(last.max)} kg</span>
              <span className="small muted">
                {points.length < 2 ? 'Primeiro registro' : `${delta > 0 ? '+' : ''}${fmt(delta)} kg em ${weeks >= 1 ? plural(weeks, 'semana', 'semanas') : plural(points.length, 'treino', 'treinos')}`}
              </span>
            </div>
          )}
        </div>

        {points.length ? (
          <>
            <svg role="img" aria-label={`Carga máxima em ${EXERCISE_BY_ID[exerciseId].name} por treino: ${points.map((p) => fmt(p.max)).join(', ')} kg`} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 140 }}>
              <path d={`M0 20H${W}M0 70H${W}M0 120H${W}`} stroke="var(--line)" strokeWidth="1" />
              {xy.length > 1 && (
                <>
                  <path d={`${line}V${H}H${xy[0].x}Z`} fill="var(--accent)" fillOpacity="0.12" />
                  <path d={line} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
              <circle cx={xy[xy.length - 1].x} cy={xy[xy.length - 1].y} r="6" fill="var(--accent)" stroke="var(--card)" strokeWidth="3" />
            </svg>
            <div className="muted" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)', fontSize: 12, textAlign: 'center' }}>
              {points.map((p, i) => <span key={i}>{label(p.date)}</span>)}
            </div>
          </>
        ) : (
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>Registre este exercício em um treino para acompanhar a evolução da carga.</p>
        )}
      </section>

      <section className="col grow" style={{ gap: 4 }}>
        <div className="between" style={{ paddingBottom: 6 }}>
          <h2 className="h-card">Treinos concluídos</h2>
          <span className="small muted">{done.length} no total · {thisMonth} em {MONTHS[now.getMonth()]}</span>
        </div>
        {done.length === 0 && <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, paddingTop: 8 }}>Nenhum treino concluído ainda. Quando você finalizar o primeiro, ele aparece aqui.</p>}
        {done.slice(0, 30).map((s) => {
          const st = sessionStats(s, logs)
          const d = fromYmd(s.date)
          return (
            <div key={s.id} className="log-row">
              <div className="badge" style={{ background: 'var(--card)', color: 'var(--text)' }}>
                <span className="display" style={{ fontSize: 17, lineHeight: 1 }}>{String(d.getDate()).padStart(2, '0')}</span>
                <span className="muted" style={{ fontSize: 10, fontWeight: 600 }}>{DOW3[d.getDay()]}</span>
              </div>
              <div className="col grow" style={{ gap: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{s.dayName}</span>
                <span className="small muted">{st.minutes} min · {plural(st.sets, 'série', 'séries')}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(st.volume)} kg</span>
            </div>
          )
        })}
      </section>
    </TabScreen>
  )
}
