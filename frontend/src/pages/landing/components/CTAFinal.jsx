import { useScrollAnimation } from '../hooks/useScrollAnimation'

const TRUST_BADGES = [
  'Essai 30 jours gratuit',
  'Sans carte bancaire',
  'Support en français',
]

export default function CTAFinal() {
  const [ref, visible] = useScrollAnimation(0.1)

  return (
    <div
      className="py-24 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={`max-w-3xl mx-auto text-center text-white relative z-10 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        aria-labelledby="cta-title"
      >
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span>🚀</span>
          <span>Rejoignez 500+ entreprises qui nous font confiance</span>
        </div>

        {/* Heading */}
        <h2 id="cta-title" className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight leading-tight">
          Prêt à transformer votre gestion budgétaire ?
        </h2>

        {/* Subtitle */}
        <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto leading-relaxed">
          Commencez votre essai gratuit dès aujourd'hui. Aucune carte bancaire requise,
          une configuration en moins de 10 minutes et un support dédié en français.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <a
            href="/login"
            className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl text-base hover:bg-blue-50 transition-all hover:scale-105 shadow-lg no-underline inline-flex items-center gap-2"
          >
            Se connecter →
          </a>
          <a
            href="#how-it-works"
            className="border-2 border-white/50 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-base transition-all no-underline inline-flex items-center gap-2 hover:bg-white/10"
          >
            <span>▶</span> Découvrir la plateforme
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm" aria-label="Garanties">
          {TRUST_BADGES.map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <span className="text-green-300 font-bold" aria-hidden="true">✓</span>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
