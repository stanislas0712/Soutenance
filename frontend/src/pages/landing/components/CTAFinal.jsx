import { Link } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

export default function CTAFinal() {
  const [ref, visible] = useScrollAnimation(0.1)

  return (
    <section style={{ padding:'96px 24px', background:'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)', position:'relative', overflow:'hidden' }} aria-label="Appel à l'action final">

      {/* Decorative circles */}
      <div aria-hidden="true" style={{ position:'absolute', top:'-20%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'rgba(37,99,235,0.06)', pointerEvents:'none' }} />
      <div aria-hidden="true" style={{ position:'absolute', bottom:'-20%', left:'-5%', width:300, height:300, borderRadius:'50%', background:'rgba(37,99,235,0.05)', pointerEvents:'none' }} />

      <div ref={ref} style={{
        maxWidth:780, margin:'0 auto', textAlign:'center',
        padding:'64px 48px',
        background:'#FFFFFF',
        border:'1px solid rgba(37,99,235,0.15)',
        borderRadius:24,
        boxShadow:'0 8px 40px rgba(37,99,235,0.12), 0 1px 0 rgba(255,255,255,0.9) inset',
        position:'relative', zIndex:1,
        opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(28px)',
        transition:'all .8s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Top accent line */}
        <div aria-hidden="true" style={{ position:'absolute', top:0, left:'15%', right:'15%', height:3, borderRadius:'0 0 3px 3px', background:'linear-gradient(90deg, #2563EB, #60A5FA)', }} />

        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'4px 14px', borderRadius:999,
          background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)',
          fontSize:11, fontWeight:700, color:'#2563EB', letterSpacing:'.08em',
          textTransform:'uppercase', marginBottom:24,
        }}>
          Prêt à commencer ?
        </div>

        <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.04em', color:'#0F172A', lineHeight:1.1, marginBottom:20 }}>
          Prêt à moderniser votre<br />gestion budgétaire ?
        </h2>

        <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginBottom:36 }}>
          <a href="/login" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'14px 32px', borderRadius:10,
            background:'#2563EB', color:'#FFFFFF',
            fontWeight:700, fontSize:15, textDecoration:'none',
            boxShadow:'0 4px 16px rgba(37,99,235,0.3)',
            transition:'background .15s, transform .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='#1D4ED8'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background='#2563EB'; e.currentTarget.style.transform='' }}
          >Démarrer gratuitement</a>

          <Link to="/contact" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'14px 28px', borderRadius:10,
            background:'transparent', color:'#2563EB',
            fontWeight:600, fontSize:15, textDecoration:'none',
            border:'1px solid rgba(37,99,235,0.3)',
            transition:'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(37,99,235,0.06)'; e.currentTarget.style.borderColor='#2563EB' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(37,99,235,0.3)' }}
          >Contacter l'équipe</Link>
        </div>

      </div>
    </section>
  )
}
