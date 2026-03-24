import { useScrollAnimation } from '../hooks/useScrollAnimation'

const STEPS = [
  {
    number: '01',
    tag: 'ALLOCATION',
    color: '#3B82F6',
    colorLight: '#EFF6FF',
    title: "L'administrateur alloue les enveloppes",
    description:
      "Définissez le budget global annuel puis répartissez-le par département (Informatique, RH, Comptabilité…). Chaque département reçoit son enveloppe budgétaire avec un montant alloué, un suivi de consommation et un taux d'utilisation en temps réel.",
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80',
    imageAlt: "Administrateur allouant les enveloppes budgétaires",
  },
  {
    number: '02',
    tag: 'CRÉATION',
    color: '#10B981',
    colorLight: '#F0FDF4',
    title: 'Les gestionnaires créent leurs budgets',
    description:
      "Chaque gestionnaire crée ses budgets opérationnels en structurant les dépenses par catégories et sous-lignes. L'interface intuitive permet d'importer des données, d'ajouter des pièces justificatives et de soumettre le budget en un clic.",
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80',
    imageAlt: 'Gestionnaire créant un budget sur ordinateur',
  },
  {
    number: '03',
    tag: 'VALIDATION',
    color: '#8B5CF6',
    colorLight: '#F5F3FF',
    title: 'Le comptable valide les demandes',
    description:
      "Examen des budgets soumis, vérification des pièces justificatives, contrôle de cohérence avec l'enveloppe disponible. Le comptable approuve ou rejette chaque demande avec un motif, déclenchant automatiquement une notification au gestionnaire.",
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80',
    imageAlt: 'Comptable validant un budget',
  },
  {
    number: '04',
    tag: 'EXÉCUTION',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
    title: 'Suivi en temps réel des dépenses',
    description:
      "Enregistrement des dépenses avec mise à jour automatique des soldes. Des alertes intelligentes sont déclenchées aux seuils critiques : 75% (orange), 90% (rouge vif) et 100% (dépassement). Chaque dépense est traçable avec sa pièce justificative.",
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
    imageAlt: 'Tableau de bord de suivi des dépenses',
  },
  {
    number: '05',
    tag: 'CLÔTURE',
    color: '#EC4899',
    colorLight: '#FDF2F8',
    title: 'Génération automatique des rapports',
    description:
      "En fin d'exercice, la plateforme génère automatiquement les rapports d'exécution budgétaire (PDF, Excel), les tableaux de synthèse KPIs, l'analyse des écarts prévu/réalisé et le journal d'audit complet pour les besoins de conformité.",
    image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=700&q=80',
    imageAlt: 'Rapports générés automatiquement',
  },
]

function StepCard({ step, index }) {
  const [ref, visible] = useScrollAnimation(0.12)
  const isReversed = index % 2 === 1
  const { number, tag, color, colorLight, title, description, image, imageAlt } = step

  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row items-center gap-12 transition-all duration-700 ${
        isReversed ? 'md:flex-row-reverse' : ''
      } ${
        visible
          ? 'opacity-100 translate-x-0'
          : isReversed
          ? 'opacity-0 translate-x-10'
          : 'opacity-0 -translate-x-10'
      }`}
    >
      {/* Image */}
      <div className="flex-1 w-full relative">
        <img
          src={image}
          alt={imageAlt}
          className="rounded-2xl shadow-lg object-cover w-full h-64 md:h-72"
          loading="lazy"
        />
        {/* Colored step badge on image */}
        <div
          className="absolute -top-3 -left-3 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-lg"
          style={{ background: color }}
          aria-hidden="true"
        >
          {number}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Tag + step */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
            style={{ background: colorLight, color }}
          >
            {tag}
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Étape {index + 1} / {STEPS.length}
          </span>
        </div>

        {/* Colored left border accent */}
        <div className="pl-4" style={{ borderLeft: `3px solid ${color}` }}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug tracking-tight">
            {title}
          </h3>
          <p className="text-base text-gray-500 leading-relaxed m-0">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const [headerRef, headerVisible] = useScrollAnimation(0.1)

  return (
    <section id="how-it-works" className="py-24 px-6 bg-slate-50" aria-labelledby="how-it-works-title">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
            Comment ça marche
          </p>
          <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Un workflow simple en 5 étapes
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            De l'allocation initiale à la clôture de l'exercice, BudgetFlow structure
            et sécurise chaque étape de votre cycle budgétaire.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {STEPS.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
