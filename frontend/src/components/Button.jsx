/**
 * Button — Composant bouton réutilisable
 * Conforme WCAG 2.1 AA / Loi de Fitts (hauteur min 40px)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style: extraStyle,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size}${className ? ` ${className}` : ''}`}
      style={extraStyle}
      {...props}
    >
      {loading && <span className="spinner-sm" aria-hidden="true" />}
      {children}
    </button>
  )
}
