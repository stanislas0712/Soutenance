import { useScrollAnimation } from '../hooks/useScrollAnimation'

const TESTIMONIALS = [
  {
    initials: 'AK',
    avatarBg: 'bg-blue-600',
    name: 'Aminata Koné',
    role: 'Directrice Financière',
    company: 'Groupe Soleil CI',
    quote:
      "BudgetFlow a complètement transformé notre processus budgétaire. Ce qui nous prenait 3 semaines ne prend plus que 3 jours. L'interface est intuitive et le support en français est un vrai plus pour nos équipes.",
  },
  {
    initials: 'MS',
    avatarBg: 'bg-green-600',
    name: 'Moussa Sylla',
    role: 'Contrôleur de Gestion',
    company: 'TechAfrica SA',
    quote:
      "La fonctionnalité d'analyse IA est bluffante. Elle nous a aidés à identifier des économies potentielles de 15% sur notre budget annuel en détectant des redondances que nous n'aurions jamais vues manuellement.",
  },
  {
    initials: 'FD',
    avatarBg: 'bg-purple-600',
    name: 'Fatou Diallo',
    role: 'DAF',
    company: 'Holding West Finance',
    quote:
      "Le workflow de validation est exactement ce dont nous avions besoin. Chaque approbateur reçoit ses notifications, les délais sont respectés et nous avons une traçabilité complète pour nos audits.",
  },
]

function TestimonialCard({ testimonial, index, visible }) {
  const { initials, avatarBg, name, role, company, quote } = testimonial

  return (
    <>
      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 relative overflow-hidden cursor-default transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl"
        style={visible ? { animation: `cardFadeIn 0.6s ease ${index * 0.15}s both` } : { opacity: 0 }}
      >
        {/* Decorative quote mark */}
        <span
          className="text-8xl font-serif text-blue-100 absolute top-2 right-6 leading-none select-none pointer-events-none"
          aria-hidden="true"
        >
          "
        </span>

        {/* Stars */}
        <div className="flex gap-1 mb-4" aria-label="5 étoiles sur 5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-amber-400 text-xl" aria-hidden="true">★</span>
          ))}
        </div>

        {/* Quote */}
        <p className="text-gray-600 text-sm leading-relaxed italic mb-6 relative z-10">
          "{quote}"
        </p>

        {/* Avatar row */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-5 mt-auto">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarBg}`}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{name}</p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">{role}, {company}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Testimonials() {
  const [ref, visible] = useScrollAnimation(0.08)

  return (
    <section id="testimonials" className="py-24 px-6 bg-blue-50" aria-labelledby="testimonials-title">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
            Témoignages
          </p>
          <h2 id="testimonials-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Plus de 500 entreprises nous font confiance pour gérer leurs budgets.
            Voici quelques retours de nos utilisateurs.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
