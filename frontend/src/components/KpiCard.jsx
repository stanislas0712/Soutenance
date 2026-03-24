/**
 * KpiCard — Carte KPI professionnelle
 * Loi de Fitts : zone cliquable généreuse, feedback hover immédiat
 */
export default function KpiCard({
  icon,
  label,
  value,
  sub,
  color = 'var(--color-primary-600)',
  bgColor = 'var(--color-primary-50)',
  trend,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`card card-hover flex items-start gap-[14px] p-[18px_20px] relative overflow-hidden${onClick ? ' cursor-pointer' : ''}`}
    >
      {/* Icône */}
      <div
        className="w-11 h-11 rounded-[11px] shrink-0 flex items-center justify-content-center text-[1.25rem]"
        style={{ background: bgColor, color }}
      >
        <span className="flex items-center justify-center w-full h-full">{icon}</span>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-[#9CA3AF] tracking-[.6px] uppercase mb-1">
          {label}
        </div>
        <div
          className="font-sans text-[1.75rem] font-extrabold text-[#111827] leading-none tracking-[-0.03em]"
        >
          {value}
        </div>
        {sub && (
          <div className="text-[12px] text-[#9CA3AF] mt-[5px]">
            {sub}
          </div>
        )}
      </div>

      {/* Trend badge */}
      {trend != null && (
        <div
          className="inline-flex items-center gap-[3px] text-[11.5px] font-bold px-2 py-[3px] rounded-full shrink-0"
          style={{
            background: trend >= 0 ? 'var(--color-success-50)' : 'var(--color-danger-50)',
            color: trend >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
          }}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
