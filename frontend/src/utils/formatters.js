/**
 * BudgetFlow — Formateurs communs (JavaScript)
 * Fonctions de formatage pour les montants FCFA, dates, statuts et références.
 */

const NNBS = '\u202f' // narrow no-break space

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MONTANTS FCFA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formate un montant en FCFA avec espace insécable comme séparateur de milliers.
 *
 * @param {number|string|null} montant
 * @param {object} options
 * @param {number}  [options.decimales=0]
 * @param {boolean} [options.avecDevise=true]
 * @param {string}  [options.vide='—']
 * @returns {string}
 *
 * @example formaterMontant(1500000)         // '1 500 000 FCFA'
 * @example formaterMontant(1500000, { avecDevise: false }) // '1 500 000'
 */
export function formaterMontant(montant, { decimales = 0, avecDevise = true, vide = '—' } = {}) {
  if (montant === null || montant === undefined || montant === '') return vide
  const valeur = parseFloat(montant)
  if (isNaN(valeur)) return vide

  // Partie entière avec séparateur espace insécable
  const abs = Math.abs(valeur)
  const entier = Math.floor(abs)
  const entierFmt = entier.toLocaleString('fr-FR').replace(/\s/g, NNBS).replace(/,/g, NNBS)

  let resultat
  if (decimales > 0) {
    const dec = (abs - entier).toFixed(decimales).slice(2)
    resultat = `${entierFmt},${dec}`
  } else {
    resultat = entierFmt
  }

  if (valeur < 0) resultat = `-${resultat}`
  return avecDevise ? `${resultat} FCFA` : resultat
}

/**
 * Formate un montant de façon compacte (K / M / Md).
 *
 * @param {number|string|null} montant
 * @param {object} options
 * @param {number}  [options.decimales=1]
 * @param {boolean} [options.avecDevise=true]
 * @param {string}  [options.vide='—']
 * @returns {string}
 *
 * @example formaterMontantCompact(1500000)   // '1,5M FCFA'
 * @example formaterMontantCompact(750000)    // '750K FCFA'
 */
export function formaterMontantCompact(montant, { decimales = 1, avecDevise = true, vide = '—' } = {}) {
  if (montant === null || montant === undefined || montant === '') return vide
  const valeur = parseFloat(montant)
  if (isNaN(valeur)) return vide

  const signe = valeur < 0 ? '-' : ''
  const abs = Math.abs(valeur)

  let n, suffixe
  if (abs >= 1_000_000_000) {
    n = abs / 1_000_000_000; suffixe = 'Md'
  } else if (abs >= 1_000_000) {
    n = abs / 1_000_000; suffixe = 'M'
  } else if (abs >= 1_000) {
    n = abs / 1_000; suffixe = 'K'
  } else {
    return formaterMontant(montant, { decimales: 0, avecDevise, vide })
  }

  const nArrondi = parseFloat(n.toFixed(decimales))
  const nFmt = Number.isInteger(nArrondi)
    ? `${nArrondi}`
    : `${nArrondi}`.replace('.', ',')

  const texte = `${signe}${nFmt}${suffixe}`
  return avecDevise ? `${texte} FCFA` : texte
}

/**
 * Formate un montant avec signe (+/-).
 *
 * @example formaterMontantSigne(500000)   // '+500 000 FCFA'
 * @example formaterMontantSigne(-200000)  // '-200 000 FCFA'
 */
export function formaterMontantSigne(montant, { avecDevise = true, vide = '—' } = {}) {
  if (montant === null || montant === undefined || montant === '') return vide
  const valeur = parseFloat(montant)
  if (isNaN(valeur)) return vide
  const fmt = formaterMontant(Math.abs(valeur), { avecDevise })
  return valeur >= 0 ? `+${fmt}` : `-${fmt}`
}

/**
 * Calcule et formate l'écart entre réalisé et prévu.
 *
 * @returns {{ montant: string, pourcentage: string, statut: string, couleur: string }}
 */
export function formaterEcart(montantReel, montantPrevu) {
  const reel  = parseFloat(montantReel  ?? 0) || 0
  const prevu = parseFloat(montantPrevu ?? 0) || 0
  const ecart = reel - prevu
  const taux  = prevu !== 0 ? (reel / prevu) * 100 : 0

  const signe = ecart >= 0 ? '+' : ''
  const montantFmt = `${signe}${formaterMontant(ecart)}`

  const tauxArrondi = Math.round(taux * 10) / 10
  const signeTaux = tauxArrondi >= 0 ? '+' : ''
  const pctFmt = `${signeTaux}${`${tauxArrondi}`.replace('.', ',')} %`

  let statut, couleur
  if (taux < 50)       { statut = 'sous_consomme'; couleur = '#D97706' }
  else if (taux <= 80) { statut = 'normal';        couleur = '#22C55E' }
  else if (taux <= 95) { statut = 'sur_consomme';  couleur = '#F59E0B' }
  else                 { statut = 'depasse';        couleur = '#EF4444' }

  return { montant: montantFmt, pourcentage: pctFmt, statut, couleur }
}

