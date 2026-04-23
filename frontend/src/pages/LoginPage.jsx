import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forgotPassword } from '../api/accounts'
import { Eye, EyeOff, Mail, Lock, X, KeyRound, ArrowRight } from 'lucide-react'

/* ── Modal Mot de passe oublié ───────────────────────────────────────────── */
function ForgotPasswordModal({ onClose }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Veuillez entrer votre adresse email.'); return }
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setDone(true)
    } catch {
      setError("Une erreur s'est produite. Réessayez ou contactez l'administrateur.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(13,34,64,.55)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn .15s ease',
    }}>
      <div style={{
        background: '#FFF', borderRadius: 16, width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(13,34,64,.18)', border: '1px solid #D1D8E0',
        overflow: 'hidden', animation: 'scaleIn .2s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Header */}
        <div style={{ background: '#1E3A8A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={15} strokeWidth={1.8} color="#C9910A" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#FFF' }}>Mot de passe oublié</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 1 }}>Un lien vous sera envoyé par email</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,.1)', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#D4EDDA', border: '2px solid #1B7C3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20 }}>✉️</div>
              <p style={{ fontSize: 14, color: '#0D1B2A', fontWeight: 600, marginBottom: 6 }}>Email envoyé !</p>
              <p style={{ fontSize: 13, color: '#3D5166', lineHeight: 1.7, marginBottom: 20 }}>
                Si un compte correspond à cet email, vous recevrez un lien de réinitialisation. Vérifiez vos spams.
              </p>
              <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Fermer</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p style={{ fontSize: 13, color: '#3D5166', lineHeight: 1.7, marginBottom: 20 }}>
                Entrez l'adresse email associée à votre compte.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="forgot-email">Adresse email <span style={{ color: '#C0392B' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A8FA6', pointerEvents: 'none' }} />
                  <input id="forgot-email" type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="form-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>
              {error && (
                <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm" style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? <><span className="spinner-sm" /> Envoi…</> : 'Envoyer le lien'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Page Login ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form,       setForm]       = useState({ email: '', password: '' })
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(
        err?.response?.status === 403
          ? detail || 'Compte bloqué après 3 tentatives. Contactez votre administrateur.'
          : detail || 'Email ou mot de passe incorrect. Vérifiez vos identifiants.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Fond dégradé bleu */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #0D1B4B 0%, #1E3A8A 40%, #2563EB 75%, #3B82F6 100%)',
      }} />
      {/* Effet de lumière subtil */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 60% 20%, rgba(96,165,250,0.25) 0%, transparent 60%)',
      }} />

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* Carte formulaire */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.1) inset',
        overflow: 'hidden',
        position: 'relative', zIndex: 1,
      }}>

        {/* Header navy */}
        <div style={{
          background: '#1E3A8A',
          padding: '28px 32px 24px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <img src="/budget.jpg" alt="Gestion Budgétaire" style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#F0F5FF', letterSpacing: '-.01em' }}>
              Gestion <span style={{ fontWeight: 800 }}>Budgétaire</span>
            </span>
          </div>
          <h1 style={{ fontWeight: 700, fontSize: 20, color: '#FFFFFF', marginBottom: 6, letterSpacing: '-.02em' }}>
            Connexion
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: 0 }}>
            Accédez à votre espace de gestion budgétaire
          </p>
        </div>

        {/* Corps formulaire */}
        <div style={{ padding: '28px 32px 24px' }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="email">
                Adresse email <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  id="email" type="email" required autoComplete="email" autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="votre@email.com"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label" htmlFor="password">
                Mot de passe <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94A3B8', display: 'flex', alignItems: 'center' }}
                >
                  {showPwd ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{ fontSize: 12.5, color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div role="alert" className="alert alert-error" style={{ marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md"
              style={{ width: '100%', justifyContent: 'center', gap: 8 }}
            >
              {loading
                ? <><span className="spinner-sm" /> Connexion en cours…</>
                : <>Se connecter <ArrowRight size={14} strokeWidth={2.5} /></>
              }
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 32px 20px',
          textAlign: 'center',
          borderTop: '1px solid #F1F5F9',
        }}>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
            Accès réservé aux utilisateurs autorisés.<br />
            Contactez votre administrateur pour tout problème.
          </p>
        </div>
      </div>
    </div>
  )
}
