import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileField, STEPS, restrictionsText } from '../components/ProfileFields'
import type { FieldKey } from '../components/ProfileFields'
import { Icon, TabScreen } from '../components/ui'
import { profileSignature } from '../lib/plan'
import { GOAL_LABEL, LEVEL_LABEL, PLACE_LABEL, SEX_SHORT, SPLIT_LABEL, fmt } from '../lib/stats'
import { deleteAccount, generatePlan, saveProfile, signOut, useCurrent } from '../lib/store'
import type { ProfileDraft, UserProfile } from '../types'

function EditSheet({ field, profile, onClose }: { field: FieldKey; profile: UserProfile; onClose: () => void }) {
  const [draft, setDraft] = useState<ProfileDraft>(profile)
  const step = STEPS.find((s) => s.key === field)!
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={step.title} onClick={(e) => e.stopPropagation()}>
        <h2 className="display" style={{ fontSize: 24, lineHeight: 1.15 }}>{step.title}</h2>
        <ProfileField field={field} draft={draft} set={(patch) => setDraft({ ...draft, ...patch })} />
        <button type="button" className="btn" onClick={() => { saveProfile(draft); onClose() }}>Salvar</button>
        <button type="button" className="btn-text" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Profile() {
  const nav = useNavigate()
  const { user, profile, plan } = useCurrent()
  const [editing, setEditing] = useState<FieldKey | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState<'no' | 'ask' | 'busy'>('no')
  const [deleteError, setDeleteError] = useState('')
  if (!user || !profile || !plan) return null

  const tiles: [FieldKey, string, string][] = [
    ['age', String(profile.age), 'Idade'],
    ['sex', SEX_SHORT[profile.sex], 'Sexo'],
    ['weightKg', `${fmt(profile.weightKg)} kg`, 'Peso'],
    ['heightCm', `${(profile.heightCm / 100).toFixed(2).replace('.', ',')} m`, 'Altura'],
  ]
  const rows: [FieldKey, string, string][] = [
    ['goal', 'Objetivo', GOAL_LABEL[profile.goal]],
    ['level', 'Nível', LEVEL_LABEL[profile.level]],
    ['daysPerWeek', 'Dias por semana', String(profile.daysPerWeek)],
    ['location', 'Local', PLACE_LABEL[profile.location]],
    ['restrictions', 'Restrições', restrictionsText(profile)],
  ]
  const outdated = plan.basedOn !== profileSignature(profile)

  return (
    <TabScreen gap={18}>
      <header className="row" style={{ gap: 16 }}>
        <div className="avatar" aria-hidden="true">{user.name[0].toUpperCase()}</div>
        <div className="col" style={{ gap: 4, minWidth: 0 }}>
          <h1 className="h-screen">{user.name}</h1>
          <span className="small muted">Plano ativo: {SPLIT_LABEL[plan.splitType]}</span>
        </div>
      </header>

      <section aria-label="Medidas" className="tiles">
        {tiles.map(([key, value, label]) => (
          <button key={key} type="button" className="tile" aria-label={`${label}: ${value}. Editar`} onClick={() => setEditing(key)}>
            <strong>{value}</strong>
            <span>{label}</span>
          </button>
        ))}
      </section>

      <section aria-label="Preferências de treino" className="card col" style={{ padding: '4px 20px' }}>
        {rows.map(([key, label, value]) => (
          <button key={key} type="button" className="pref-row" onClick={() => setEditing(key)}>
            <span className="muted" style={{ fontSize: 14, flexShrink: 0 }}>{label}</span>
            <span className="row" style={{ gap: 8, fontWeight: 600 }}>
              {value}
              <Icon name="chevron" size={16} stroke={2.2} color="var(--muted)" />
            </span>
          </button>
        ))}
      </section>

      {outdated && <p className="notice" role="status">Suas preferências mudaram desde que o plano foi gerado. Gere um novo plano para aplicar as mudanças.</p>}

      <div className="grow" />

      {confirm ? (
        <div className="card col" style={{ gap: 12 }}>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>O plano atual será substituído por um novo, montado com as suas preferências. Seu histórico de treinos continua salvo.</p>
          <button type="button" className="btn" style={{ minHeight: 52 }} onClick={() => { generatePlan(); setConfirm(false); nav('/plano-pronto') }}>Gerar novo plano</button>
          <button type="button" className="btn-text" onClick={() => setConfirm(false)}>Manter o plano atual</button>
        </div>
      ) : (
        <button type="button" className="btn btn-outline" onClick={() => setConfirm(true)}>Gerar novo plano</button>
      )}
      <button type="button" className="btn-text" onClick={() => { signOut(); nav('/', { replace: true }) }}>Sair da conta</button>

      {deleting === 'no' ? (
        <button type="button" className="btn-text" style={{ color: 'var(--danger)', marginTop: -14 }} onClick={() => setDeleting('ask')}>Excluir conta</button>
      ) : (
        <div className="card col" style={{ gap: 12, borderColor: '#5a2a24' }}>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>Excluir a conta apaga para sempre o seu perfil, os planos e todo o histórico de treinos. Não dá para desfazer.</p>
          {deleteError && <p className="error" role="alert">{deleteError}</p>}
          <button
            type="button"
            className="btn"
            style={{ minHeight: 52, background: 'var(--danger)' }}
            disabled={deleting === 'busy'}
            onClick={async () => {
              setDeleting('busy')
              const err = await deleteAccount()
              if (err) {
                setDeleteError(err)
                setDeleting('ask')
              } else nav('/', { replace: true })
            }}
          >
            {deleting === 'busy' ? 'Excluindo…' : 'Excluir minha conta e meus dados'}
          </button>
          <button type="button" className="btn-text" onClick={() => { setDeleting('no'); setDeleteError('') }}>Cancelar</button>
        </div>
      )}

      {editing && <EditSheet field={editing} profile={profile} onClose={() => setEditing(null)} />}
    </TabScreen>
  )
}
