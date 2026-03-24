/**
 * StatusBadge — Badges statuts cohérents (WCAG 2.1 AA)
 * Utilise les configs centralisées dans utils/constants.js
 */
import { getStatutConfig, ALERTE_CONFIG } from '../utils/constants'

/* ── Statut budget ─────────────────────────────────────────────────────────── */
export function StatutBadge({ statut }) {
  const cfg = getStatutConfig(statut, 'budget')
  return (
    <span className={`badge badge-${statut}`} role="status">
      <span className="badge-dot" style={{ background: cfg.couleur }} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

/* ── Niveaux alerte ────────────────────────────────────────────────────────── */
export function AlerteBadge({ niveau }) {
  const cfg = ALERTE_CONFIG[niveau] || ALERTE_CONFIG.NORMAL
  return (
    <span className={`badge badge-${niveau}`}>
      <span className="badge-dot" style={{ background: cfg.couleur }} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

/* ── Dépenses ──────────────────────────────────────────────────────────────── */
export function DepenseBadge({ statut }) {
  const cfg = getStatutConfig(statut, 'depense')
  return (
    <span className={`badge badge-${statut}`} role="status">
      <span className="badge-dot" style={{ background: cfg.couleur }} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

/* ── Rôles ─────────────────────────────────────────────────────────────────── */
export function RoleBadge({ role }) {
  const cfg = getStatutConfig(role, 'role')
  return (
    <span
      className="inline-flex items-center px-[10px] py-[3px] rounded-full text-[11.5px] font-bold tracking-[.2px]"
      style={{ background: cfg.bg, color: cfg.couleur }}
    >
      {cfg.label}
    </span>
  )
}

/* ── Badge générique (inline style) ───────────────────────────────────────── */
export function InlineBadge({ statut, type = 'budget' }) {
  const cfg = getStatutConfig(statut, type)
  return (
    <span
      className="inline-block px-[10px] py-[3px] rounded-[20px] text-[11px] font-bold whitespace-nowrap"
      style={{
        background: cfg.bg,
        color: cfg.couleur,
        border: `1px solid ${cfg.border || cfg.bg}`,
      }}
    >
      {cfg.label}
    </span>
  )
}
