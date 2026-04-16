const TRUST_BADGES = [
  'Workflow de validation multi-niveaux',
  'Suivi en temps réel des consommations',
  'Traçabilité et journal d\'audit complet',
]

export default function Hero() {
  return (
    <>
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-content { animation: heroFadeIn 0.9s ease both; }
        .hero-cta-primary:hover  { background: #172872 !important; }
        .hero-cta-secondary:hover { background: rgba(255,255,255,.15) !important; }
      `}</style>

      {/* ── Plein-écran image ─────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '92vh',
          minHeight: 560,
          overflow: 'hidden',
        }}
        aria-label="Section principale"
      >
        {/* Image de fond plein-écran */}
        <img
          src="/gestion.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
          loading="eager"
        />

        {/* Overlay gradient */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(15,30,80,.88) 0%, rgba(15,30,80,.72) 55%, rgba(15,30,80,.35) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Contenu texte */}
        <div
          className="hero-content"
          style={{
            position: 'relative', zIndex: 1,
            height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '96px 48px 48px',
            maxWidth: 760,
          }}
        >
          {/* H1 */}
          <h1
            style={{
              fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-.03em',
              marginBottom: 20,
            }}
          >
            La gestion budgétaire{' '}
            <span style={{ color: '#C9910A' }}>intelligente</span>{' '}
            pour les institutions publiques
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              color: 'rgba(255,255,255,.72)',
              lineHeight: 1.65,
              marginBottom: 28,
              maxWidth: 580,
            }}
          >
            Plateforme collaborative pour les ministères et organismes publics.
            Allocation, validation, suivi de consommation et alertes en temps réel.
          </p>

          {/* Trust badges */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRUST_BADGES.map(text => (
              <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,.82)' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(27,124,62,.35)', border: '1px solid rgba(27,124,62,.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#4ADE80',
                }}>✓</span>
                {text}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <a
              href="/login"
              className="hero-cta-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1E3A8A', color: '#fff',
                fontWeight: 700, fontSize: 15,
                padding: '12px 28px', borderRadius: 10,
                textDecoration: 'none', transition: 'background .15s',
                letterSpacing: '-.02em',
              }}
            >
              Accéder à la plateforme →
            </a>
            <a
              href="#how-it-works"
              className="hero-cta-secondary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,.1)', color: '#fff',
                fontWeight: 600, fontSize: 14,
                padding: '12px 24px', borderRadius: 10,
                textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,.3)',
                transition: 'background .15s',
              }}
              onClick={e => {
                e.preventDefault()
                const el = document.querySelector('#how-it-works')
                if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 64; window.scrollTo({ top, behavior: 'smooth' }) }
              }}
            >
              ▶ Voir comment ça marche
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
