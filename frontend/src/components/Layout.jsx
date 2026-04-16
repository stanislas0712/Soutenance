import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications, marquerLue, marquerToutesLues } from '../api/notifications'
import {
  LayoutDashboard, Wallet, CalendarDays, Building2, Users,
  ClipboardList, BarChart3, FileBarChart, CreditCard,
  CheckCircle2, ChevronRight, ChevronDown, LogOut, User,
  Menu, Bell,
} from 'lucide-react'

/* ── Rôles ───────────────────────────────────────────────────────────────── */
const ROLE_BADGE = {
  ADMINISTRATEUR: { bg: 'rgba(201,145,10,.2)',  color: '#C9910A', label: 'Admin' },
  GESTIONNAIRE  : { bg: 'rgba(27,124,62,.2)',   color: '#1B7C3E', label: 'Gestionnaire' },
  COMPTABLE     : { bg: 'rgba(26,58,107,.25)',  color: '#8CB4E0', label: 'Comptable' },
}

/* ── Navigation par rôle ─────────────────────────────────────────────────── */
function navItems(role) {
  if (role === 'ADMINISTRATEUR') return [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/budget-annuel', icon: CalendarDays,    label: 'Budget annuel' },
    { to: '/departements',  icon: Building2,       label: 'Départements' },
    { to: '/utilisateurs',  icon: Users,           label: 'Utilisateurs' },
    { to: '/audit',               icon: ClipboardList, label: "Journal d'audit"     },
    { to: '/rapports',            icon: BarChart3,    label: 'Statistiques'     },
    { to: '/rapports-detailles',  icon: FileBarChart, label: 'Rapports détaillés'  },
  ]
  if (role === 'GESTIONNAIRE') return [
    { to: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/mes-budgets',  icon: Wallet,          label: 'Mes budgets' },
    { to: '/mes-depenses', icon: CreditCard,      label: 'Mes dépenses' },
  ]
  if (role === 'COMPTABLE') return [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/validation', icon: CheckCircle2,    label: 'Budgets à valider' },
    { to: '/depenses',   icon: CreditCard,      label: 'Dépenses à valider' },
    { to: '/rapports',   icon: BarChart3,       label: 'Statistiques' },
  ]
  return []
}

/* ── Section labels ──────────────────────────────────────────────────────── */
function getSections(role, items) {
  if (role === 'ADMINISTRATEUR') {
    return [
      { label: 'PRINCIPAL',      items: items.slice(0, 1) },
      { label: 'ADMINISTRATION', items: items.slice(1, 5) },
      { label: 'RAPPORTS',       items: items.slice(5) },
    ]
  }
  if (role === 'GESTIONNAIRE') {
    return [
      { label: null,       items: items.slice(0, 1) },
      { label: 'BUDGETS',  items: items.slice(1, 2) },
      { label: 'DÉPENSES', items: items.slice(2) },
    ]
  }
  if (role === 'COMPTABLE') {
    return [
      { label: null,         items: items.slice(0, 1) },
      { label: 'VALIDATION', items: items.slice(1, 3) },
      { label: 'RAPPORTS',   items: items.slice(3) },
    ]
  }
  return [{ label: null, items }]
}

/* ── NavItem ─────────────────────────────────────────────────────────────── */
function NavItem({ item, collapsed }) {
  const IconComp = item.icon
  return (
    <NavLink
      to={item.to}
      viewTransition
      title={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center',
        gap: 10, padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 8, marginBottom: 2,
        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,.55)',
        background: isActive ? 'rgba(27,124,62,.2)' : 'transparent',
        fontWeight: isActive ? 600 : 400,
        fontSize: '13px',
        transition: 'all .12s',
        textDecoration: 'none',
        minHeight: 44,
        border: isActive ? '1px solid rgba(27,124,62,.3)' : '1px solid transparent',
      })}
    >
      {({ isActive }) => (
        <>
          <IconComp
            size={16}
            strokeWidth={isActive ? 2 : 1.8}
            style={{ flexShrink: 0, color: isActive ? '#6EE7B7' : 'rgba(255,255,255,.45)' }}
          />
          {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
          {!collapsed && isActive && (
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6EE7B7', flexShrink: 0 }} />
          )}
        </>
      )}
    </NavLink>
  )
}

