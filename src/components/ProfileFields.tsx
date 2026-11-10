import { SPLIT_SUGGESTION } from '../lib/plan'
import { RESTRICTION_LABEL } from '../lib/stats'
import type { ProfileDraft, Restriction } from '../types'

export type FieldKey = 'goal' | 'sex' | 'age' | 'weightKg' | 'heightCm' | 'level' | 'daysPerWeek' | 'location' | 'restrictions'

export const DEFAULT_DRAFT: ProfileDraft = {
  goal: 'massa',
  sex: 'masculino',
  age: 28,
  weightKg: 78,
  heightCm: 170,
  level: 'iniciante',
  daysPerWeek: 4,
  location: 'academia',
  restrictions: [],
  restrictionsNote: '',
}

/** As 9 etapas do onboarding, na ordem. */
export const STEPS: { key: FieldKey; title: string; subtitle: string }[] = [
  { key: 'goal', title: 'Qual é o seu objetivo?', subtitle: 'Vamos montar seu plano de treino a partir dessa resposta.' },
  { key: 'sex', title: 'Qual é o seu sexo?', subtitle: 'Completa o seu perfil. Você pode atualizar depois.' },
  { key: 'age', title: 'Qual é a sua idade?', subtitle: 'Completa o seu perfil. Você pode atualizar depois.' },
  { key: 'weightKg', title: 'Qual é o seu peso?', subtitle: 'Fica registrado no seu perfil. Você pode atualizar depois no Perfil.' },
  { key: 'heightCm', title: 'Qual é a sua altura?', subtitle: 'Você pode atualizar depois no Perfil.' },
  { key: 'level', title: 'Qual é o seu nível de treino?', subtitle: 'Define a quantidade de exercícios e de séries por treino.' },
  { key: 'daysPerWeek', title: 'Quantos dias por semana você pode treinar?', subtitle: 'Seja realista: constância vale mais que volume.' },
  { key: 'location', title: 'Onde você vai treinar?', subtitle: 'Escolhemos os exercícios conforme o equipamento disponível.' },
  { key: 'restrictions', title: 'Tem alguma restrição?', subtitle: 'Evitamos exercícios que sobrecarregam a região. Marque todas que se aplicam.' },
]

interface Props {
  field: FieldKey
  draft: ProfileDraft
  set: (patch: Partial<ProfileDraft>) => void
}

function Cards<T extends string>({ label, value, options, onPick }: { label: string; value: T; options: { id: T; title: string; desc?: string }[]; onPick: (id: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="col" style={{ gap: 12 }}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === value} className="opt" onClick={() => onPick(o.id)}>
          <span className="col" style={{ gap: 4, textAlign: 'left' }}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{o.title}</span>
            {o.desc && <span className="muted" style={{ fontSize: 13 }}>{o.desc}</span>}
          </span>
          <span className="ring" />
        </button>
      ))}
    </div>
  )
}

