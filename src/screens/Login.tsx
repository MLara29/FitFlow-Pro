import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONFIRM_EMAIL, REMOTE, confirmSignUp, resetPassword, sendPasswordReset, setNewPassword, signIn, signOut, signUp } from '../lib/store'

type Mode = 'login' | 'signup' | 'confirm' | 'forgot' | 'reset'

const TITLE: Record<Mode, string> = {
  login: 'Entrar',
  signup: 'Criar conta',
  confirm: 'Confirme seu e-mail',
  forgot: 'Redefinir senha',
  reset: 'Nova senha',
}
const SUBMIT: Record<Mode, string> = {
  login: 'Entrar',
  signup: 'Criar conta',
  confirm: 'Confirmar e entrar',
  forgot: 'Enviar e-mail',
  reset: 'Salvar nova senha',
}

function Shell({ children, onSubmit }: { children: ReactNode; onSubmit: (e: FormEvent) => void }) {
  return (
    <div className="screen login">
      <img className="login-hero" src={`${import.meta.env.BASE_URL}media/login-hero.jpg`} alt="FitFlow Pro: um homem e uma mulher treinando com halteres na academia" />
      <div className="login-fade" aria-hidden="true" />
      <form className="login-form" onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </div>
  )
}

export default function Login() {
  const nav = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const go = (next: Mode, message = '') => {
    setMode(next)
    setError('')
    setNotice(message)
    setCode('')
    if (next !== 'login') setPassword('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'forgot') {
        const err = await sendPasswordReset(email)
        if (err) return setError(err)
        return go('reset', 'Enviamos um e-mail de redefinição. Digite abaixo o código que está nele e a nova senha. Se o e-mail trouxer só um link, abra o link neste mesmo aparelho.')
      }
      const err =
        mode === 'signup' ? await signUp(name, email, password)
        : mode === 'confirm' ? await confirmSignUp(email, code)
        : mode === 'reset' ? await resetPassword(email, code, password)
        : await signIn(email, password)
      if (err === CONFIRM_EMAIL) return go('confirm', 'Conta criada. Enviamos um e-mail de confirmação: digite o código que está nele. Se o e-mail trouxer só um link, clique nele e depois entre com a sua senha.')
      if (err) return setError(err)
      nav('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  const showEmail = mode === 'login' || mode === 'signup' || mode === 'forgot'
  const showPassword = mode === 'login' || mode === 'signup' || mode === 'reset'
  const showCode = mode === 'confirm' || mode === 'reset'
  const newPassword = mode !== 'login'

  return (
    <Shell onSubmit={submit}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 2 }}>{TITLE[mode]}</h1>
      {notice && <p className="notice" role="status">{notice}</p>}
      {mode === 'forgot' && <p className="small muted" style={{ lineHeight: 1.5 }}>Informe o e-mail da sua conta para receber as instruções.</p>}
      {mode === 'signup' && (
        <div className="field">
          <label htmlFor="login-nome">Nome</label>
          <input id="login-nome" className="input" autoComplete="given-name" placeholder="Como quer ser chamado" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      {showEmail && (
        <div className="field">
          <label htmlFor="login-email">E-mail</label>
          <input id="login-email" className="input" type="email" autoComplete="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      )}
      {showCode && (
        <div className="field">
          <label htmlFor="login-codigo">Código do e-mail</label>
          <input id="login-codigo" className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="Ex.: 123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} />
        </div>
      )}
      {showPassword && (
        <div className="field">
          <div className="between">
            <label htmlFor="login-senha">{mode === 'reset' ? 'Nova senha' : 'Senha'}</label>
            {mode === 'login' && (
              <button type="button" className="small accent" style={{ border: 0, background: 'none', padding: 0, fontWeight: 600 }} onClick={() => (REMOTE ? go('forgot') : setNotice('No modo local as contas ficam salvas só neste aparelho, então não há como recuperar a senha por e-mail. Crie uma nova conta para continuar.'))}>
                Esqueci a senha
              </button>
            )}
          </div>
          <input id="login-senha" className="input" type="password" autoComplete={newPassword ? 'new-password' : 'current-password'} placeholder={newPassword ? 'Mínimo de 6 caracteres' : 'Sua senha'} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn" style={{ marginTop: 4 }} disabled={busy}>{busy ? 'Aguarde…' : SUBMIT[mode]}</button>
      {mode === 'login' || mode === 'signup' ? (
        <button type="button" className="btn-text" style={{ fontWeight: 400 }} onClick={() => go(mode === 'signup' ? 'login' : 'signup')}>
          {mode === 'signup' ? 'Já tem conta? ' : 'Ainda não tem conta? '}
          <span className="accent" style={{ fontWeight: 700 }}>{mode === 'signup' ? 'Entrar' : 'Criar conta'}</span>
        </button>
      ) : (
        <button type="button" className="btn-text" onClick={() => go('login')}>Voltar para o login</button>
      )}
      {!REMOTE && <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>Modo local: os dados ficam salvos só neste aparelho.</p>}
    </Shell>
  )
}

/** Mostrada a quem abriu o link de redefinição de senha do e-mail. */
export function NewPassword() {
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const err = await setNewPassword(password)
    setBusy(false)
    if (err) return setError(err)
    nav('/', { replace: true })
  }

  return (
    <Shell onSubmit={submit}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 2 }}>Nova senha</h1>
      <div className="field">
        <label htmlFor="nova-senha">Nova senha</label>
        <input id="nova-senha" className="input" type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn" style={{ marginTop: 4 }} disabled={busy}>{busy ? 'Aguarde…' : 'Salvar nova senha'}</button>
      <button type="button" className="btn-text" onClick={() => signOut()}>Sair</button>
    </Shell>
  )
}
