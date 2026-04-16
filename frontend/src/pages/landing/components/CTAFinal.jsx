import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { ArrowRight, CheckCircle2, Shield, TrendingUp } from 'lucide-react'

const POINTS = [
  { Icon: CheckCircle2, text: 'Workflow de validation multi-niveaux'   },
  { Icon: Shield,       text: 'Traçabilité complète via journal d\'audit' },
  { Icon: TrendingUp,   text: 'Tableaux de bord et rapports IA intégrés' },
]

export default function CTAFinal() {
  const [ref, visible] = useScrollAnimation(0.1)

  return (
    <div
      className="py-20 px-6 relative overflow-hidden"
      style={{ background: '#F8FAFC' }}
    >
      <div
        ref={ref}
        className={`max-w-5xl mx-auto relative z-10 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 56 }}>

          {/* Texte gauche */}
          <div style={{ flex: '1 1 380px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#C9910A', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14 }}>
              Prêt à commencer ?
            </p>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 700, color: '#1E3A8A',
              lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 16,
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            }}>
              Accédez à votre espace<br />de gestion budgétaire
            </h2>
            <p style={{ fontSize: 15, color: '#57616E', lineHeight: 1.7, marginBottom: 28 }}>
              Gestion Budgétaire centralise l'ensemble de vos processus financiers —
              de l'allocation des budgets au suivi des dépenses en passant
              par la validation et les analyses IA.
            </p>
            <a
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: '#1E3A8A',
                color: '#FFFFFF', fontWeight: 700, fontSize: 15,
                padding: '0 32px', height: '44px', borderRadius: 8, textDecoration: 'none',
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#172872' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E3A8A' }}
            >
              Se connecter <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>

          {/* Points droite */}
          <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {POINTS.map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                  background: '#FFFFFF', border: '1.5px solid #D1D8E0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} strokeWidth={2} color="#C9910A" />
                </div>
                <span style={{ fontSize: 14, color: '#1E3A8A', fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
