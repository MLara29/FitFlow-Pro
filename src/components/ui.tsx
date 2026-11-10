import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const PATHS = {
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  workouts: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />,
  progress: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  down: <path d="M6 9l6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  flame: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
}

export function Icon({ name, size = 22, stroke = 2, color = 'currentColor' }: { name: keyof typeof PATHS; size?: number; stroke?: number; color?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {PATHS[name]}
    </svg>
  )
}

const TABS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/treinos', label: 'Treinos', icon: 'workouts' },
  { to: '/progresso', label: 'Progresso', icon: 'progress' },
  { to: '/perfil', label: 'Perfil', icon: 'profile' },
] as const

/** Tela com navegação inferior. */
export function TabScreen({ children, gap = 20 }: { children: ReactNode; gap?: number }) {
  return (
    <div className="screen">
      <main className="page" style={{ gap }}>
        {children}
      </main>
      <nav className="tabbar" aria-label="Navegação principal">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className="tab">
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function BackButton({ label = 'Voltar', onClick }: { label?: string; onClick?: () => void }) {
  const nav = useNavigate()
  return (
    <button type="button" className="icon-btn" aria-label={label} onClick={onClick ?? (() => nav(-1))}>
      <Icon name="back" stroke={2.2} />
    </button>
  )
}

/** URLs relativas apontam para a pasta public/ do app; absolutas (GIFs hospedados) passam direto. */
export const mediaSrc = (url: string) => (/^(https?:)?\/\//.test(url) ? url : import.meta.env.BASE_URL + url.replace(/^\//, ''))