function Stepper({ label, value, unit, min, max, onChange }: { label: string; value: number; unit: string; min: number; max: number; onChange: (n: number) => void }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className="stepper">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <input
          className="stepper-value"
          aria-label={`${label}, em ${unit}`}
          inputMode="numeric"
          value={value || ''}
          style={{ width: `${Math.max(1, String(value || '').length)}ch` }}
          onChange={(e) => onChange(Math.min(max, Number(e.target.value.replace(/\D/g, '').slice(0, 3))))}
          onBlur={() => onChange(clamp(value))}
        />
        <span className="muted" style={{ fontSize: 22, fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button type="button" className="round-btn" aria-label={`Diminuir 1 ${unit}`} onClick={() => onChange(clamp(value - 1))}>−</button>
        <button type="button" className="round-btn" aria-label={`Aumentar 1 ${unit}`} onClick={() => onChange(clamp(value + 1))}>+</button>
      </div>
    </div>
  )
}

export function ProfileField({ field, draft, set }: Props) {
  switch (field) {
    case 'goal':
      return (
        <Cards
          label="Objetivo"
          value={draft.goal}
          onPick={(goal) => set({ goal })}
          options={[
            { id: 'massa', title: 'Ganhar massa', desc: 'Hipertrofia, com progressão de carga' },
            { id: 'peso', title: 'Perder peso', desc: 'Mais gasto calórico e descansos curtos' },
            { id: 'manter', title: 'Manter', desc: 'Conservar força e condicionamento' },
          ]}
        />
      )
    case 'sex':
      return (
        <Cards
          label="Sexo"
          value={draft.sex}
          onPick={(sex) => set({ sex })}
          options={[
            { id: 'masculino', title: 'Masculino' },
            { id: 'feminino', title: 'Feminino' },
            { id: 'outro', title: 'Outro', desc: 'Prefiro não informar' },
          ]}
        />
      )
    case 'age':
      return <Stepper label="Idade" unit="anos" min={14} max={90} value={draft.age} onChange={(age) => set({ age })} />
    case 'weightKg':
      return <Stepper label="Peso" unit="kg" min={30} max={250} value={draft.weightKg} onChange={(weightKg) => set({ weightKg })} />
    case 'heightCm':
      return <Stepper label="Altura" unit="cm" min={120} max={230} value={draft.heightCm} onChange={(heightCm) => set({ heightCm })} />
    case 'level':
      return (
        <Cards
          label="Nível"
          value={draft.level}
          onPick={(level) => set({ level })}
          options={[
            { id: 'iniciante', title: 'Iniciante', desc: 'Menos de 6 meses de treino' },
            { id: 'intermediario', title: 'Intermediário', desc: 'De 6 meses a 2 anos de treino constante' },
            { id: 'avancado', title: 'Avançado', desc: 'Mais de 2 anos, com boa técnica' },
          ]}
        />
      )
    case 'daysPerWeek': {
      const [split, why] = SPLIT_SUGGESTION[draft.daysPerWeek]
      return (
        <div className="col" style={{ gap: 20 }}>
          <div role="radiogroup" aria-label="Dias de treino por semana" className="days-grid">
            {[2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={n === draft.daysPerWeek} className="day-opt" onClick={() => set({ daysPerWeek: n })}>
                {n}
              </button>
            ))}
          </div>
          <div className="card col" style={{ gap: 6 }}>
            <span className="eyebrow accent">DIVISÃO SUGERIDA</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{split}</span>
            <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{why}</span>
          </div>
        </div>
      )
    }
    case 'location':
      return (
        <Cards
          label="Local de treino"
          value={draft.location}
          onPick={(location) => set({ location })}
          options={[
            { id: 'academia', title: 'Academia', desc: 'Máquinas, barras e polias disponíveis' },
            { id: 'casa', title: 'Casa', desc: 'Halteres e peso corporal' },
          ]}
        />
      )
    case 'restrictions': {
      const toggle = (r: Restriction) =>
        set({ restrictions: draft.restrictions.includes(r) ? draft.restrictions.filter((x) => x !== r) : [...draft.restrictions, r] })
      const none = draft.restrictions.length === 0
      return (
        <div className="col" style={{ gap: 10 }}>
          <button type="button" role="checkbox" aria-checked={none} className="opt opt-sm" onClick={() => set({ restrictions: [] })}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Nenhuma</span>
            <span className="ring" />
          </button>
          {(Object.keys(RESTRICTION_LABEL) as Restriction[]).map((r) => (
            <button key={r} type="button" role="checkbox" aria-checked={draft.restrictions.includes(r)} className="opt opt-sm" onClick={() => toggle(r)}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{RESTRICTION_LABEL[r]}</span>
              <span className="ring" />
            </button>
          ))}
          <div className="field" style={{ marginTop: 6 }}>
            <label htmlFor="restr-note">Outra (opcional)</label>
            <input id="restr-note" className="input" placeholder="Ex.: cirurgia recente, hérnia" value={draft.restrictionsNote} onChange={(e) => set({ restrictionsNote: e.target.value })} />
          </div>
        </div>
      )
    }
  }
}

export function restrictionsText(p: ProfileDraft): string {
  const parts = p.restrictions.map((r) => RESTRICTION_LABEL[r])
  if (p.restrictionsNote.trim()) parts.push(p.restrictionsNote.trim())
  return parts.length ? parts.join(', ') : 'Nenhuma'
}
