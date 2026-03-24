import { useScrollAnimation } from '../hooks/useScrollAnimation'

const PERSONAS = [
  {
    role: 'Administrateur',
    tagColor: '#3B82F6',
    tagBg: '#EFF6FF',
    avatarBg: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
    initials: 'AD',
    description: 'Pour les responsables administratifs',
    features: [
      'Allocation des enveloppes budgétaires par département',
      'Gestion complète des utilisateurs et des rôles',
      'Création et gestion des départements',
      "Accès aux logs d'audit et KPIs",
      'Paramétrage du budget annuel global',
    ],
    quote: "La plateforme nous a fait gagner un temps considérable sur la gestion budgétaire. La visibilité par département est exactement ce dont nous avions besoin.",
    author: 'Marie K., Directrice Administrative',
  },
  {
    role: 'Gestionnaire',
    tagColor: '#10B981',
    tagBg: '#F0FDF4',
    avatarBg: 'linear-gradient(135deg, #047857, #10B981)',
    initials: 'GT',
    description: 'Pour les chefs de projet et de département',
    features: [
      'Création de budgets opérationnels structurés',
      'Enregistrement des dépenses avec justificatifs',
      'Upload de pièces justificatives (PDF, JPG, PNG)',
      'Suivi en temps réel de la consommation',
      'Demande de modification et resoumission',
    ],
    quote: "Je peux créer et suivre mes budgets en quelques clics. Les alertes automatiques m'évitent les mauvaises surprises en fin de mois.",
    author: 'Jean B., Chef de Projet Informatique',
  },
  {
    role: 'Comptable',
    tagColor: '#8B5CF6',
    tagBg: '#F5F3FF',
    avatarBg: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
    initials: 'CT',
    description: 'Pour les responsables financiers',
    features: [
      'Validation et approbation des budgets soumis',
      'Vérification des pièces justificatives',
      'Génération de rapports PDF et Excel',
      'Vue consolidée de toutes les dépenses',
      'Accès aux KPIs et tableaux de bord avancés',
    ],
    quote: "La traçabilité complète facilite grandement nos audits. Chaque opération est horodatée et justifiée. C'est exactement ce que les auditeurs attendent.",
    author: 'Fatima D., Responsable Comptable',
  },
]

function PersonaCard({ persona, index, visible }) {
  const { role, tagColor, tagBg, avatarBg, initials, description, features, quote, author } = persona

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      style={
        visible
          ? { animation: `personaFadeUp 0.6s ease ${index * 0.15}s both` }
          : { opacity: 0 }
      }
    >
      {/* Colored top strip */}
      <div className="h-1.5 w-full" style={{ background: tagColor }} />

      <div className="p-8 flex flex-col flex-1">
        {/* Avatar + role */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-md"
            style={{ background: avatarBg }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full tracking-wide"
                style={{ background: tagBg, color: tagColor }}
              >
                {role}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-tight">{description}</p>
          </div>
        </div>

        {/* Feature list */}
        <ul className="list-none p-0 m-0 space-y-2.5 mb-6 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="mt-0.5 text-xs font-bold flex-shrink-0" style={{ color: tagColor }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Quote */}
        <div
          className="rounded-xl p-4 mt-auto"
          style={{ background: tagBg }}
        >
          <p className="text-sm text-gray-600 italic leading-relaxed mb-2">"{quote}"</p>
          <p className="text-xs font-semibold" style={{ color: tagColor }}>— {author}</p>
        </div>
      </div>
    </div>
  )
}

export default function Personas() {
  const [ref, visible] = useScrollAnimation(0.08)

  return (
    <>
      <style>{`
        @keyframes personaFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section id="personas" className="py-24 px-6 bg-white" aria-labelledby="personas-title">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            ref={ref}
            className={`text-center mb-16 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
              Pour qui ?
            </p>
            <h2 id="personas-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Une solution pour chaque acteur
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              BudgetFlow adapte ses fonctionnalités à chaque profil.
              Trois rôles, une plateforme unifiée.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PERSONAS.map((persona, index) => (
              <PersonaCard
                key={persona.role}
                persona={persona}
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
