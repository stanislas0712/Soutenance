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
    icon: '🏛️',
  },
  {
    number: '02',
    tag: 'CRÉATION',
    color: '#10B981',
    colorLight: '#F0FDF4',
    title: 'Les gestionnaires créent leurs budgets',
    description:
      "Chaque gestionnaire crée ses budgets opérationnels en structurant les dépenses par catégories et sous-lignes. L'interface intuitive permet d'importer des données, d'ajouter des pièces justificatives et de soumettre le budget en un clic.",
    icon: '📋',
  },
  {
    number: '03',
    tag: 'VALIDATION',
    color: '#8B5CF6',
    colorLight: '#F5F3FF',
    title: 'Le comptable valide les demandes',
    description:
      "Examen des budgets soumis, vérification des pièces justificatives, contrôle de cohérence avec l'enveloppe disponible. Le comptable approuve ou rejette chaque demande avec un motif, déclenchant automatiquement une notification au gestionnaire.",
    icon: '✅',
  },
  {
    number: '04',
    tag: 'EXÉCUTION',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
    title: 'Suivi en temps réel des dépenses',
    description:
      "Enregistrement des dépenses avec mise à jour automatique des soldes. Des alertes intelligentes sont déclenchées aux seuils critiques : 75% (orange), 90% (rouge vif) et 100% (dépassement). Chaque dépense est traçable avec sa pièce justificative.",
    icon: '📊',
  },
  {
    number: '05',
    tag: 'CLÔTURE',
    color: '#EC4899',
    colorLight: '#FDF2F8',
    title: 'Génération automatique des rapports',
    description:
      "En fin d'exercice, la plateforme génère automatiquement les rapports d'exécution budgétaire (PDF, Excel), les tableaux de synthèse KPIs, l'analyse des écarts prévu/réalisé et le journal d'audit complet pour les besoins de conformité.",
    icon: '📄',
  },
]

function StepCard({ step, index }) {
  const [ref, visible] = useScrollAnimation(0.12)
  const { number, tag, color, colorLight, title, description, icon } = step

  return (
    <div
      ref={ref}
      className={`flex items-start gap-8 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Left: number + icon block */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md"
          style={{ background: color }}
        >
          {number}
        </div>
        {index < STEPS.length - 1 && (
          <div className="w-0.5 mt-3 flex-1 min-h-[48px]" style={{ background: `${color}30` }} />
        )}
      </div>

      {/* Right: content card */}
      <div
        className="flex-1 rounded-2xl p-6 mb-8 border"
        style={{ background: colorLight, borderColor: `${color}25` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
            style={{ background: '#fff', color }}
          >
            {tag}
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-auto">
            Étape {index + 1} / {STEPS.length}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed m-0">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const [headerRef, headerVisible] = useScrollAnimation(0.1)

  return (
    <section id="how-it-works" className="py-24 px-6 bg-slate-50" aria-labelledby="how-it-works-title">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
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

        {/* Steps timeline */}
        <div>
          {STEPS.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
