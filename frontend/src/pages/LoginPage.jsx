import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, TrendingUp, CheckCircle, Bell, Wallet } from 'lucide-react'

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
    <div className="min-h-screen flex bg-[#0F172A]">
      {/* ── Panneau gauche — branding ────────────────────────────────── */}
      <div
        className="login-left flex-1 flex flex-col justify-center px-[72px] py-[64px] relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F2547 0%, #1E3A8A 60%, #1D4ED8 100%)' }}
      >
        {/* Cercles décoratifs */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: -120, right: -120, width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(59,130,246,.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: -80, left: -80, width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(99,102,241,.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div
            className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              boxShadow: '0 4px 16px rgba(59,130,246,.4)',
            }}
          >
            <Wallet size={22} strokeWidth={2.5} color="#fff" />
          </div>
          <div>
            <div className="font-extrabold text-[18px] text-white tracking-[-0.4px]">
              BudgetFlow
            </div>
            <div className="text-[10px] text-white/40 tracking-[.8px] mt-[1px]">
              GESTION BUDGÉTAIRE
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="font-extrabold text-white mb-[18px] tracking-[-0.04em]"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.6rem)', lineHeight: 1.15 }}
        >
          Planifiez.<br />
          Dépensez.<br />
          <span className="text-[#93C5FD]">Maîtrisez.</span>
        </h1>

        <p className="text-[15px] text-white/60 leading-[1.7] max-w-[400px] mb-[52px]">
          Plateforme de gestion budgétaire collaborative — allocation, validation,
          suivi de consommation et alertes intelligentes en temps réel.
        </p>

        {/* Features */}
        {[
          { Icon: TrendingUp,   text: 'Suivi en temps réel des consommations' },
          { Icon: CheckCircle,  text: 'Workflow de validation multi-niveaux' },
          { Icon: Bell,         text: 'Alertes automatiques de dépassement' },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-[14px] mb-[18px]">
            <div
              className="w-9 h-9 rounded-[9px] shrink-0 flex items-center justify-center bg-[rgba(59,130,246,.2)]"
            >
              <Icon size={16} strokeWidth={2} color="#93C5FD" />
            </div>
            <span className="text-[14px] text-white/75 font-medium">{text}</span>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-auto pt-12 text-[12px] text-white/25">
          © 2026 BudgetFlow — Accès réservé aux utilisateurs autorisés
        </div>
      </div>

      {/* ── Panneau droit — formulaire ────────────────────────────────── */}
      <div className="w-[480px] shrink-0 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Header form */}
          <div className="mb-9">
            <h2 className="font-extrabold text-[26px] text-[#111827] tracking-[-0.04em] mb-2">
              Connexion
            </h2>
            <p className="text-[14px] text-[#6B7280] leading-[1.5]">
              Accédez à votre espace de gestion budgétaire
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-[18px]">
              <label className="form-label" htmlFor="email">
                Adresse email
                <span className="required" aria-hidden="true"> *</span>
              </label>
              <div className="relative">
                <Mail
                  size={16} strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="votre@email.com"
                  className={`form-input pl-[40px] pr-[12px] h-[44px]${error ? ' error' : ''}`}
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={!!error}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-7">
              <label className="form-label" htmlFor="password">
                Mot de passe
                <span className="required" aria-hidden="true"> *</span>
              </label>
              <div className="relative">
                <Lock
                  size={16} strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`form-input pl-[40px] pr-[44px] h-[44px]${error ? ' error' : ''}`}
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center p-1 text-[#9CA3AF]"
                >
                  {showPwd ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div
                id="login-error"
                role="alert"
                className="alert alert-error mb-5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 mt-[1px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center font-bold"
            >
              {loading ? (
                <>
                  <span className="spinner-sm" aria-hidden="true" />
                  Connexion en cours…
                </>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="text-center mt-8 text-[12px] text-[#9CA3AF] leading-[1.5]">
            Accès réservé aux utilisateurs autorisés.<br />
            Contactez votre administrateur pour tout problème de connexion.
          </p>
        </div>
      </div>
    </div>
  )
}
