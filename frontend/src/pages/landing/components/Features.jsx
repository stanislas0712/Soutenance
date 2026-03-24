import { useState } from 'react'
import { Layers, CheckCircle, TrendingUp, Cpu, BarChart2, Shield } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const FEATURES = [
  {
    Icon: Layers,
    title: 'Gestion hiérarchique des budgets',
    description:
      'Organisez vos budgets en sections, articles et sous-lignes. Gérez plusieurs projets simultanément avec une vision claire de chaque niveau hiérarchique.',
  },
  {
    Icon: CheckCircle,
    title: 'Workflow de validation',
    description:
      "Définissez des circuits d'approbation personnalisés. Chaque budget suit un parcours de validation clair avec notifications automatiques à chaque étape.",
  },
  {
    Icon: TrendingUp,
    title: 'Suivi des dépenses en temps réel',
    description:
      "Visualisez l'avancement de vos dépenses par rapport au budget prévu. Recevez des alertes intelligentes avant tout dépassement.",
  },
  {
    Icon: Cpu,
    title: 'Analyse IA intégrée',
    description:
      'Notre moteur IA analyse vos patterns de dépenses, détecte les anomalies et vous propose des recommandations pour optimiser votre gestion financière.',
  },
  {
    Icon: BarChart2,
    title: 'Rapports et statistiques',
    description:
      'Générez des rapports détaillés en un clic. Exportez vos données en PDF ou Excel pour vos réunions de direction et audits financiers.',
  },
  {
    Icon: Shield,
    title: "Sécurité et contrôle d'accès",
    description:
      "Définissez des rôles et permissions granulaires. Chaque utilisateur accède uniquement aux données correspondant à ses responsabilités.",
  },
]

function FeatureCard({ feature, index, visible }) {
  const [hovered, setHovered] = useState(false)
  const { Icon, title, description } = feature

  return (
    <div
      className={`bg-white border rounded-2xl p-8 cursor-default transition-all duration-200 ${
        hovered
          ? 'shadow-lg border-blue-200 -translate-y-1'
          : 'border-gray-100 shadow-sm'
      } ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={visible ? { animation: `featFadeUp 0.6s ease ${index * 0.1}s both` } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-200 ${hovered ? 'bg-blue-100' : 'bg-blue-50'}`}>
        <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed m-0">{description}</p>
    </div>
  )
}

export default function Features() {
  const [ref, visible] = useScrollAnimation(0.08)

  return (
    <>
      <style>{`
        @keyframes featFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section id="features" className="py-24 px-6 bg-white" aria-labelledby="features-title">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div
            ref={ref}
            className={`text-center mb-16 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
              Fonctionnalités
            </p>
            <h2 id="features-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">
              Tout ce dont vous avez besoin pour maîtriser vos budgets
            </h2>
            <p className="text-lg text-gray-500 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
              Une plateforme complète qui couvre l'ensemble du cycle de vie de vos budgets,
              de la création à l'archivage, en passant par la validation et le suivi.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
                visible={visible}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
