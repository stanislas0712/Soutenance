/**
 * DateDisplay — Affiche une date en français avec formatage cohérent.
 *
 * @example <DateDisplay date="2025-03-15" />                   → 15/03/2025
 * @example <DateDisplay date="2025-03-15" format="long" />     → 15 mars 2025
 * @example <DateDisplay date="2025-03-15T14:30" format="datetime" />  → 15/03/2025 à 14:30
 * @example <DateDisplay date="2025-03-14" relative />          → hier
 */
import { formaterDate, formaterDateRelative } from '../../utils/formatters'

export default function DateDisplay({
  date,
  format    = 'simple',
  relative  = false,
  vide      = '—',
  className,
  style,
}) {
  const texte = relative
    ? formaterDateRelative(date)
    : formaterDate(date, format, vide)

  return (
    <span className={className} style={style}>
      {texte}
    </span>
  )
}
