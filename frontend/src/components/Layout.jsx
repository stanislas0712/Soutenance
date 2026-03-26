import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatbotDrawer from './ia/ChatbotDrawer'
import { getNotifications, marquerLue, marquerToutesLues } from '../api/notifications'
import {
  LayoutDashboard, Wallet, CalendarDays, Building2, Users,
  ClipboardList, BarChart3, CreditCard, Sparkles,
  CheckCircle2, ChevronRight, ChevronDown, LogOut, User,
  ExternalLink, Menu, PlusCircle, Bell,
} from 'lucide-react'

/* ── Rôles ───────────────────────────────────────────────────────────────── */
const ROLE_BADGE = {
  ADMINISTRATEUR: { bg: 'rgba(59,130,246,.15)', color: '#93C5FD', label: 'Admin' },
  GESTIONNAIRE  : { bg: 'rgba(34,197,94,.15)',  color: '#86EFAC', label: 'Gestionnaire' },
  COMPTABLE     : { bg: 'rgba(245,158,11,.15)', color: '#FCD34D', label: 'Comptable' },
}

/* ── Navigation par rôle ─────────────────────────────────────────────────── */
function navItems(role) {
  if (role === 'ADMINISTRATEUR') return [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/budget-annuel', icon: CalendarDays,    label: 'Budget annuel' },
    { to: '/departements',  icon: Building2,       label: 'Départements' },
    { to: '/utilisateurs',  icon: Users,           label: 'Utilisateurs' },
    { to: '/audit',         icon: ClipboardList,   label: "Journal d'audit" },
    { to: '/rapports',      icon: BarChart3,       label: 'KPIs & Rapports' },
    { to: '/ia',            icon: Sparkles,        label: 'Veille & Analyse' },
  ]
  if (role === 'GESTIONNAIRE') return [
    { to: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/mes-budgets',  icon: Wallet,          label: 'Mes budgets' },
    { to: '/creer-budget', icon: PlusCircle,      label: 'Nouveau budget' },
    { to: '/mes-depenses', icon: CreditCard,      label: 'Mes dépenses' },
    { to: '/ia',           icon: Sparkles,        label: 'Veille & Analyse' },
  ]
  if (role === 'COMPTABLE') return [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/validation', icon: CheckCircle2,    label: 'Budgets à valider' },
    { to: '/depenses',   icon: CreditCard,      label: 'Dépenses à valider' },
    { to: '/rapports',   icon: BarChart3,       label: 'KPIs & Rapports' },
    { to: '/ia',         icon: Sparkles,        label: 'Veille & Analyse' },
  ]
  return []
}

/* ── Section labels ──────────────────────────────────────────────────────── */
function getSections(role, items) {
  if (role === 'ADMINISTRATEUR') {
    return [
      { label: 'PRINCIPAL',      items: items.slice(0, 1) },
      { label: 'ADMINISTRATION', items: items.slice(1, 5) },
      { label: 'RAPPORTS',       items: items.slice(5, 6) },
      { label: 'IA',             items: items.slice(6) },
    ]
  }
  if (role === 'GESTIONNAIRE') {
    return [
      { label: null,       items: items.slice(0, 1) },
      { label: 'BUDGETS',  items: items.slice(1, 3) },
      { label: 'DÉPENSES', items: items.slice(3, 4) },
      { label: 'IA',       items: items.slice(4) },
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
      title={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center',
        gap: 10, padding: collapsed ? '9px 0' : '8px 11px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 9, marginBottom: 2,
        color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
        background: isActive
          ? 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(37,99,235,.25))'
          : 'transparent',
        fontWeight: isActive ? 600 : 400,
        fontSize: '13.5px',
        transition: 'all .12s',
        textDecoration: 'none',
        position: 'relative',
        boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,.08)' : 'none',
        border: isActive ? '1px solid rgba(255,255,255,.1)' : '1px solid transparent',
      })}
    >
      {({ isActive }) => (
        <>
          <IconComp
            size={16}
            strokeWidth={isActive ? 2.2 : 1.8}
            style={{ flexShrink: 0, color: isActive ? '#93C5FD' : 'rgba(255,255,255,.45)' }}
          />
          {!collapsed && <span style={{ flex: 1, letterSpacing: '-.01em' }}>{item.label}</span>}
          {!collapsed && isActive && (
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
          )}
        </>
      )}
    </NavLink>
  )
}

