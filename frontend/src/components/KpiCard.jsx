/**
 * KpiCard — Premium SaaS-style KPI card with optional sparkline
 */
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

export default function KpiCard({
  icon,
  label,
  value,
  sub,
  color = 'var(--color-primary-600)',
  bgColor = 'var(--color-primary-50)',
  trend,
  onClick,
  sparklineData,   // optional: array of numbers e.g. [12, 15, 10, 18, 22, 20]
}) {
  // Build a safe id for the SVG gradient
  const gradId = 'sg-' + String(label).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        background: '#fff',
        border: '1px solid #EAECF0',
        borderRadius: 16,
        padding: '20px 20px 0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 1px 6px rgba(0,0,0,.04)',
        transition: onClick ? 'all .16s ease' : undefined,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = '#D1D5DB'
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,.04), 0 1px 6px rgba(0,0,0,.04)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = '#EAECF0'
      } : undefined}
    >
      {/* Colored accent bar top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem',
        }}>
          {icon}
        </div>

        {/* Trend */}
        {trend != null && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: '12px', fontWeight: 700,
            padding: '3px 9px', borderRadius: 99,
            background: trend >= 0 ? 'var(--color-success-50)' : 'var(--color-danger-50)',
            color: trend >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Label + Value */}
      <div style={{ paddingBottom: sparklineData ? 0 : 20 }}>
        <div style={{
          fontSize: '11.5px', fontWeight: 700,
          color: 'var(--color-gray-400)',
          textTransform: 'uppercase', letterSpacing: '.6px',
          marginBottom: 6,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          color: 'var(--color-gray-900)',
          lineHeight: 1.1,
          letterSpacing: '-.03em',
          fontSize: typeof value === 'string' && value.length > 12 ? '1.2rem'
                  : typeof value === 'string' && value.length > 8  ? '1.45rem'
                  : '1.8rem',
          wordBreak: 'break-word',
        }}>
          {value}
        </div>
        {sub && (
          <div style={{
            fontSize: '12px', color: 'var(--color-gray-400)',
            marginTop: 5, fontWeight: 500,
          }}>
            {sub}
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div style={{ height: 44, marginLeft: -20, marginRight: -20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparklineData.map((v, i) => ({ v, i }))}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.8}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
