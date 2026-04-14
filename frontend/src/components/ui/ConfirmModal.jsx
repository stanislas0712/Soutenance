import { AlertTriangle, Trash2, CheckCircle2, LogOut, XCircle } from 'lucide-react'

const VARIANTS = {
  danger: {
    gradient: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)',
    btnClass: 'btn btn-danger btn-md',
    Icon: Trash2,
  },
  warning: {
    gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
    btnClass: 'btn btn-warning btn-md',
    Icon: AlertTriangle,
  },
  success: {
    gradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
    btnClass: 'btn btn-success btn-md',
    Icon: CheckCircle2,
  },
  primary: {
    gradient: 'linear-gradient(135deg, #0F2240 0%, #1E3A5F 100%)',
    btnClass: 'btn btn-primary btn-md',
    Icon: LogOut,
  },
}

/**
 * Modal de confirmation réutilisable — remplace window.confirm()
 *
 * Props :
 *   title      — titre affiché dans le header
 *   message    — texte de la question
 *   confirmLabel — libellé du bouton de confirmation (défaut : "Confirmer")
 *   variant    — 'danger' | 'warning' | 'success' | 'primary'  (défaut : 'danger')
 *   onConfirm  — callback si l'utilisateur confirme
 *   onClose    — callback si l'utilisateur annule / ferme
 */
export default function ConfirmModal({
  title        = 'Confirmation',
  message      = 'Êtes-vous sûr de vouloir effectuer cette action ?',
  confirmLabel = 'Confirmer',
  variant      = 'danger',
  onConfirm,
  onClose,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.danger
  const { Icon } = v

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }}
      >
        {/* Header coloré */}
        <div style={{
          background: v.gradient,
          padding: '20px 24px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Cercle déco */}
          <div style={{
            position: 'absolute', top: -24, right: -24,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,.08)', pointerEvents: 'none',
          }} />

          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(255,255,255,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} strokeWidth={2} />
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>
              {title}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 2 }}>
              Cette action nécessite votre confirmation
            </div>
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '22px 24px' }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--color-gray-700)',
            lineHeight: 1.6,
          }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 24px',
          borderTop: '1px solid var(--color-gray-100)',
          background: 'var(--color-gray-50)',
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-md"
          >
            Annuler
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={v.btnClass}
            style={{ gap: 7 }}
          >
            <Icon size={14} strokeWidth={2} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
