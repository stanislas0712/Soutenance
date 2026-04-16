import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forgotPassword } from '../api/accounts'
import {
  Eye, EyeOff, Mail, Lock, X, KeyRound, ArrowRight,
  TrendingUp, CheckCircle2, Bell,
} from 'lucide-react'

const FEATURES = [
  { Icon: TrendingUp,   text: 'Suivi en temps réel des consommations'  },
  { Icon: CheckCircle2, text: 'Workflow de validation multi-niveaux'   },
  { Icon: Bell,         text: 'Alertes automatiques de dépassement'    },
]

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
      background: 'rgba(13,34,64,.55)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn .15s ease',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(13,34,64,.18)',
        border: '1px solid #D1D8E0',
        overflow: 'hidden',
        animation: 'scaleIn .2s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Header */}
        <div style={{
          background: '#1E3A8A',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <KeyRound size={15} strokeWidth={1.8} color="#C9910A" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Mot de passe oublié
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 1 }}>
                Un lien vous sera envoyé par email
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(255,255,255,.1)', border: 'none',
              color: 'rgba(255,255,255,.7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#D4EDDA', border: '2px solid #1B7C3E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <span style={{ fontSize: 20 }}>✉️</span>
              </div>
              <p style={{ fontSize: 14, color: '#0D1B2A', fontWeight: 600, marginBottom: 6 }}>Email envoyé !</p>
              <p style={{ fontSize: 13, color: '#3D5166', lineHeight: 1.7, marginBottom: 20 }}>
                Si un compte correspond à cet email, vous recevrez un lien de réinitialisation.
                Vérifiez également vos spams.
              </p>
              <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p style={{ fontSize: 13, color: '#3D5166', lineHeight: 1.7, marginBottom: 20 }}>
                Entrez l'adresse email associée à votre compte.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="forgot-email">
                  Adresse email <span style={{ color: '#C0392B' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A8FA6', pointerEvents: 'none' }} />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
              {error && (
                <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  Annuler
                </button>
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
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
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
      if (err?.response?.status === 403) {
        setError(detail || 'Compte bloqué après 3 tentatives. Contactez votre administrateur.')
      } else {
        setError(detail || 'Email ou mot de passe incorrect. Vérifiez vos identifiants.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'IBM Plex Sans, system-ui, sans-serif', background: '#F8FAFC' }}>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* ── Panneau gauche — illustration ─────────────────────────────── */}
      <div className="login-left" style={{
        flex: 1,
        background: '#1E3A8A',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '56px 64px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Déco cercles subtils */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(26,58,107,.5)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(27,124,62,.12)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <img src="/budget.jpg" alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 17, color: '#F0F5FF' }}>Gestion Budgétaire</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 1 }}>
              Plateforme institutionnelle
            </div>
          </div>
        </div>

        {/* Image */}
        <div style={{ position: 'relative', marginBottom: 36 }}>
          <img
            src="/gestion.jpg"
            alt="Professionnel en bureau"
            style={{
              width: '100%', maxWidth: 380,
              aspectRatio: '4/3', objectFit: 'cover',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,.08)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: -12, right: 16,
            background: '#fff', borderRadius: 8, padding: '8px 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #D1D8E0',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1B7C3E', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1B7C3E', whiteSpace: 'nowrap' }}>
              BDG-2025-001 approuvé
            </span>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{
          fontWeight: 600, color: '#F0F5FF',
          fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)',
          lineHeight: 1.25, marginBottom: 12,
        }}>
          Planifiez.<br />
          Dépensez.<br />
          <span style={{ color: '#C9910A' }}>Maîtrisez.</span>
        </h2>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, maxWidth: 360, marginBottom: 28 }}>
          Plateforme de gestion budgétaire collaborative pour les institutions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(201,145,10,.15)', border: '1px solid rgba(201,145,10,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} strokeWidth={1.8} color="#C9910A" />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', fontWeight: 400 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 40, fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
          © 2025 Gestion Budgétaire — Accès réservé aux utilisateurs autorisés
        </div>
      </div>

      {/* ── Panneau droit — formulaire ──────────────────────────────────── */}
      <div style={{
        width: 480, flexShrink: 0,
        background: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
        borderLeft: '1px solid #D1D8E0',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 600, fontSize: 22, color: '#0D1B2A', marginBottom: 6, letterSpacing: '-.01em' }}>
              Connexion
            </h2>
            <p style={{ fontSize: 13, color: '#3D5166', lineHeight: 1.55 }}>
              Accédez à votre espace de gestion budgétaire
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="email">
                Adresse email <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A8FA6', pointerEvents: 'none' }} />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="votre@email.com"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="password">
                Mot de passe <span style={{ color: '#C0392B' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A8FA6', pointerEvents: 'none' }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 38, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: '#7A8FA6', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Se souvenir + mot de passe oublié */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" style={{ width: 15, height: 15, borderRadius: 4, cursor: 'pointer', accentColor: '#1D4ED8' }} />
                <span style={{ fontSize: 13, color: '#3D5166' }}>Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div role="alert" className="alert alert-error" style={{ marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit — 44px minimum (WCAG 2.5.5) */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md"
              style={{ width: '100%', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <><span className="spinner-sm" /> Connexion en cours…</>
              ) : (
                <>Se connecter <ArrowRight size={14} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#7A8FA6', lineHeight: 1.6 }}>
            Accès réservé aux utilisateurs autorisés.<br />
            Contactez votre administrateur pour tout problème.
          </p>
        </div>
      </div>
    </div>
  )
}