/* ── Layout component ────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [collapsed, setCollapsed]         = useState(false)
  const [isMobile, setIsMobile]           = useState(() => window.innerWidth < 768)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const items   = navItems(user?.role)
  const sections = getSections(user?.role, items)
  const roleInfo = ROLE_BADGE[user?.role] || { bg: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', label: user?.role }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Close mobile sidebar on route change */
  useEffect(() => { setMobileSidebarOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  const toggleSidebar = () => {
    if (isMobile) setMobileSidebarOpen(o => !o)
    else setCollapsed(c => !c)
  }

  /* Breadcrumb label from current path */
  const currentItem = items.find(i => i.to !== '/dashboard' && location.pathname.startsWith(i.to + '/'))
    || items.find(i => i.to !== '/dashboard' && location.pathname === i.to)
    || items.find(i => i.to === location.pathname)

  return (
    <div className="flex h-full" style={{ background: '#F8FAFC' }}>

      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col overflow-hidden shrink-0"
        style={{
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? 0 : undefined,
          left: isMobile ? 0 : undefined,
          height: isMobile ? '100%' : undefined,
          zIndex: isMobile ? 99 : 100,
          width: isMobile ? 'var(--sidebar-w)' : (collapsed ? 60 : 'var(--sidebar-w)'),
          minWidth: isMobile ? 'var(--sidebar-w)' : (collapsed ? 60 : 'var(--sidebar-w)'),
          transform: isMobile ? (mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s, transform .25s cubic-bezier(.4,0,.2,1)',
          background: '#1E3A8A',
          boxShadow: '1px 0 0 0 #D1D8E0',
        }}
      >

        {/* Logo */}
        <div
          className="shrink-0 flex items-center border-b gap-[10px]"
          style={{
            height: 'var(--topbar-h)',
            padding: collapsed ? '0' : '0 16px 0 18px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottomColor: 'rgba(255,255,255,.05)',
          }}
        >
          <img
            src="/budget.jpg"
            alt="Gestion Budgétaire"
            style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0F5FF', lineHeight: 1.2, fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Gestion Budgétaire
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', marginTop: 2, textTransform: 'uppercase' }}>
                Plateforme budgétaire
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ padding: collapsed ? '12px 6px' : '12px 10px' }}
        >
          {sections.map((section, si) => (
            <div key={si} className="mb-2">
              {!collapsed && section.label && (
                <div
                  className="text-[10px] font-bold tracking-[1px] text-white/25 px-3 pb-[5px]"
                  style={{ marginTop: si > 0 ? 8 : 0 }}
                >
                  {section.label}
                </div>
              )}
              {section.items.map(item => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header
          className="shrink-0 flex items-center px-5 gap-[12px] z-50"
          style={{
            height: 'var(--topbar-h)',
            background: '#1E3A8A',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            boxShadow: '0 1px 4px rgba(13,34,64,.25)',
          }}
        >
          {/* Toggle sidebar */}
          <button
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Étendre le menu' : 'Réduire le menu'}
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: '1.5px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .12s', flexShrink: 0, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.25)'; }}
          >
            <Menu size={15} strokeWidth={2} />
          </button>

          {/* Breadcrumb */}
          {currentItem && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'rgba(255,255,255,.6)' }}>
              <span style={{ fontWeight: 500 }}>Gestion Budgétaire</span>
              <ChevronRight size={12} strokeWidth={2.5} />
              <span style={{ color: '#fff', fontWeight: 700, letterSpacing: '-.01em' }}>{currentItem.label}</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Cloche de notifications */}
          <NotificationBell navigate={navigate} />

          {/* Avatar menu */}
          <AvatarMenu user={user} roleInfo={roleInfo} onLogout={handleLogout} navigate={navigate} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ padding: isMobile ? '16px 14px' : '28px 32px', background: '#F8FAFC' }}>
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}

/* ── helpers notifications ───────────────────────────────────────────────── */
const NOTIF_META = {
  BUDGET_CREE:      { icon: '📝', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', label: 'Nouveau budget'    },
  BUDGET_APPROUVE:  { icon: '✅', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'Budget approuvé'   },
  BUDGET_REJETE:    { icon: '❌', color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', label: 'Budget rejeté'     },
  BUDGET_SOUMIS:    { icon: '📤', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'Budget soumis'     },
  DEPENSE_SAISIE:   { icon: '💸', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4', label: 'Dépense enregistrée' },
  DEPENSE_VALIDEE:  { icon: '💳', color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', label: 'Dépense validée'   },
  DEPENSE_REJETEE:  { icon: '🚫', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'Dépense rejetée'   },
  DEFAULT:          { icon: '🔔', color: '#C9910A', bg: '#FDF6E3', border: '#E8C84A', label: 'Info'              },
}
const notifMeta = (type) => NOTIF_META[type] || NOTIF_META.DEFAULT

function fmtDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60)  return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

/* ── NotificationBell ────────────────────────────────────────────────────── */
function NotificationBell({ navigate }) {

  const [notifs,    setNotifs]    = useState([])
  const [nbNonLues, setNbNonLues] = useState(0)
  const [open,      setOpen]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const btnRef   = useRef(null)
  const panelRef = useRef(null)

  const loadNotifs = () => {
    getNotifications().then(r => {
      setNotifs(r.data?.data ?? [])
      setNbNonLues(r.data?.nb_non_lues ?? 0)
    }).catch(() => {})
  }

  // Polling rapide sur le compteur seul (requête légère ?non_lues=1)
  const loadBadge = () => {
    getNotifications({ non_lues: '1' }).then(r => {
      setNbNonLues(r.data?.nb_non_lues ?? 0)
    }).catch(() => {})
  }

  useEffect(() => {
    loadNotifs()
    // Badge : toutes les 5s (requête légère)
    const badgeTimer = setInterval(loadBadge, 5000)
    // Liste complète : toutes les 30s (si le panel est ouvert, on recharge à l'ouverture)
    const fullTimer  = setInterval(loadNotifs, 30000)
    // Écouter l'événement custom émis après chaque action métier
    const onRefresh = () => loadNotifs()
    window.addEventListener('budgetflow:notif-refresh', onRefresh)
    return () => {
      clearInterval(badgeTimer)
      clearInterval(fullTimer)
      window.removeEventListener('budgetflow:notif-refresh', onRefresh)
    }
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
    loadNotifs()
  }

  const handleLireTout = async () => {
    setLoading(true)
    await marquerToutesLues()
    setNotifs(ns => ns.map(n => ({ ...n, lu: true })))
    setNbNonLues(0)
    setLoading(false)
  }

  const handleClick = async (notif) => {
    if (!notif.lu) {
      await marquerLue(notif.id)
      setNotifs(ns => ns.map(n => n.id === notif.id ? { ...n, lu: true } : n))
      setNbNonLues(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (notif.lien) navigate(notif.lien)
  }

  return (
    <>
      {/* ── Bouton cloche ── */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="Notifications"
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 8,
          border: '1.5px solid rgba(255,255,255,.25)',
          background: open ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', transition: 'all .12s', flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)'}
      >
        <Bell size={16} strokeWidth={2} />
        {nbNonLues > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 17, height: 17, borderRadius: 9999,
            background: '#C0392B', border: '2px solid #1E3A8A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 800, color: '#fff', padding: '0 3px',
          }}>
            {nbNonLues > 9 ? '9+' : nbNonLues}
          </span>
        )}
      </button>

      {/* ── Panel fixe en haut à droite ── */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: 'calc(var(--topbar-h) + 8px)',
            right: 8,
            width: 'min(400px, calc(100vw - 16px))',
            maxHeight: 'calc(100vh - var(--topbar-h) - 24px)',
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #E5E7EB',
            boxShadow: '0 20px 60px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.08)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideDown .2s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            padding: '16px 18px 14px',
            background: '#1E3A8A',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bell size={16} strokeWidth={2} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Notifications</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)', marginTop: 1 }}>
                    {nbNonLues > 0 ? `${nbNonLues} non lue${nbNonLues > 1 ? 's' : ''}` : 'Tout est à jour'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {nbNonLues > 0 && (
                  <button
                    onClick={handleLireTout}
                    disabled={loading}
                    style={{
                      fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,.85)',
                      background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
                      borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                    }}
                  >
                    {loading ? '…' : 'Tout lire'}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: 'rgba(255,255,255,.1)', border: 'none',
                    color: 'rgba(255,255,255,.7)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* ── Badge compteur ── */}
          {nbNonLues > 0 && (
            <div style={{
              padding: '8px 18px',
              background: '#FFFBEB',
              borderBottom: '1px solid #FEF3C7',
              fontSize: '12px', color: '#92400E', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            }}>
              <span style={{ fontSize: '14px' }}>⚡</span>
              {nbNonLues} notification{nbNonLues > 1 ? 's' : ''} en attente de lecture
            </div>
          )}

          {/* ── Liste ── */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: 10 }}>🔔</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Aucune notification</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Vous êtes à jour !</div>
              </div>
            ) : notifs.map((n, i) => {
              const meta = notifMeta(n.type_notif)
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 18px',
                    background: n.lu ? '#fff' : meta.bg,
                    border: 'none',
                    borderBottom: i < notifs.length - 1 ? '1px solid #F3F4F6' : 'none',
                    cursor: 'pointer', transition: 'background .1s',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = n.lu ? '#fff' : meta.bg}
                >
                  {/* Icône type */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: meta.bg, border: `1px solid ${meta.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px',
                  }}>
                    {meta.icon}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700,
                        color: meta.color, background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        padding: '1px 7px', borderRadius: 9999,
                        letterSpacing: '.3px',
                      }}>
                        {meta.label}
                      </span>
                      {!n.lu && (
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#C9910A', flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: '12.5px',
                      fontWeight: n.lu ? 400 : 600,
                      color: '#111827',
                      lineHeight: 1.5,
                      marginBottom: 4,
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>🕐</span>
                      {fmtDate(n.date)}
                      {n.lien && (
                        <span style={{ marginLeft: 6, color: '#C9910A', fontWeight: 600 }}>
                          Voir →
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '10px 18px',
            borderTop: '1px solid #F3F4F6',
            background: '#F9FAFB',
            flexShrink: 0,
            fontSize: '11px', color: '#9CA3AF', textAlign: 'center',
          }}>
            Rafraîchissement automatique toutes les 15 secondes
          </div>
        </div>
      )}
    </>
  )
}

/* ── AvatarMenu ──────────────────────────────────────────────────────────── */
function AvatarMenu({ user, roleInfo, onLogout, navigate }) {
  const [open, setOpen]       = useState(false)
  const [isSmall, setIsSmall] = useState(() => window.innerWidth < 480)
  const ref = useRef(null)
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 480)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = ((user?.prenom?.[0] || '') + (user?.nom?.[0] || '') || user?.email?.[0] || '?').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Menu profil"
        aria-expanded={open}
        className="flex items-center gap-[9px] px-[10px] py-[5px] pl-[5px] rounded-[10px] cursor-pointer transition-all"
        style={{
          border: '1.5px solid rgba(255,255,255,.25)',
          background: open ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)'}
      >
        <div
          className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[11px]"
          style={{ background: '#1D4ED8' }}
        >
          {initials}
        </div>
        {!isSmall && (
          <div className="text-left">
            <div className="font-semibold text-[13px] leading-[1.2]" style={{ color: '#fff' }}>
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-[11px] mt-[1px]" style={{ color: 'rgba(255,255,255,.6)' }}>
              {user?.email}
            </div>
          </div>
        )}
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          color="rgba(255,255,255,.7)"
          style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-[12px] border border-[#E5E7EB] min-w-[210px] z-[200] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-xl)', animation: 'fadeIn .15s ease' }}
        >
          {/* Header */}
          <div className="px-4 py-[14px] border-b border-[#F3F4F6] bg-[#F9FAFB]">
            <div className="font-bold text-[13.5px] text-[#111827] mb-[5px]">
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-[12px] text-[#6B7280] mb-[6px]">
              {user?.email}
            </div>
            <span className="inline-block text-[10px] font-bold px-2 py-[2px] rounded-[20px] tracking-[.3px]" style={{ background: '#FEF9EC', color: '#78350F', border: '1px solid #F3D07A' }}>
              {roleInfo?.label || user?.role}
            </span>
          </div>

          {/* Mon profil */}
          <button
            className="dropdown-item"
            onClick={() => { setOpen(false); navigate('/profil') }}
          >
            <User size={15} strokeWidth={1.8} color="#6B7280" />
            Mon profil
          </button>

          <div className="dropdown-divider" />

          {/* Déconnexion */}
          <button
            className="dropdown-item danger"
            onClick={() => { setOpen(false); onLogout() }}
          >
            <LogOut size={15} strokeWidth={1.8} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
