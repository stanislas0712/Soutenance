/**
 * BudgetFlow — Constantes et configurations de statuts
 * Source de vérité pour tous les badges, couleurs, icônes et labels.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. STATUTS BUDGET
// ═══════════════════════════════════════════════════════════════════════════════

export const STATUT_BUDGET_CONFIG = {
  BROUILLON: {
    label:       'Brouillon',
    labelCourt:  'Brouillon',
    couleur:     '#6B7280',
    bg:          '#F9FAFB',
    border:      '#E5E7EB',
    icone:       'FileText',
    description: 'En cours de rédaction, non soumis.',
  },
  SOUMIS: {
    label:       'Soumis',
    labelCourt:  'Soumis',
    couleur:     '#2563EB',
    bg:          '#EFF6FF',
    border:      '#BFDBFE',
    icone:       'Clock',
    description: 'Soumis à validation, en attente de décision.',
  },
  APPROUVE: {
    label:       'Approuvé',
    labelCourt:  'Approuvé',
    couleur:     '#059669',
    bg:          '#ECFDF5',
    border:      '#6EE7B7',
    icone:       'CheckCircle2',
    description: 'Approuvé par le comptable, dépenses autorisées.',
  },
  REJETE: {
    label:       'Rejeté',
    labelCourt:  'Rejeté',
    couleur:     '#DC2626',
    bg:          '#FEF2F2',
    border:      '#FECACA',
    icone:       'XCircle',
    description: 'Rejeté — corrections requises.',
  },
  CLOTURE: {
    label:       'Clôturé',
    labelCourt:  'Clôturé',
    couleur:     '#7C3AED',
    bg:          '#F5F3FF',
    border:      '#DDD6FE',
    icone:       'Lock',
    description: 'Exercice terminé, plus de modifications possibles.',
  },
  ARCHIVE: {
    label:       'Archivé',
    labelCourt:  'Archivé',
    couleur:     '#9CA3AF',
    bg:          '#F3F4F6',
    border:      '#D1D5DB',
    icone:       'Archive',
    description: 'Archivé pour consultation historique.',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. STATUTS DÉPENSE
// ═══════════════════════════════════════════════════════════════════════════════

export const STATUT_DEPENSE_CONFIG = {
  SAISIE: {
    label:      'En attente',
    labelCourt: 'Attente',
    couleur:    '#D97706',
    bg:         '#FFFBEB',
    border:     '#FDE68A',
    icone:      'Clock',
    description: 'Dépense saisie, en attente de validation.',
  },
  VALIDEE: {
    label:      'Validée',
    labelCourt: 'Validée',
    couleur:    '#059669',
    bg:         '#ECFDF5',
    border:     '#6EE7B7',
    icone:      'CheckCircle2',
    description: 'Dépense validée par le comptable.',
  },
  REJETEE: {
    label:      'Rejetée',
    labelCourt: 'Rejetée',
    couleur:    '#DC2626',
    bg:         '#FEF2F2',
    border:     '#FECACA',
    icone:      'XCircle',
    description: 'Dépense rejetée — motif disponible.',
  },
  REMBOURSEE: {
    label:      'Remboursée',
    labelCourt: 'Remb.',
    couleur:    '#2563EB',
    bg:         '#EFF6FF',
    border:     '#BFDBFE',
    icone:      'RotateCcw',
    description: 'Dépense remboursée.',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PRIORITÉS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRIORITE_CONFIG = {
  HAUTE: {
    label:   'Haute',
    couleur: '#DC2626',
    bg:      '#FEF2F2',
    icone:   'AlertTriangle',
  },
  NORMALE: {
    label:   'Normale',
    couleur: '#D97706',
    bg:      '#FFFBEB',
    icone:   'Minus',
  },
  BASSE: {
    label:   'Basse',
    couleur: '#059669',
    bg:      '#ECFDF5',
    icone:   'ArrowDown',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. RÔLES
// ═══════════════════════════════════════════════════════════════════════════════

export const ROLE_CONFIG = {
  ADMINISTRATEUR: {
    label:   'Administrateur',
    couleur: '#7C3AED',
    bg:      '#F5F3FF',
    icone:   'ShieldCheck',
  },
  GESTIONNAIRE: {
    label:   'Gestionnaire',
    couleur: '#2563EB',
    bg:      '#EFF6FF',
    icone:   'Briefcase',
  },
  COMPTABLE: {
    label:   'Comptable',
    couleur: '#059669',
    bg:      '#ECFDF5',
    icone:   'Calculator',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CATÉGORIES DE DÉPENSES
// ═══════════════════════════════════════════════════════════════════════════════

export const CATEGORIE_CONFIG = {
  PERSONNEL:      { label: 'Personnel',      icone: 'Users' },
  EQUIPEMENT:     { label: 'Équipement',     icone: 'Monitor' },
  FONCTIONNEMENT: { label: 'Fonctionnement', icone: 'Settings' },
  INVESTISSEMENT: { label: 'Investissement', icone: 'TrendingUp' },
  FORMATION:      { label: 'Formation',      icone: 'BookOpen' },
  DEPLACEMENT:    { label: 'Déplacement',    icone: 'MapPin' },
  COMMUNICATION:  { label: 'Communication',  icone: 'MessageSquare' },
  SOUS_TRAITANCE: { label: 'Sous-traitance', icone: 'ExternalLink' },
  DIVERS:         { label: 'Divers',         icone: 'MoreHorizontal' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MODES DE PAIEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const MODE_PAIEMENT_CONFIG = {
  VIREMENT: { label: 'Virement bancaire', icone: 'ArrowRightLeft' },
  CHEQUE:   { label: 'Chèque',            icone: 'FileCheck' },
  ESPECES:  { label: 'Espèces',           icone: 'Banknote' },
  CARTE:    { label: 'Carte bancaire',    icone: 'CreditCard' },
  MOBILE:   { label: 'Mobile money',      icone: 'Smartphone' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. HELPER : getStatutConfig
// ═══════════════════════════════════════════════════════════════════════════════

const _MAPS = {
  budget:    STATUT_BUDGET_CONFIG,
  depense:   STATUT_DEPENSE_CONFIG,
  priorite:  PRIORITE_CONFIG,
  role:      ROLE_CONFIG,
  categorie: CATEGORIE_CONFIG,
  paiement:  MODE_PAIEMENT_CONFIG,
}

/**
 * Retourne la configuration d'un statut.
 *
 * @param {string} statut
 * @param {'budget'|'depense'|'priorite'|'role'|'categorie'|'paiement'} [type='budget']
 * @returns {object}
 *
 * @example getStatutConfig('APPROUVE', 'budget')
 * // { label: 'Approuvé', couleur: '#059669', bg: '#ECFDF5', ... }
 */
