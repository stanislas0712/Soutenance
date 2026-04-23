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
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F0F4F8',
      padding: '24px 16px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* Carte deux colonnes */}
      <div style={{
        width: '100%', maxWidth: 900,
        display: 'flex',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        minHeight: 520,
      }}>

        {/* ── Colonne gauche : image ── */}
        <div style={{
          flex: 1,
          position: 'relative',
          minHeight: 480,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          overflow: 'hidden',
        }}>
          <img
            src="/gestion.jpg"
            alt="Gestion Budgétaire"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          />
          {/* Dégradé bleu léger en bas pour lisibilité du texte */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(13,27,75,0.72) 0%, rgba(13,27,75,0.15) 55%, transparent 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '32px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img src="/budget.jpg" alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', letterSpacing: '-.01em' }}>
                Gestion <span style={{ fontWeight: 800 }}>Budgétaire</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', margin: 0, lineHeight: 1.5 }}>
              Plateforme de suivi et de gestion des budgets
            </p>
          </div>
        </div>

        {/* ── Colonne droite : formulaire bleu ── */}
        <div style={{
          width: 380,
          flexShrink: 0,
          background: '#2196F3',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '48px 40px',
        }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: '#FFFFFF', marginBottom: 6, letterSpacing: '-.02em' }}>
            Vous avez déjà un compte ?
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginBottom: 32, lineHeight: 1.5 }}>
            Connectez-vous pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.7)', pointerEvents: 'none' }} />
                <input
                  id="email" type="email" required autoComplete="email" autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Nom d'utilisateur / adresse email"
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '1.5px solid rgba(255,255,255,0.55)',
                    padding: '8px 0 8px 24px',
                    color: '#FFFFFF', fontSize: 13,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = '#FFFFFF'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.55)'}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.7)', pointerEvents: 'none' }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mot de passe"
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '1.5px solid rgba(255,255,255,0.55)',
                    padding: '8px 36px 8px 24px',
                    color: '#FFFFFF', fontSize: 13,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = '#FFFFFF'}
                  onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.55)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center' }}
                >
                  {showPwd ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div role="alert" style={{ marginBottom: 16, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton Connexion */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0',
                background: '#FFFFFF', color: '#1565C0',
                border: '2px solid #FFFFFF', borderRadius: 50,
                fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 20, opacity: loading ? 0.8 : 1,
                transition: 'background .2s, color .2s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF' } }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#1565C0' }}
            >
              {loading
                ? <><span className="spinner-sm" style={{ borderColor: '#1565C0', borderTopColor: 'transparent' }} /> Connexion…</>
                : <>Connexion <ArrowRight size={14} strokeWidth={2.5} /></>
              }
            </button>

            {/* Mot de passe oublié */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Vous avez oublié votre mot de passe ?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
