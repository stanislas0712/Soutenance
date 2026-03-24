/**
 * InputMontant — Champ de saisie pour les montants FCFA.
 * Accepte la saisie avec espaces ou points comme séparateurs de milliers.
 * Affiche la valeur formatée en lecture seule et gère la conversion.
 *
 * @example
 * <InputMontant
 *   label="Montant demandé"
 *   value={montant}
 *   onChange={setMontant}
 *   required
 * />
 */
import { useState, useEffect } from 'react'
import { parseInputMontant, formaterMontant } from '../../utils/formatters'

export default function InputMontant({
  label,
  value,
  onChange,
  placeholder = '0',
  required    = false,
  disabled    = false,
  min         = 0,
  max,
  error,
  hint,
  id,
  name,
  style,
}) {
  const [rawInput, setRawInput] = useState(value !== undefined && value !== null && value !== '' ? String(value) : '')
  const [focused,  setFocused]  = useState(false)

  // Sync externe → input (uniquement si pas focalisé)
  useEffect(() => {
    if (!focused) {
      setRawInput(value !== undefined && value !== null && value !== '' ? String(value) : '')
    }
  }, [value, focused])

  const handleChange = (e) => {
    const raw = e.target.value
    setRawInput(raw)
    const parsed = parseInputMontant(raw)
    if (!isNaN(parsed)) {
      onChange?.(parsed)
    } else if (raw === '' || raw === '-') {
      onChange?.('')
    }
  }

  const handleBlur = () => {
    setFocused(false)
    const parsed = parseInputMontant(rawInput)
    if (!isNaN(parsed)) {
      setRawInput(String(parsed))
    }
  }

  // Preview du montant formaté
  const preview = (() => {
    const parsed = parseInputMontant(rawInput)
    if (isNaN(parsed) || rawInput === '') return null
    return formaterMontant(parsed)
  })()

  const inputId = id || `input-montant-${name || Math.random().toString(36).slice(2)}`

  return (
    <div style={style}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-semibold text-[#374151] mb-[6px]"
        >
          {label}
          {required && <span className="text-[#EF4444] ml-[3px]">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          value={rawInput}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-input font-mono pr-[52px]${error ? ' error' : ''}`}
          aria-describedby={hint || preview ? `${inputId}-hint` : undefined}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#9CA3AF] pointer-events-none">
          FCFA
        </span>
      </div>
      {(preview || hint || error) && (
        <div id={`${inputId}-hint`} className="mt-1 text-[12px]">
          {error ? (
            <span className="text-[#DC2626]">{error}</span>
          ) : (
            <>
              {preview && (
                <span className="text-primary-600 font-mono font-semibold">
                  = {preview}
                </span>
              )}
              {hint && (
                <span className={`text-[#9CA3AF]${preview ? ' ml-2' : ''}`}>{hint}</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
