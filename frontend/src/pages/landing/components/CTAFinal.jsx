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
      style={{ background: 'linear-gradient(160deg, #EEF2F8 0%, #EDE9E3 50%, #EEF2F8 100%)' }}
    >
      {/* Déco */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: 'rgba(201,168,76,.06)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" style={{ background: 'rgba(201,168,76,.04)' }} />

      <div
        ref={ref}
        className={`max-w-5xl mx-auto relative z-10 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 56 }}>

          {/* Texte gauche */}
          <div style={{ flex: '1 1 380px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#B8973F', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14 }}>
              Prêt à commencer ?
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 700, color: '#1E3A5F', lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 16, fontFamily: 'Lora, Georgia, serif' }}>
              Accédez à votre espace<br />de gestion budgétaire
            </h2>
            <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.7, marginBottom: 28 }}>
              Gestion Budgétaire centralise l'ensemble de vos processus financiers —
              de l'allocation des budgets au suivi des dépenses en passant
              par la validation et les analyses IA.
            </p>
            <a
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'linear-gradient(135deg, #292524, #1E3A5F)',
                color: '#F8FAFC', fontWeight: 700, fontSize: 15,
                padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
                boxShadow: '0 4px 18px rgba(15,34,64,.25)',
                transition: 'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,34,64,.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,34,64,.25)' }}
            >
              Se connecter <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>

          {/* Points droite */}
          <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {POINTS.map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                  background: '#FFFFFF', border: '1.5px solid #E7E5E4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(15,34,64,.06)',
                }}>
                  <Icon size={18} strokeWidth={2} color="#B8973F" />
                </div>
                <span style={{ fontSize: 14, color: '#1E3A5F', fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