/* ── Layout component ────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const items   = navItems(user?.role)
  const sections = getSections(user?.role, items)
  const roleInfo = ROLE_BADGE[user?.role] || { bg: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', label: user?.role }

  const handleLogout = () => { logout(); navigate('/') }

  /* Breadcrumb label from current path */
  const currentItem = items.find(i => i.to !== '/dashboard' && location.pathname.startsWith(i.to))
    || items.find(i => i.to === location.pathname)

  return (
    <div className="flex h-full bg-[#F9FAFB]">

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col relative z-[100] overflow-hidden shrink-0"
        style={{
          width: collapsed ? 60 : 'var(--sidebar-w)',
          minWidth: collapsed ? 60 : 'var(--sidebar-w)',
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s',
          background: 'linear-gradient(175deg, #1E3A8A 0%, #1E40AF 55%, #2563EB 100%)',
          boxShadow: '1px 0 0 rgba(255,255,255,.06), 4px 0 24px rgba(30,58,138,.35)',
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
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              boxShadow: '0 2px 8px rgba(59,130,246,.5)',
            }}
          >
            <Wallet size={16} strokeWidth={2.5} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', letterSpacing: '-.3px', lineHeight: 1.2 }}>
                BudgetFlow
              </div>
              <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,.3)', letterSpacing: '.8px', marginTop: 1 }}>
                GESTION BUDGÉTAIRE
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

        {/* User footer */}
        <div
          className="shrink-0 border-t"
          style={{
            padding: collapsed ? '10px 6px' : '12px',
            borderTopColor: 'rgba(255,255,255,.06)',
          }}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-[10px] px-[10px] py-2 rounded-[8px] mb-[6px]">
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[12px]"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                >
                  {(user?.prenom?.[0] || user?.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-white font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {user?.prenom} {user?.nom}
                  </div>
                  <span
                    className="inline-block text-[10px] font-bold px-[7px] py-[1px] rounded-[20px] tracking-[.3px] mt-[2px]"
                    style={{ background: roleInfo.bg, color: roleInfo.color }}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-[10px] py-2 rounded-[7px] text-[13px] font-medium cursor-pointer border-none transition-all"
                style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.2)'; e.currentTarget.style.color = '#FCA5A5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="w-full flex items-center justify-center py-2 rounded-[7px] cursor-pointer border-none transition-all"
              style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.2)'; e.currentTarget.style.color = '#FCA5A5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header
          className="shrink-0 flex items-center px-5 gap-[12px] z-50"
          style={{
            height: 'var(--topbar-h)',
            background: 'linear-gradient(90deg, #1E3A8A 0%, #1E40AF 60%, #2563EB 100%)',
            borderBottom: '1px solid rgba(255,255,255,.1)',
            boxShadow: '0 2px 8px rgba(30,58,138,.3)',
          }}
        >
          {/* Toggle sidebar */}
          <button
            onClick={() => setCollapsed(c => !c)}
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
              <span style={{ fontWeight: 500 }}>BudgetFlow</span>
              <ChevronRight size={12} strokeWidth={2.5} />
              <span style={{ color: '#fff', fontWeight: 700, letterSpacing: '-.01em' }}>{currentItem.label}</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Admin Django link — outil dev uniquement */}
          {isAdmin && (
            <a
              href="/admin/"
              target="_blank" rel="noreferrer"
              title="Interface d'administration technique (développeur)"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 7,
                border: '1px dashed rgba(255,255,255,.3)', background: 'transparent',
                color: 'rgba(255,255,255,.55)', fontSize: '11.5px', fontWeight: 500,
                transition: 'all .12s', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; }}
            >
              <ExternalLink size={11} strokeWidth={2} />
              Dev
            </a>
          )}

          {/* Cloche de notifications */}
          <NotificationBell navigate={navigate} />

          {/* Avatar menu */}
          <AvatarMenu user={user} roleInfo={roleInfo} onLogout={handleLogout} navigate={navigate} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>

      {/* Chatbot IA flottant */}
      <ChatbotDrawer />
    </div>
  )
}

/* ── helpers notifications ───────────────────────────────────────────────── */
const NOTIF_META = {
  BUDGET_APPROUVE: { icon: '✅', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'Approuvé'  },
  BUDGET_REJETE:   { icon: '❌', color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', label: 'Rejeté'    },
  BUDGET_SOUMIS:   { icon: '📤', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'Soumis'    },
  DEFAULT:         { icon: '🔔', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', label: 'Info'      },
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
  const [notifs,   setNotifs]   = useState([])
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const btnRef = useRef(null)
  const panelRef = useRef(null)

  const loadNotifs = () => {
    getNotifications().then(r => setNotifs(r.data?.data ?? [])).catch(() => {})
  }

  useEffect(() => {
    loadNotifs()
    const timer = setInterval(loadNotifs, 15000)
    return () => clearInterval(timer)
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

  const nbNonLues = notifs.filter(n => !n.lu).length

  const handleOpen = () => {
    setOpen(o => !o)
    loadNotifs()
  }

  const handleLireTout = async () => {
    setLoading(true)
    await marquerToutesLues()
    setNotifs(ns => ns.map(n => ({ ...n, lu: true })))
    setLoading(false)
  }

  const handleClick = async (notif) => {
    if (!notif.lu) {
      await marquerLue(notif.id)
      setNotifs(ns => ns.map(n => n.id === notif.id ? { ...n, lu: true } : n))
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
            background: '#EF4444', border: '2px solid #1E3A8A',
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
            right: 20,
            width: 400,
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
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
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
                          background: '#3B82F6', flexShrink: 0,
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
                        <span style={{ marginLeft: 6, color: '#2563EB', fontWeight: 600 }}>
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
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

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
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
        >
          {initials}
        </div>
        <div className="text-left">
          <div className="font-semibold text-[13px] leading-[1.2]" style={{ color: '#fff' }}>
            {user?.prenom} {user?.nom}
          </div>
          <div className="text-[11px] mt-[1px]" style={{ color: 'rgba(255,255,255,.6)' }}>
            {user?.email}
          </div>
        </div>
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
            <span className="inline-block text-[10px] font-bold px-2 py-[2px] rounded-[20px] bg-[#EFF6FF] text-[#1D4ED8] tracking-[.3px]">
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