/**
 * Calcule et formate un taux en pourcentage.
 *
 * @example formaterTaux(750000, 1000000)  // '75,0 %'
 */
export function formaterTaux(numerateur, denominateur, { decimales = 1, vide = '—' } = {}) {
  const num = parseFloat(numerateur ?? 0)
  const den = parseFloat(denominateur ?? 0)
  if (!den || isNaN(num) || isNaN(den)) return vide
  const taux = (num / den) * 100
  return `${taux.toFixed(decimales).replace('.', ',')} %`
}

/**
 * Retourne la couleur CSS selon le taux d'exécution.
 * 0–50 % → bleu, 50–80 % → vert, 80–95 % → orange, >95 % → rouge.
 */
export function getCouleurExecution(taux) {
  if (taux === null || taux === undefined) return '#6B7280'
  const t = parseFloat(taux)
  if (t < 50)  return '#D97706'
  if (t < 80)  return '#22C55E'
  if (t < 95)  return '#F59E0B'
  return '#EF4444'
}


// ═══════════════════════════════════════════════════════════════════════════════
// 2. DATES
// ═══════════════════════════════════════════════════════════════════════════════

const MOIS_LONG  = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const MOIS_COURT = ['', 'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
                    'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.']

/** Parse une valeur en objet Date, retourne null si invalide. */
function _parseDate(valeur) {
  if (!valeur) return null
  if (valeur instanceof Date) return valeur
  if (typeof valeur === 'string') {
    // Forcer interprétation locale pour les dates sans heure (évite décalage UTC)
    if (/^\d{4}-\d{2}-\d{2}$/.test(valeur)) {
      const [y, m, d] = valeur.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    const d = new Date(valeur)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * Formate une date en français.
 *
 * @param {Date|string|null} valeur
 * @param {'simple'|'long'|'court'|'datetime'|'mois_an'} [format='simple']
 * @param {string} [vide='—']
 * @returns {string}
 *
 * @example formaterDate('2025-03-15')                    // '15/03/2025'
 * @example formaterDate('2025-03-15', 'long')            // '15 mars 2025'
 */
export function formaterDate(valeur, format = 'simple', vide = '—') {
  const d = _parseDate(valeur)
  if (!d) return vide

  const j = d.getDate()
  const m = d.getMonth() + 1
  const a = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const jj = String(j).padStart(2, '0')
  const mm2 = String(m).padStart(2, '0')

  switch (format) {
    case 'long':     return `${j} ${MOIS_LONG[m]} ${a}`
    case 'court':    return `${j} ${MOIS_COURT[m]} ${a}`
    case 'datetime': return `${jj}/${mm2}/${a} à ${hh}:${mm}`
    case 'mois_an':  return `${MOIS_LONG[m]} ${a}`
    default:         return `${jj}/${mm2}/${a}`
  }
}

/**
 * Formate une date de façon relative au moment présent.
 *
 * @example formaterDateRelative('2025-03-14T10:00:00')  // 'hier'
 */
export function formaterDateRelative(valeur, { maintenant } = {}) {
  const d = _parseDate(valeur)
  if (!d) return '—'

  const now     = maintenant || new Date()
  const secondes = Math.floor((now - d) / 1000)

  if (secondes < 0)     return formaterDate(valeur)
  if (secondes < 60)    return "à l'instant"
  if (secondes < 3600)  {
    const m = Math.floor(secondes / 60)
    return `il y a ${m} minute${m > 1 ? 's' : ''}`
  }
  if (secondes < 86400) {
    const h = Math.floor(secondes / 3600)
    return `il y a ${h} heure${h > 1 ? 's' : ''}`
  }
  if (secondes < 172800) return 'hier'
  if (secondes < 604800) {
    const j = Math.floor(secondes / 86400)
    return `il y a ${j} jours`
  }
  return formaterDate(valeur)
}

/**
 * Formate une durée en jours en texte lisible.
 *
 * @example formaterDuree(45)   // '1 mois et 15 jours'
 * @example formaterDuree(400)  // '1 an et 35 jours'
 */
export function formaterDuree(jours, { vide = '—' } = {}) {
  if (jours === null || jours === undefined) return vide
  const j = Math.round(parseFloat(jours))
  if (isNaN(j) || j < 0) return vide
  if (j === 0) return '0 jour'
  if (j === 1) return '1 jour'
  if (j < 30)  return `${j} jours`
  if (j < 365) {
    const mois = Math.floor(j / 30)
    const reste = j % 30
    let texte = `${mois} mois`
    if (reste > 0) texte += ` et ${reste} jour${reste > 1 ? 's' : ''}`
    return texte
  }
  const ans = Math.floor(j / 365)
  const reste = j % 365
  let texte = `${ans} an${ans > 1 ? 's' : ''}`
  if (reste > 0) texte += ` et ${reste} jour${reste > 1 ? 's' : ''}`
  return texte
}

/**
 * Formate une période de début à fin.
 *
 * @example formaterPeriode('2025-01-01', '2025-12-31')
 * // 'du 1 janvier 2025 au 31 décembre 2025'
 */
export function formaterPeriode(dateDebut, dateFin, { vide = '—' } = {}) {
  if (!dateDebut && !dateFin) return vide
  const debut = formaterDate(dateDebut, 'long', '?')
  const fin   = formaterDate(dateFin,   'long', '?')
  return `du ${debut} au ${fin}`
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. NOMBRES ET POURCENTAGES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formate un pourcentage avec virgule française.
 *
 * @example formaterPourcentage(75.5)  // '75,5 %'
 */
export function formaterPourcentage(valeur, { decimales = 1, vide = '—' } = {}) {
  if (valeur === null || valeur === undefined) return vide
  const v = parseFloat(valeur)
  if (isNaN(v)) return vide
  return `${v.toFixed(decimales).replace('.', ',')}${NNBS}%`
}

/**
 * Calcule le taux d'exécution (0–100+).
 * Retourne 0 si le montant alloué est nul ou absent.
 */
export function calculerTauxExecution(consomme, alloue) {
  const c = parseFloat(consomme ?? 0) || 0
  const a = parseFloat(alloue   ?? 0) || 0
  if (a === 0) return 0
  return Math.round((c / a) * 10000) / 100  // 2 décimales
}


// ═══════════════════════════════════════════════════════════════════════════════
// 4. RÉFÉRENCES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalise une référence en majuscules.
 *
 * @example formaterReference('bud-2025-rh-00001')  // 'BUD-2025-RH-00001'
 */
export function formaterReference(reference, { vide = '—' } = {}) {
  if (!reference) return vide
  return String(reference).trim().toUpperCase()
}

/**
 * Génère une référence budget au format BUD-YYYY-DEPT-00042.
 */
export function genererReferenceBudget(annee, codeDepartement, sequence, { prefixe = 'BUD' } = {}) {
  const dept = String(codeDepartement).trim().toUpperCase().slice(0, 10)
  const seq  = String(sequence).padStart(5, '0')
  return `${prefixe}-${annee}-${dept}-${seq}`
}

/**
 * Génère une référence dépense au format DEP-YYYY-DEPT-00001.
 */
export function genererReferenceDepense(annee, codeDepartement, sequence, { prefixe = 'DEP' } = {}) {
  const dept = String(codeDepartement).trim().toUpperCase().slice(0, 10)
  const seq  = String(sequence).padStart(5, '0')
  return `${prefixe}-${annee}-${dept}-${seq}`
}


// ═══════════════════════════════════════════════════════════════════════════════
// 5. UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse une valeur numérique saisie par l'utilisateur.
 * Accepte '1 500 000', '1.500.000', '1,500,000' etc.
 * Retourne NaN si invalide.
 */
export function parseInputMontant(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return NaN
  // Supprimer tout sauf chiffres, virgule et point
  const cleaned = String(valeur).replace(/[^\d.,]/g, '')
  if (!cleaned) return NaN
  // Si virgule comme séparateur décimal (fr)
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
  }
  return parseFloat(cleaned)
}

/**
 * Formate un nombre d'octets en taille lisible (Ko, Mo, Go).
 */
export function formaterTailleFichier(octets) {
  if (!octets) return '0 o'
  if (octets < 1024) return `${octets} o`
  if (octets < 1_048_576) return `${(octets / 1024).toFixed(1)} Ko`
  if (octets < 1_073_741_824) return `${(octets / 1_048_576).toFixed(1)} Mo`
  return `${(octets / 1_073_741_824).toFixed(2)} Go`
}
