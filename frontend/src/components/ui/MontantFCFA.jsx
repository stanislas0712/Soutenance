/**
 * MontantFCFA — Affiche un montant en FCFA avec formatage cohérent.
 *
 * @example <MontantFCFA montant={1500000} />
 * @example <MontantFCFA montant={1500000} compact />
 * @example <MontantFCFA montant={-200000} signe />
 * @example <MontantFCFA montant={750000} sansDevise style={{ fontSize: 18 }} />
 */
import { formaterMontant, formaterMontantCompact, formaterMontantSigne } from '../../utils/formatters'

export default function MontantFCFA({
  montant,
  compact  = false,
  signe    = false,
  sansDevise = false,
  decimales = 0,
  vide     = '—',
  className,
  style,
}) {
  let texte
  if (signe) {
    texte = formaterMontantSigne(montant, { avecDevise: !sansDevise, vide })
  } else if (compact) {
    texte = formaterMontantCompact(montant, { avecDevise: !sansDevise, vide })
  } else {
    texte = formaterMontant(montant, { decimales, avecDevise: !sansDevise, vide })
  }

  return (
    <span className={`font-mono${className ? ` ${className}` : ''}`} style={style}>
      {texte}
    </span>
  )
}
