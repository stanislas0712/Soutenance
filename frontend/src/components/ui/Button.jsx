/**
 * Button — variante unique, tous les styles viennent des classes CSS globales (.btn-*)
 *
 * Variants : primary | secondary | danger | ghost | gold | success | warning
 * Sizes    : xs | sm | md | lg
 *
 * Usage :
 *   <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>Créer</Button>
 *   <Button variant="danger" loading={isDeleting}>Supprimer</Button>
 */

const VARIANT_CLASS = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger:    'btn btn-danger',
  ghost:     'btn btn-ghost',
  gold:      'btn btn-gold',
  success:   'btn btn-success',
  warning:   'btn btn-warning',
}

const SIZE_CLASS = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export default function Button({
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  leftIcon  = null,
  rightIcon = null,
  children,
  className = '',
  type      = 'button',
  ...rest
}) {
  const cls = [
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary,
    SIZE_CLASS[size]       ?? SIZE_CLASS.md,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cls}
      {...rest}
    >
      {loading && <span className="spinner-sm" aria-hidden="true" />}
      {!loading && leftIcon && (
        <span className="flex items-center justify-center w-4 h-4 shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children && <span>{children}</span>}
      {!loading && rightIcon && (
        <span className="flex items-center justify-center w-4 h-4 shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
}
