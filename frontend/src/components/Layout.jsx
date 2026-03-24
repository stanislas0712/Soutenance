import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDepartements } from '../api/accounts'
import ChatbotDrawer from './ia/ChatbotDrawer'
import {
  LayoutDashboard, Wallet, CalendarDays, Building2, Users,
  ClipboardList, BarChart3, CreditCard, Sparkles,
  CheckCircle2, ChevronRight, ChevronDown, LogOut, User,
  ExternalLink, Menu, X, Settings, PlusCircle,
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
    { to: '/ia',            icon: Sparkles,        label: 'Intelligence IA' },
  ]
  if (role === 'GESTIONNAIRE') return [
    { to: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/mes-budgets',  icon: Wallet,          label: 'Mes budgets' },
    { to: '/creer-budget', icon: PlusCircle,      label: 'Nouveau budget' },
    { to: '/mes-depenses', icon: CreditCard,      label: 'Mes dépenses' },
  ]
  if (role === 'COMPTABLE') return [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/validation', icon: CheckCircle2,    label: 'Budgets à valider' },
    { to: '/depenses',   icon: CreditCard,      label: 'Dépenses à valider' },
    { to: '/rapports',   icon: BarChart3,       label: 'KPIs & Rapports' },
    { to: '/ia',         icon: Sparkles,        label: 'Intelligence IA' },
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
      { label: 'DÉPENSES', items: items.slice(3) },
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
        gap: 10, padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 8, marginBottom: 1,
        color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
        background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
        fontWeight: isActive ? 600 : 400,
        fontSize: '13.5px',
        transition: 'all .12s',
        textDecoration: 'none',
        position: 'relative',
        borderLeft: isActive ? '2px solid #60A5FA' : '2px solid transparent',
      })}
    >
      {({ isActive }) => (
        <>
          <IconComp
            size={17}
            strokeWidth={isActive ? 2.2 : 1.8}
            style={{ flexShrink: 0, color: isActive ? '#93C5FD' : 'rgba(255,255,255,.55)' }}
          />
          {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
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
        className="flex flex-col relative z-[100] overflow-hidden shrink-0 bg-gradient-to-b from-[#0F2547] to-[#1E3A8A]"
        style={{
          width: collapsed ? 60 : 'var(--sidebar-w)',
          minWidth: collapsed ? 60 : 'var(--sidebar-w)',
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s',
          boxShadow: '1px 0 0 rgba(255,255,255,.04), 2px 0 20px rgba(0,0,0,.2)',
        }}
      >

        {/* Logo */}
        <div
          className="shrink-0 flex items-center border-b gap-[10px]"
          style={{
            height: 'var(--topbar-h)',
            padding: collapsed ? '0' : '0 16px 0 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottomColor: 'rgba(255,255,255,.06)',
          }}
        >
          <div
            className="w-8 h-8 rounded-[8px] shrink-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              boxShadow: '0 2px 8px rgba(59,130,246,.4)',
            }}
          >
            <Wallet size={16} strokeWidth={2.5} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-extrabold text-[14px] text-white tracking-[-0.3px] leading-[1.2]">
                BudgetFlow
              </div>
              <div className="text-[10px] text-white/40 tracking-[.5px] mt-[1px]">
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
          className="shrink-0 bg-white flex items-center px-6 gap-[14px] z-50"
          style={{
            height: 'var(--topbar-h)',
            borderBottom: '1px solid #E5E7EB',
            boxShadow: '0 1px 0 #E5E7EB',
          }}
        >
          {/* Toggle sidebar */}
          <button
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Étendre le menu' : 'Réduire le menu'}
            className="w-[34px] h-[34px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#6B7280] flex items-center justify-center transition-all shrink-0 hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
          >
            <Menu size={16} strokeWidth={2} />
          </button>

          {/* Breadcrumb */}
          {currentItem && (
            <div className="flex items-center gap-[6px] text-[13px] text-[#9CA3AF]">
              <span>BudgetFlow</span>
              <ChevronRight size={13} strokeWidth={2} />
              <span className="text-[#374151] font-semibold">{currentItem.label}</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Admin Django link */}
          {isAdmin && (
            <a
              href="http://localhost:8000/admin/"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-[6px] px-3 py-[6px] rounded-[7px] border border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB] text-[12.5px] font-semibold transition-all hover:bg-[#DBEAFE]"
            >
              <ExternalLink size={13} strokeWidth={2} />
              Django Admin
            </a>
          )}

          {/* Avatar menu */}
          <AvatarMenu user={user} roleInfo={roleInfo} onLogout={handleLogout} navigate={navigate} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-7">
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
        className="flex items-center gap-[9px] px-[10px] py-[5px] pl-[5px] border-[1.5px] border-[#E5E7EB] rounded-[10px] cursor-pointer transition-all hover:bg-[#F9FAFB]"
        style={{ background: open ? '#F3F4F6' : 'none' }}
      >
        <div
          className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[11px]"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
        >
          {initials}
        </div>
        <div className="text-left">
          <div className="font-semibold text-[13px] leading-[1.2] text-[#111827]">
            {user?.prenom} {user?.nom}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-[1px]">
            {user?.email}
          </div>
        </div>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          color="#9CA3AF"
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
