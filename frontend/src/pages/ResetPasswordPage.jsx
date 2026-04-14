import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle2, Wallet } from 'lucide-react'
import { resetPasswordConfirm } from '../api/accounts'

export default function ResetPasswordPage() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const uid            = params.get('uid')   || ''
  const token          = params.get('token') || ''

  const [pwd,     setPwd]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const invalidLink = !uid || !token

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (pwd.length < 4) { setError('Le mot de passe doit contenir au moins 4 caractères.'); return }
    if (pwd !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    try {
      await resetPasswordConfirm({ uid, token, new_password: pwd })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Lien invalide ou expiré. Refaites une demande.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F8', fontFamily: "'DM Sans', system-ui, sans-serif", padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(15,34,64,.07)', boxShadow: '0 12px 40px rgba(15,34,64,.1)', overflow: 'hidden' }}>

        {/* Bande dorée */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A84C, #D4B355)' }} />

        <div style={{ padding: '36px 40px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #C9A84C, #8A6B1E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(201,168,76,.35)' }}>
              <Wallet size={17} strokeWidth={2.5} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1E3A5F', fontFamily: 'Lora, Georgia, serif', letterSpacing: '-.2px' }}>Gestion Budgétaire</div>
              <div style={{ fontSize: 9, color: '#B8973F', letterSpacing: '.7px', textTransform: 'uppercase' }}>GESTION BUDGÉTAIRE</div>
            </div>
          </div>

          {invalidLink ? (
            <div>
              <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontWeight: 700, fontSize: 20, color: '#1E3A5F', marginBottom: 12 }}>Lien invalide</h2>
              <p style={{ fontSize: 14, color: '#57534E', lineHeight: 1.7, marginBottom: 24 }}>
                Ce lien de réinitialisation est manquant ou mal formé. Refaites une demande depuis la page de connexion.
              </p>
              <Link to="/login" className="btn btn-primary btn-md" style={{ textDecoration: 'none' }}>
                Retour à la connexion
              </Link>
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={48} color="#16A34A" strokeWidth={1.5} style={{ marginBottom: 16 }} />
              <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontWeight: 700, fontSize: 20, color: '#1E3A5F', marginBottom: 10 }}>Mot de passe mis à jour !</h2>
              <p style={{ fontSize: 14, color: '#57534E', lineHeight: 1.7, marginBottom: 28 }}>
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button onClick={() => navigate('/login')} className="btn btn-primary btn-md" style={{ width: '100%', justifyContent: 'center' }}>
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Lora, Georgia, serif', fontWeight: 700, fontSize: 20, color: '#1E3A5F', marginBottom: 6 }}>Nouveau mot de passe</h2>
                <p style={{ fontSize: 13.5, color: '#78716C', lineHeight: 1.6 }}>Choisissez un nouveau mot de passe pour votre compte.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Nouveau mot de passe */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Nouveau mot de passe <span style={{ color: '#E11D48' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', pointerEvents: 'none' }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={pwd}
                      onChange={e => setPwd(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: 38, paddingRight: 44, height: 44 }}
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', display: 'flex', alignItems: 'center', padding: 4 }}>
                      {showPwd ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label">Confirmer <span style={{ color: '#E11D48' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', pointerEvents: 'none' }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: 38, height: 44 }}
                    />
                  </div>
                </div>

                {error && (
                  <div role="alert" className="alert alert-error" style={{ marginBottom: 18 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary btn-md" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner-sm" /> Mise à jour…</> : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: 13, color: '#B8973F', fontWeight: 600, textDecoration: 'none' }}>← Retour à la connexion</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
