import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Eye, EyeOff, Mail, Lock, Wallet,
  TrendingUp, CheckCircle2, Bell, ArrowRight,
} from 'lucide-react'

const FEATURES = [
  { Icon: TrendingUp,   text: 'Suivi en temps réel des consommations'  },
  { Icon: CheckCircle2, text: 'Workflow de validation multi-niveaux'   },
  { Icon: Bell,         text: 'Alertes automatiques de dépassement'    },
]

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch {
      setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Roboto, system-ui, sans-serif' }}>

      {/* ── Panneau gauche — illustration ─────────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 40%, #EFF6FF 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercles déco */}
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            boxShadow: '0 4px 16px rgba(59,130,246,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={21} strokeWidth={2.5} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 19, color: '#1E3A8A', letterSpacing: '-.4px' }}>BudgetFlow</div>
            <div style={{ fontSize: 9, color: '#93C5FD', letterSpacing: '.8px', textTransform: 'uppercase', marginTop: 1 }}>GESTION BUDGÉTAIRE</div>
          </div>
        </div>

        {/* Image africaine */}
        <div style={{ position: 'relative', marginBottom: 40 }}>
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&q=80"
            alt="Professionnelle africaine en bureau"
            style={{
              width: '100%', maxWidth: 400,
              aspectRatio: '4/3', objectFit: 'cover',
              borderRadius: 20,
              boxShadow: '0 16px 48px rgba(59,130,246,.18)',
              border: '3px solid #fff',
            }}
          />
          {/* Badge flottant */}
          <div style={{
            position: 'absolute', bottom: -14, right: 16,
            background: '#fff', borderRadius: 12, padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,.1)',
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #F3F4F6',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
              BDG-2025-001 approuvé
            </span>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{
          fontWeight: 900, color: '#1E3A8A',
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
          lineHeight: 1.2, letterSpacing: '-.03em', marginBottom: 14,
        }}>
          Planifiez.<br />
          Dépensez.<br />
          <span style={{ color: '#2563EB' }}>Maîtrisez.</span>
        </h2>

        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 380, marginBottom: 28 }}>
          Plateforme de gestion budgétaire collaborative pour les institutions publiques du Burkina Faso.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} strokeWidth={2} color="#2563EB" />
              </div>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 40, fontSize: 11, color: '#9CA3AF' }}>
          © 2025 BudgetFlow — Accès réservé aux utilisateurs autorisés
        </div>
      </div>

      {/* ── Panneau droit — formulaire ──────────────────────────────────── */}
      <div style={{
        width: 500, flexShrink: 0,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
        borderLeft: '1px solid #F3F4F6',
        boxShadow: '-4px 0 24px rgba(0,0,0,.04)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontWeight: 900, fontSize: 26, color: '#111827',
              letterSpacing: '-.04em', marginBottom: 8,
            }}>
              Connexion
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
              Accédez à votre espace de gestion budgétaire
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label className="form-label" htmlFor="email">
                Adresse email <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} strokeWidth={1.8} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#9CA3AF', pointerEvents: 'none',
                }} />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="votre@email.bf"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 40, height: 44 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label className="form-label" htmlFor="password">
                Mot de passe <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} strokeWidth={1.8} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#9CA3AF', pointerEvents: 'none',
                }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 40, paddingRight: 44, height: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: '#9CA3AF', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Se souvenir + mot de passe oublié */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: -10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  style={{
                    width: 15, height: 15, borderRadius: 4, cursor: 'pointer',
                    accentColor: '#2563EB',
                  }}
                />
                <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>Se souvenir de moi</span>
              </label>
              <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, cursor: 'default' }}>
                Contactez l'admin
              </span>
            </div>

            {/* Erreur */}
            {error && (
              <div role="alert" className="alert alert-error" style={{ marginBottom: 20 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', gap: 8, fontWeight: 700 }}
            >
              {loading ? (
                <><span className="spinner-sm" /> Connexion en cours…</>
              ) : (
                <>Se connecter <ArrowRight size={16} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 28,
            fontSize: 12, color: '#9CA3AF', lineHeight: 1.6,
          }}>
            Accès réservé aux utilisateurs autorisés.<br />
            Contactez votre administrateur pour tout problème de connexion.
          </p>
        </div>
      </div>
    </div>
  )
}
