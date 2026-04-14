import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setDrawerOpen(false)
    const target = document.querySelector(href)
    if (target) {
      const offset = 64
      const top = target.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'border-b border-slate-100'
        }`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0 no-underline" aria-label="Gestion Budgétaire - Accueil">
            <img src="/budget.jpg" alt="Gestion Budgétaire" className="rounded-xl flex-shrink-0" style={{ width: 36, height: 36, objectFit: 'cover' }} />
            <span className="text-lg font-bold tracking-tight" style={{ color: '#1E3A5F', fontFamily: 'Lora, Georgia, serif' }}>
              Gestion <span className="font-extrabold">Budgétaire</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <nav className="hidden md:flex gap-1 flex-1 justify-center" aria-label="Liens de navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#B8973F] hover:bg-[#FEF9EC] px-3.5 py-2 rounded-lg transition-colors no-underline"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <a
              href="/login"
              className="text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all no-underline whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #292524, #1E3A5F)' }}
            >
              Accéder à la plateforme
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={drawerOpen}
          >
            <span className="w-5.5 h-0.5 bg-gray-600 rounded-full block" style={{ width: '22px', height: '2px' }} />
            <span className="w-5.5 h-0.5 bg-gray-600 rounded-full block" style={{ width: '22px', height: '2px' }} />
            <span className="w-5.5 h-0.5 bg-gray-600 rounded-full block" style={{ width: '22px', height: '2px' }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out md:hidden flex flex-col p-6 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <img src="/budget.jpg" alt="Gestion Budgétaire" className="rounded-xl" style={{ width: 36, height: 36, objectFit: 'cover' }} />
            <span className="text-lg font-bold text-blue-600 tracking-tight">
              Gestion <span className="font-extrabold">Budgétaire</span>
            </span>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        {/* Drawer nav links */}
        <div className="flex flex-col gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-medium text-gray-700 hover:text-[#B8973F] hover:bg-[#FEF9EC] px-4 py-3.5 rounded-xl transition-colors no-underline border-b border-gray-50 last:border-b-0"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Drawer action buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <a
            href="/login"
            className="text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all no-underline text-center" style={{ background: 'linear-gradient(135deg, #292524, #1E3A5F)' }}
          >
            Accéder à la plateforme
          </a>
        </div>
      </div>
    </>
  )
}