export function getStatutConfig(statut, type = 'budget') {
  const map = _MAPS[type] || STATUT_BUDGET_CONFIG
  return map[statut] || {
    label:   statut,
    couleur: '#6B7280',
    bg:      '#F9FAFB',
    border:  '#E5E7EB',
    icone:   'HelpCircle',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. NIVEAUX D'ALERTE (exécution budgétaire)
// ═══════════════════════════════════════════════════════════════════════════════

export const ALERTE_CONFIG = {
  NORMAL: {
    label:   'Normal',
    couleur: '#6B7280',
    bg:      '#F9FAFB',
    icone:   'CheckCircle2',
  },
  ATTENTION: {
    label:   'Attention',
    couleur: '#D97706',
    bg:      '#FFFBEB',
    icone:   'AlertTriangle',
  },
  ALERTE: {
    label:   'Alerte',
    couleur: '#DC2626',
    bg:      '#FEF2F2',
    icone:   'AlertOctagon',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. FILTRES PRÉDÉFINIS (réutilisés dans les pages de liste)
// ═══════════════════════════════════════════════════════════════════════════════

export const FILTRES_BUDGET = [
  { key: '',          label: 'Tous'      },
  { key: 'BROUILLON', label: 'Brouillons' },
  { key: 'SOUMIS',    label: 'Soumis'    },
  { key: 'APPROUVE',  label: 'Approuvés' },
  { key: 'REJETE',    label: 'Rejetés'   },
]

// R-COMPT-01 : le Comptable ne voit jamais BROUILLON (filtré côté API)
export const FILTRES_BUDGET_COMPTABLE = FILTRES_BUDGET.filter(f => f.key !== 'BROUILLON')

export const FILTRES_DEPENSE = [
  { key: '',        label: 'Toutes' },
  { key: 'SAISIE',  label: 'En attente' },
  { key: 'VALIDEE', label: 'Validées' },
  { key: 'REJETEE', label: 'Rejetées' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// 10. SEUILS DE JAUGE
// ═══════════════════════════════════════════════════════════════════════════════

/** Seuils de couleur pour les jauges d'exécution (taux en %) */
export const JAUGE_SEUILS = {
  BAS:     50,   // < 50 % → bleu
  NORMAL:  80,   // 50–80 % → vert
  HAUT:    95,   // 80–95 % → orange
  // > 95 % → rouge
}

export const JAUGE_COULEURS = {
  BAS:     '#3B82F6',  // bleu
  NORMAL:  '#22C55E',  // vert
  HAUT:    '#F59E0B',  // orange
  DEPASSE: '#EF4444',  // rouge
}
