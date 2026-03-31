import { useScrollAnimation } from '../hooks/useScrollAnimation'

const SECURITY_ITEMS = [
  {
    emoji: '🔑',
    title: 'Authentification JWT',
    description: 'Tokens sécurisés avec expiration automatique et refresh token. Accès révocable à tout moment.',
  },
  {
    emoji: '🛡️',
    title: 'Contrôle d\'accès granulaire',
    description: 'Trois rôles distincts (Admin, Gestionnaire, Comptable) avec permissions précises sur chaque ressource.',
  },
  {
    emoji: '📝',
    title: 'Journal d\'audit complet',
    description: 'Traçabilité de toutes les opérations : création, modification, validation, suppression. Horodatées et immuables.',
  },
  {
    emoji: '🔒',
    title: 'Chiffrement des données',
    description: 'Données chiffrées en transit (HTTPS/TLS) et au repos. Pièces justificatives stockées de manière sécurisée.',
  },
  {
    emoji: '💾',
    title: 'Sauvegardes automatiques',
    description: 'Base de données sauvegardée automatiquement. Données persistantes et récupérables en cas d\'incident.',
  },
]

export default function Securite() {
  const [ref, visible] = useScrollAnimation(0.1)

  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1C1917 0%, #252120 55%, #2E2A27 100%)' }}
      aria-labelledby="securite-title"
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,.08) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#D4B355' }}>
            Sécurité & Conformité
          </p>
          <h2 id="securite-title" className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Vos données en sécurité
          </h2>
          <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(250,247,242,0.65)' }}>
            BudgetFlow est conçu avec la sécurité au cœur de son architecture.
            Confidentialité, intégrité et disponibilité garanties.
          </p>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {SECURITY_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`text-center p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{
                background: 'rgba(255,255,255,0.05)',
                transitionDelay: `${i * 0.08}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-hidden="true"
              >
                {item.emoji}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 leading-tight">{item.title}</h3>
              <p className="text-xs leading-relaxed m-0" style={{ color: 'rgba(250,247,242,0.55)' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
