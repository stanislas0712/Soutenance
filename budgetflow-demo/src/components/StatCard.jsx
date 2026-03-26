export default function StatCard({ label, value, subtitle, color = '#3B82F6' }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      padding: '20px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, marginBottom: '12px' }} />
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '6px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color, lineHeight: 1.1, marginBottom: subtitle ? '6px' : 0 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '13px', color: '#6B7280' }}>{subtitle}</div>
      )}
    </div>
  )
}
