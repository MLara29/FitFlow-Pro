import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEFAULT_DRAFT, ProfileField, STEPS, restrictionsText } from '../components/ProfileFields'
import { BackButton, Icon } from '../components/ui'
import { dayFocus } from '../lib/plan'
import { DOW3, GOAL_LABEL, LEVEL_LABEL, PLACE_LABEL, SPLIT_LABEL } from '../lib/stats'
import { generatePlan, saveProfile, useCurrent } from '../lib/store'
import type { ProfileDraft } from '../types'

export default function Onboarding() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ProfileDraft>(DEFAULT_DRAFT)
  const s = STEPS[step]
  const last = step === STEPS.length - 1

  function next() {
    if (!last) return setStep(step + 1)
    saveProfile(draft)
    generatePlan()
    nav('/plano-pronto', { replace: true })
  }

  return (
    <div className="screen page flow">
      <header className="row" style={{ gap: 14, minHeight: 24 }}>
        {step === 0 ? (
          <span className="display accent" style={{ fontSize: 16 }}>FitFlow Pro</span>
        ) : (
          <span style={{ margin: '-10px -8px -10px 0' }}>
            <BackButton onClick={() => setStep(step - 1)} />
          </span>
        )}
        <div className="progress" role="progressbar" aria-label="Progresso do cadastro" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
          <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <span className="small muted">{step + 1} de {STEPS.length}</span>
      </header>

      <div className="col" style={{ gap: 10 }}>
        <h1 className="h-flow">{s.title}</h1>
        <p className="muted" style={{ lineHeight: 1.5 }}>{s.subtitle}</p>
      </div>

      <div className="grow col">
        <ProfileField field={s.key} draft={draft} set={(patch) => setDraft({ ...draft, ...patch })} />
      </div>

      <button type="button" className="btn" onClick={next}>{last ? 'Gerar meu plano' : 'Continuar'}</button>
    </div>
  )
}

export function PlanReady() {
  const { profile, plan, days } = useCurrent()
  if (!profile || !plan) return null
  return (
    <div className="screen page" style={{ gap: 24, padding: '40px 20px 24px' }}>
      <div className="col" style={{ gap: 16 }}>
        <div className="avatar" style={{ width: 56, height: 56 }}>
          <Icon name="check" size={28} stroke={2.6} />
        </div>
        <h1 className="h-flow">Seu plano está pronto</h1>
        <p className="muted" style={{ lineHeight: 1.5 }}>Montado para o seu nível, objetivo e dias disponíveis.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span className="chip chip-accent">{GOAL_LABEL[profile.goal]}</span>
        <span className="chip">{LEVEL_LABEL[profile.level]}</span>
        <span className="chip">{profile.daysPerWeek} dias</span>
        <span className="chip">{PLACE_LABEL[profile.location]}</span>
        {restrictionsText(profile) !== 'Nenhuma' && <span className="chip">Restrições: {restrictionsText(profile)}</span>}
      </div>

      <section className="card card-lg col grow" style={{ gap: 4 }}>
        <span className="eyebrow accent">Divisão</span>
        <h2 className="display" style={{ fontSize: 24, marginBottom: 8 }}>{SPLIT_LABEL[plan.splitType]}</h2>
        {days.map((d) => (
          <div key={d.id} className="split-row">
            <span className="small muted" style={{ width: 44, fontWeight: 700 }}>{DOW3[d.weekday]}</span>
            <div className="col grow" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{d.name}</span>
              <span className="small muted">{dayFocus(d)}</span>
            </div>
            <span className="small muted" style={{ whiteSpace: 'nowrap' }}>{d.exercises.length} exerc.</span>
          </div>
        ))}
      </section>

      <Link to="/" replace className="btn">Ir para a Home</Link>
    </div>
  )
}
