const NAV_COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Comment ça marche', href: '#how-it-works' },
      { label: 'Tarifs', href: '/' },
      { label: 'Nouveautés', href: '/' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '/' },
      { label: 'Guide utilisateur', href: '/' },
      { label: 'API', href: '/' },
      { label: 'Blog', href: '/' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '/' },
      { label: 'Carrières', href: '/' },
      { label: 'Contact', href: '/' },
      { label: 'Mentions légales', href: '/' },
    ],
  },
]

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { href: '/', Icon: LinkedInIcon, label: 'LinkedIn' },
  { href: '/', Icon: TwitterIcon, label: 'Twitter / X' },
  { href: '/', Icon: FacebookIcon, label: 'Facebook' },
]

const LEGAL_LINKS = [
  { label: 'Politique de confidentialité', href: '/' },
  { label: "Conditions d'utilisation", href: '/' },
  { label: 'Mentions légales', href: '/' },
  { label: 'Cookies', href: '/' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="text-gray-400 py-16 px-6" style={{ background: '#1E3A8A' }} aria-label="Pied de page">
      <div className="max-w-6xl mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-12 border-b border-gray-800">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg w-9 h-9 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: '#1D4ED8' }}>
                B
              </div>
              <span className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
                Budget<span className="font-extrabold">Flow</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-500 mt-4 mb-6 max-w-[220px]">
              La plateforme de gestion budgétaire intelligente pour les entreprises africaines.
              Simplicité, sécurité et efficacité au service de vos finances.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mt-4" role="list" aria-label="Réseaux sociaux">
              {SOCIAL_LINKS.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-lg text-gray-400 hover:text-white flex items-center justify-center transition-colors no-underline" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }}
                  aria-label={label}
                  role="listitem"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
                {col.title}
              </h3>
              <ul className="space-y-3 list-none p-0 m-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors no-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <span>© {currentYear} Gestion Budgétaire. Tous droits réservés.</span>
            <span className="hidden md:inline text-gray-700">·</span>
            <span>Développé par <span className="text-gray-300 font-semibold">KONATÉ Stanislas</span></span>
          </div>
          <nav className="flex flex-wrap gap-5" aria-label="Liens légaux">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-gray-500 hover:text-gray-300 no-underline transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
