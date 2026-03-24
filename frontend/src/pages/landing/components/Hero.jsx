const TRUST_BADGES = [
  'Configuration en moins de 10 minutes',
  'Aucune carte bancaire requise',
  'Support dédié en français',
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
      `}</style>

      <section
        className="pt-24 pb-16 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 60%)' }}
        aria-label="Section principale"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">

          {/* Left column */}
          <div className="w-full lg:w-3/5 hero-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full border border-blue-100 mb-6">
              <span>✨</span>
              <span>Nouveau · IA intégrée pour l'analyse budgétaire</span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
              La gestion budgétaire{' '}
              <span className="text-blue-600 underline decoration-wavy decoration-blue-300 underline-offset-4">
                intelligente
              </span>{' '}
              pour votre entreprise
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
              Simplifiez la création, le suivi et l'approbation de vos budgets.
              BudgetFlow centralise tous vos processus financiers avec intelligence et clarté,
              pour des décisions plus rapides et plus éclairées.
            </p>

            {/* Trust badges */}
            <ul className="flex flex-col gap-2 mb-8 list-none p-0 m-0" aria-label="Points clés">
              {TRUST_BADGES.map((text) => (
                <li key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold" aria-hidden="true">✓</span>
                  {text}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-blue-200 no-underline inline-flex items-center gap-2"
              >
                Se connecter →
              </a>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-base transition-all no-underline bg-white hover:bg-gray-50"
              >
                <span>▶</span> Voir comment ça marche
              </a>
            </div>

            {/* Partners */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Ils nous font confiance
              </p>
              <div className="flex gap-3 flex-wrap items-center" aria-label="Logos de partenaires">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-8 rounded-lg bg-gray-200 opacity-50"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full lg:w-2/5 relative hero-right flex justify-center">
            {/* Background decorative circle */}
            <div
              className="absolute -top-10 -right-10 w-96 h-96 bg-blue-50 rounded-full -z-10"
              aria-hidden="true"
            />

            <div className="relative w-full max-w-md">
              {/* Hero image */}
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                alt="Professionnelle africaine en bureau"
                className="rounded-2xl shadow-2xl object-cover w-full hero-image-float"
                style={{ aspectRatio: '4/3' }}
                loading="eager"
              />

              {/* Float card top-right: Budget approuvé */}
              <div className="float-card-tr absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">Nouveau</p>
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap leading-none">
                    Budget approuvé <span className="text-blue-600">+3</span>
                  </p>
                </div>
              </div>

              {/* Float card bottom-left: BUD-2024 */}
              <div className="float-card-bl absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-600 whitespace-nowrap">
                    BUD-2024-FIN-042 approuvé ✓
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
