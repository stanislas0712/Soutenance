const TRUST_BADGES = [
  'Workflow de validation multi-niveaux',
  'Suivi en temps réel des consommations',
  'Traçabilité et journal d\'audit complet',
]

export default function Hero() {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hero-left { animation: fadeInUp 0.8s ease both; }
        .hero-right { animation: fadeInUp 0.8s ease 0.2s both; }
        .float-card-tr { animation: slideInRight 0.8s ease 0.4s both; }
        .float-card-bl { animation: slideInUp 0.8s ease 0.7s both; }
        .hero-image-float { animation: float 6s ease-in-out infinite; }
        .hero-cta-primary:hover { background: #172872 !important; }
        .hero-cta-secondary:hover { background: #F8FAFC !important; }
      `}</style>

      <section
        className="pt-24 pb-16 px-6 overflow-hidden"
        style={{ background: '#F8FAFC' }}
        aria-label="Section principale"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">

          {/* Left column */}
          <div className="w-full lg:w-3/5 hero-left">
            {/* H1 */}
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6"
              style={{ color: '#1E3A8A', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", letterSpacing: '-.5px' }}>
              La gestion budgétaire{' '}
              <span style={{ color: '#1B7C3E' }}>intelligente</span>{' '}
              pour les institutions publiques
            </h1>

            {/* Subtitle */}
            <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: '#57616E' }}>
              Plateforme de gestion budgétaire collaborative pour les ministères et organismes publics.
              Allocation, validation, suivi de consommation et alertes intelligentes en temps réel.
            </p>

            {/* Trust badges */}
            <ul className="flex flex-col gap-2 mb-8 list-none p-0 m-0" aria-label="Points clés">
              {TRUST_BADGES.map((text) => (
                <li key={text} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                  <span style={{ color: '#1B7C3E', fontWeight: 700 }} aria-hidden="true">✓</span>
                  {text}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="/login"
                className="hero-cta-primary text-white font-semibold px-8 rounded-lg text-base no-underline inline-flex items-center gap-2"
                style={{ background: '#1E3A8A', height: '44px', letterSpacing: '-.1px' }}
              >
                Accéder à la plateforme →
              </a>
              <a
                href="#how-it-works"
                className="hero-cta-secondary flex items-center gap-2 font-semibold px-8 rounded-lg text-base no-underline"
                style={{ border: '1.5px solid #D1D8E0', background: '#FFFFFF', color: '#374151', height: '44px' }}
                onClick={e => {
                  e.preventDefault()
                  const el = document.querySelector('#how-it-works')
                  if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 64; window.scrollTo({ top, behavior: 'smooth' }) }
                }}
              >
                <span>▶</span> Voir comment ça marche
              </a>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full lg:w-2/5 relative hero-right flex justify-center">
            {/* Background decorative */}
            <div
              className="absolute -top-10 -right-10 w-96 h-96 rounded-full -z-10"
              style={{ background: '#E8EDF4' }}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-md">
              {/* Hero image */}
              <img
                src="/gestion.jpg"
                alt="Professionnel en bureau"
                className="rounded-2xl shadow-2xl object-cover w-full hero-image-float"
                style={{ aspectRatio: '4/3' }}
                loading="eager"
              />

            </div>
          </div>

        </div>
      </section>
    </>
  )
}
