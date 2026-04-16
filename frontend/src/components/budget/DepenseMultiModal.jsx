/**
 * DepenseMultiModal — Saisie d'une dépense sur plusieurs lignes budgétaires.
 * Affichage arborescent Catégorie > Sous-catégorie > Ligne (cases à cocher).
 * Pour chaque ligne cochée, un champ montant apparaît dans le panneau de droite.
 */
import { useState, useEffect } from 'react'
import { getLignesSelecteur, depenseMultiLigne } from '../../api/budget'
import { notifRefresh } from '../../utils/notifRefresh'
import { formaterMontant, getCouleurExecution } from '../../utils/formatters'
import {
  DollarSign, Paperclip, Check, AlertTriangle, ChevronDown, ChevronRight,
} from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))

export default function DepenseMultiModal({ budgetId, onClose, onSuccess }) {
  const [lignes,     setLignes]     = useState([])       // données du sélecteur
  const [loading,    setLoading]    = useState(true)
  const [openCats,   setOpenCats]   = useState(new Set()) // catégories ouvertes

  // sélection : { [ligne_id]: montant_string }
  const [selection,  setSelection]  = useState({})

  const [note,       setNote]       = useState('')
  const [files,      setFiles]      = useState([])
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  /* ── Chargement des lignes ─────────────────────────────────────────── */
  useEffect(() => {
    getLignesSelecteur(budgetId)
      .then(r => {
        const data = r.data?.data ?? []
        setLignes(data)
        setOpenCats(new Set(data.map(l => l.categorie)))
      })
      .catch(() => setError('Impossible de charger les lignes budgétaires.'))
      .finally(() => setLoading(false))
  }, [budgetId])

  /* ── Groupage catégorie > sous-catégorie ───────────────────────────── */
  const grouped = {}
  for (const l of lignes) {
    if (!grouped[l.categorie]) grouped[l.categorie] = {}
    if (!grouped[l.categorie][l.sous_categorie]) grouped[l.categorie][l.sous_categorie] = []
    grouped[l.categorie][l.sous_categorie].push(l)
  }

  const toggleCat = (cat) =>
    setOpenCats(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })

  const toggleLigne = (ligneId) => {
    setSelection(prev => {
      const next = { ...prev }
      if (next[ligneId] !== undefined) delete next[ligneId]
      else next[ligneId] = ''
      return next
    })
  }

  const setMontant = (ligneId, val) => {
    setSelection(prev => ({ ...prev, [ligneId]: val }))
  }

  /* ── Lignes sélectionnées (dans l'ordre d'apparition) ─────────────── */
  const lignesSel = lignes.filter(l => selection[l.ligne_id] !== undefined)
  const total = lignesSel.reduce((s, l) => s + (parseFloat(selection[l.ligne_id]) || 0), 0)

  /* ── Compteur par catégorie ────────────────────────────────────────── */
  const nbSelByCat = {}
  for (const l of lignesSel) {
    nbSelByCat[l.categorie] = (nbSelByCat[l.categorie] || 0) + 1
  }

  /* ── Soumission ────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const valides = lignesSel.filter(l => parseFloat(selection[l.ligne_id]) > 0)
    if (!valides.length) { setError('Saisissez un montant pour au moins une ligne.'); return }
    for (const l of valides) {
      const m = parseFloat(selection[l.ligne_id])
      if (m > l.montant_disponible) {
        setError(`Le montant de « ${l.libelle} » dépasse le disponible (${fmt(l.montant_disponible)} FCFA).`)
        return
      }
    }
    setError(''); setSaving(true)
    try {
      const payload = valides.map(l => ({ ligne_id: l.ligne_id, montant: parseFloat(selection[l.ligne_id]) }))
      await depenseMultiLigne(budgetId, payload, note, files[0] || null, files.slice(1))
      notifRefresh()
      onSuccess()
    } catch (err) {
      const erreurs = err.response?.data?.erreurs
      setError(err.response?.data?.detail || (erreurs ? erreurs.join(' | ') : 'Erreur lors de l\'enregistrement.'))
    } finally {
      setSaving(false)
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 900, width: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Header ── */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={16} strokeWidth={2} style={{ color: 'var(--color-success-600)' }} />
            Enregistrer une dépense
          </h2>
          {lignesSel.length > 0 && (
            <span style={{
              fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 9999,
              background: 'var(--color-success-50)', color: 'var(--color-success-700)',
              border: '1px solid var(--color-success-200)',
            }}>
              {lignesSel.length} ligne{lignesSel.length > 1 ? 's' : ''} sélectionnée{lignesSel.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Corps ── */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* ══ Panneau gauche — arbre catégories ══ */}
            <div style={{
              width: '55%', minWidth: 280, borderRight: '1px solid var(--color-gray-100)',
              overflowY: 'auto', padding: '16px 0',
            }}>
              <div style={{ padding: '0 16px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', letterSpacing: '.5px' }}>
                SÉLECTIONNER LES LIGNES
              </div>

              {loading && (
                <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', color: 'var(--color-gray-400)' }}>
                  <span className="spinner-sm" /> Chargement…
                </div>
              )}

              {!loading && !lignes.length && (
                <div style={{ padding: '24px 16px', fontSize: '12px', color: 'var(--color-gray-400)' }}>
                  Aucune ligne disponible sur ce budget.
                </div>
              )}

              {!loading && Object.entries(grouped).map(([cat, sousCats]) => {
                const isOpen  = openCats.has(cat)
                const nbSel   = nbSelByCat[cat] || 0
                // nb lignes totales dans cette catégorie
                const nbTotal = Object.values(sousCats).reduce((s, arr) => s + arr.length, 0)

                return (
                  <div key={cat}>
                    {/* ── Catégorie ── */}
                    <div
                      onClick={() => toggleCat(cat)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', cursor: 'pointer', userSelect: 'none',
                        background: isOpen ? 'var(--color-gray-50)' : '#fff',
                        borderBottom: '1px solid var(--color-gray-100)',
                        borderTop: '1px solid var(--color-gray-100)',
                      }}
                    >
                      {isOpen
                        ? <ChevronDown size={13} strokeWidth={2.5} style={{ color: 'var(--color-gray-500)', flexShrink: 0 }} />
                        : <ChevronRight size={13} strokeWidth={2.5} style={{ color: 'var(--color-gray-500)', flexShrink: 0 }} />
                      }
                      <span style={{ flex: 1, fontSize: '12.5px', fontWeight: 700, color: 'var(--color-gray-800)' }}>
                        {cat}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-gray-400)', fontWeight: 500 }}>
                        {nbTotal} ligne{nbTotal > 1 ? 's' : ''}
                      </span>
                      {nbSel > 0 && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: 9999,
                          background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                          marginLeft: 4,
                        }}>
                          {nbSel} ✓
                        </span>
                      )}
                    </div>

                    {isOpen && Object.entries(sousCats).map(([sc, scLignes]) => (
                      <div key={sc}>
                        {/* Sous-catégorie */}
                        <div style={{
                          padding: '5px 16px 5px 32px',
                          fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)',
                          background: '#FAFAFA',
                          borderBottom: '1px solid var(--color-gray-50)',
                          letterSpacing: '.2px',
                        }}>
                          {sc}
                        </div>

                        {/* Lignes */}
                        {scLignes.map(l => {
                          const epuisee  = l.montant_disponible <= 0
                          const isSel    = selection[l.ligne_id] !== undefined
                          const couleur  = getCouleurExecution(l.taux_consommation)
                          const pct      = Math.min(l.taux_consommation, 100)

                          return (
                            <div
                              key={l.ligne_id}
                              onClick={() => !epuisee && toggleLigne(l.ligne_id)}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '9px 16px 9px 44px',
                                borderBottom: '1px solid var(--color-gray-50)',
                                cursor: epuisee ? 'not-allowed' : 'pointer',
                                background: isSel ? 'var(--color-primary-50)' : epuisee ? '#fafafa' : '#fff',
                                opacity: epuisee ? 0.5 : 1,
                                borderLeft: isSel ? '3px solid var(--color-primary-500)' : '3px solid transparent',
                                transition: 'background .1s',
                              }}
                            >
                              {/* Checkbox custom */}
                              <div style={{
                                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
                                border: isSel ? 'none' : '2px solid var(--color-gray-300)',
                                background: isSel ? 'var(--color-primary-600)' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .1s',
                              }}>
                                {isSel && <Check size={10} strokeWidth={3} color="#fff" />}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Nom + disponible */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                                  <span style={{
                                    fontSize: '12.5px',
                                    fontWeight: isSel ? 600 : 400,
                                    color: epuisee ? 'var(--color-gray-400)' : 'var(--color-gray-800)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}>
                                    {l.libelle}
                                  </span>
                                  <span style={{
                                    fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', flexShrink: 0,
                                    color: epuisee ? 'var(--color-gray-400)' : 'var(--color-success-700)',
                                  }}>
                                    {epuisee ? 'Épuisé' : `${fmt(l.montant_disponible)} F`}
                                  </span>
                                </div>
                                {/* Barre de consommation */}
                                <div style={{ height: 3, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: couleur, borderRadius: 3 }} />
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--color-gray-400)', marginTop: 2 }}>
                                  {l.taux_consommation.toFixed(0)}% consommé
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* ══ Panneau droit — montants + note + fichiers ══ */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto',
              padding: '16px',
            }}>

              {lignesSel.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-gray-400)', textAlign: 'center', gap: 10,
                }}>
                  <div style={{ fontSize: '32px' }}>☑️</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-500)' }}>
                    Cochez les lignes à dépenser
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Cliquez sur une ligne dans le panneau gauche pour la sélectionner.
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Lignes sélectionnées avec montant ── */}
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', letterSpacing: '.5px', marginBottom: 10 }}>
                    MONTANTS PAR LIGNE
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {lignesSel.map(l => {
                      const montantVal = parseFloat(selection[l.ligne_id]) || 0
                      const depasse = montantVal > l.montant_disponible && montantVal > 0
                      return (
                        <div key={l.ligne_id} style={{
                          padding: '10px 12px', borderRadius: 8,
                          border: `1px solid ${depasse ? 'var(--color-danger-200)' : 'var(--color-gray-200)'}`,
                          background: depasse ? 'var(--color-danger-50)' : '#fff',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.libelle}
                              </div>
                              <div style={{ fontSize: '10.5px', color: 'var(--color-gray-500)' }}>
                                {l.categorie} › {l.sous_categorie}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleLigne(l.ligne_id)}
                              style={{ fontSize: '10px', color: 'var(--color-danger-500)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px 6px' }}
                            >
                              ✕ Retirer
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="number" min={0.01} step="0.01"
                              required
                              className="form-input"
                              style={{ fontFamily: 'var(--font-mono)', flex: 1 }}
                              placeholder="Montant (FCFA)"
                              value={selection[l.ligne_id]}
                              onChange={e => setMontant(l.ligne_id, e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              / {fmt(l.montant_disponible)} F
                            </span>
                          </div>
                          {depasse && (
                            <p style={{ fontSize: '11px', color: 'var(--color-danger-600)', marginTop: 4, fontWeight: 600 }}>
                              ⚠ Dépasse le disponible de {fmt(montantVal - l.montant_disponible)} FCFA
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* ── Total ── */}
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                    background: 'var(--color-primary-50)',
                    border: '1px solid var(--color-primary-200)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-primary-800)' }}>
                      Total dépense
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary-700)' }}>
                      {fmt(total)} FCFA
                    </span>
                  </div>

                  {/* ── Note ── */}
                  <div style={{ marginBottom: 14 }}>
                    <label className="form-label">Note / Référence de facture</label>
                    <input
                      className="form-input"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Ex : Facture N°2025-042 — Fournisseur ABC"
                    />
                  </div>

                  {/* ── Pièces justificatives ── */}
                  <div>
                    <label className="form-label">Pièce(s) justificative(s)</label>
                    <div style={{
                      border: '1.5px dashed var(--color-gray-300)', borderRadius: 8,
                      padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
                      background: 'var(--color-gray-50)',
                    }}>
                      <Paperclip size={14} strokeWidth={2} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                      <input
                        type="file" multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        onChange={e => setFiles(Array.from(e.target.files))}
                        style={{ fontSize: '12px', flex: 1 }}
                      />
                    </div>
                    <p className="form-hint">PDF, image, Word, Excel — sélection multiple possible</p>
                    {files.length > 0 && (
                      <ul style={{ marginTop: 4, fontSize: '11px', color: 'var(--color-gray-500)', listStyle: 'disc', paddingLeft: 16 }}>
                        {files.map((f, i) => <li key={i}>{f.name}</li>)}
                      </ul>
                    )}
                  </div>
                </>
              )}

              {/* ── Erreur ── */}
              {error && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 12px',
                  borderRadius: 8, marginTop: 12,
                  background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)',
                }}>
                  <AlertTriangle size={13} style={{ color: 'var(--color-danger-500)', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: 'var(--color-danger-700)', fontSize: '12px' }}>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer" style={{ flexShrink: 0 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-md">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || lignesSel.length === 0 || !lignesSel.some(l => parseFloat(selection[l.ligne_id]) > 0)}
              className="btn btn-success btn-md"
              style={{ gap: 6 }}
            >
              {saving
                ? <><span className="spinner-sm" /> Enregistrement…</>
                : <><Check size={14} strokeWidth={2.5} /> Confirmer la dépense</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
