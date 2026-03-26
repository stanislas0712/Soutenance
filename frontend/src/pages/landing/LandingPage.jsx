import { useEffect } from 'react'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import Stats        from './components/Stats'
import Features     from './components/Features'
import HowItWorks   from './components/HowItWorks'
import Personas     from './components/Personas'
import Securite     from './components/Securite'
import FAQ          from './components/FAQ'
import CTAFinal     from './components/CTAFinal'
import Footer       from './components/Footer'

export default function LandingPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'BudgetFlow — Gestion budgétaire intelligente pour votre organisation'
    return () => { document.title = prev }
  }, [])

  return (
    <div style={{ fontFamily: 'Roboto, system-ui, sans-serif', background: '#fff', color: '#111827', overflowX: 'hidden' }}>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Personas />
        <Securite />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </div>
  )
}
