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
      style={{ background: 'linear-gradient(135deg, #0F2547 0%, #1E3A8A 60%, #1D4ED8 100%)' }}
      aria-labelledby="securite-title"
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,.1) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
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
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest mb-4">
            Sécurité & Conformité
          </p>
          <h2 id="securite-title" className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Vos données en sécurité
          </h2>
          <p className="text-lg text-blue-200/80 max-w-xl mx-auto leading-relaxed">
            BudgetFlow est conçu avec la sécurité au cœur de son architecture.
            Confidentialité, intégrité et disponibilité garanties.
          </p>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {SECURITY_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`text-center p-6 rounded-2xl border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{
                background: 'rgba(255,255,255,0.05)',
                transitionDelay: `${i * 0.08}s`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-hidden="true"
              >
                {item.emoji}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 leading-tight">{item.title}</h3>
              <p className="text-xs text-blue-200/70 leading-relaxed m-0">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
