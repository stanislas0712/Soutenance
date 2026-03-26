/**
 * SelecteurLigne — Sélecteur de ligne budgétaire pour la saisie de dépenses.
 * Groupé par catégorie > sous-catégorie avec solde disponible en temps réel.
 * R-LB-07 : une ligne dont le solde <= 0 est grisée et non sélectionnable.
 */
import { useState, useEffect } from 'react'
import { getLignesSelecteur } from '../../api/budget'
import { formaterMontant, getCouleurExecution } from '../../utils/formatters'

export default function SelecteurLigne({ budgetId, value, onChange, error }) {
  const [lignes,   setLignes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [erreur,   setErreur]   = useState(null)
  const [openCats, setOpenCats] = useState(new Set())

  useEffect(() => {
    if (!budgetId) { setLoading(false); return }
    setLoading(true)
    setErreur(null)
    getLignesSelecteur(budgetId)
      .then(r => {
        const data = r.data.data || []
        setLignes(data)
        setOpenCats(new Set(data.map(l => l.categorie)))
      })
      .catch(err => {
        console.error(err)
        setErreur('Impossible de charger les lignes budgétaires.')
      })
      .finally(() => setLoading(false))
  }, [budgetId])

  if (loading) return (
    <div className="flex items-center gap-2 text-[12px] text-gray-400 py-[10px]">
      <span className="spinner-sm" /> Chargement des lignes…
    </div>
  )
  if (erreur) return (
    <div className="text-[12px] text-danger-600 py-[10px]">{erreur}</div>
  )
  if (!lignes.length) return (
    <div className="text-[12px] text-gray-400 py-[10px]">
      Aucune ligne budgétaire disponible sur ce budget.
    </div>
  )

  /* Grouper par catégorie > sous-catégorie */
  const grouped = {}
  for (const l of lignes) {
    if (!grouped[l.categorie]) grouped[l.categorie] = {}
    if (!grouped[l.categorie][l.sous_categorie]) grouped[l.categorie][l.sous_categorie] = []
    grouped[l.categorie][l.sous_categorie].push(l)
  }

  const selected = lignes.find(l => l.ligne_id === value)

  const toggleCat = (cat) =>
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })

  return (
    <div>
      {/* Liste groupée */}
      <div
        className="rounded-[8px] overflow-hidden max-h-[340px] overflow-y-auto"
        style={{ border: `1px solid ${error ? 'var(--color-danger-400)' : 'var(--color-gray-200)'}` }}
      >
        {Object.entries(grouped).map(([cat, sousCats]) => (
          <div key={cat}>
            {/* Catégorie */}
            <div
              onClick={() => toggleCat(cat)}
              className="flex items-center gap-[6px] px-[12px] py-[7px] bg-gray-50 text-[12px] font-bold text-gray-700 cursor-pointer border-b border-b-gray-200 select-none"
              style={{ borderBottom: '0.5px solid var(--color-gray-200)' }}
            >
              <span className="text-[10px]">{openCats.has(cat) ? '▼' : '▶'}</span>
              {cat}
            </div>

            {openCats.has(cat) && Object.entries(sousCats).map(([sc, scLignes]) => (
              <div key={sc}>
                {/* Sous-catégorie */}
                <div
                  className="px-[12px] pl-[26px] py-[4px] text-[11px] font-semibold text-gray-500 bg-white"
                  style={{ borderBottom: '0.5px solid var(--color-gray-100)' }}
                >
                  {sc}
                </div>

                {/* Lignes */}
                {scLignes.map(l => {
                  const epuisee   = l.montant_disponible <= 0
                  const isSelected = value === l.ligne_id
                  const couleur   = getCouleurExecution(l.taux_consommation)
                  const pct       = Math.min(l.taux_consommation, 100)

                  return (
                    <div
                      key={l.ligne_id}
                      onClick={() => !epuisee && onChange(l.ligne_id, l)}
                      className={`px-[12px] pl-[38px] py-[7px] transition-[background_.12s]${epuisee ? ' cursor-not-allowed' : ' cursor-pointer'}`}
                      style={{
                        borderBottom: '0.5px solid var(--color-gray-50)',
                        background: isSelected ? 'var(--color-primary-50)' : epuisee ? '#fafafa' : '#fff',
                        opacity: epuisee ? 0.55 : 1,
                        borderLeft: isSelected ? '3px solid var(--color-primary-500)' : '3px solid transparent',
                      }}
                    >
                      {/* Nom + disponible */}
                      <div className="flex justify-between items-center mb-[4px]">
                        <span
                          className={`text-[12px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[60%]${isSelected ? ' font-semibold' : ' font-normal'}`}
                          style={{ color: epuisee ? 'var(--color-gray-400)' : 'var(--color-gray-800)' }}
                        >
                          {l.libelle}
                        </span>
                        <span
                          className="text-[11px] font-mono font-bold shrink-0 ml-[8px]"
                          style={{ color: epuisee ? 'var(--color-gray-400)' : 'var(--color-success-700)' }}
                        >
                          {epuisee ? 'Épuisé' : `Dispo : ${formaterMontant(l.montant_disponible)}`}
                        </span>
                      </div>

                      {/* Barre de consommation */}
                      <div className="h-[3px] bg-gray-100 rounded-[3px] overflow-hidden">
                        <div style={{ width: `${pct}%`, height: '100%', background: couleur, borderRadius: 3 }} />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-[2px]">
                        {l.taux_consommation.toFixed(0)} % consommé
                        {l.taux_consommation > 100 && (
                          <span className="text-danger-600 font-bold"> — Dépassement</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-[11px] text-danger-600 mt-[4px]">{error}</p>
      )}

      {/* Récapitulatif ligne sélectionnée */}
      {selected && (
        <div className="mt-[8px] px-[12px] py-[8px] rounded-[7px] bg-primary-50 border border-primary-100 text-[12px]">
          <div className="font-semibold text-primary-800 mb-[2px]">
            {selected.categorie} › {selected.sous_categorie}
          </div>
          <div className="text-primary-700">
            {selected.libelle}&ensp;—&ensp;Disponible :&ensp;
            <strong className="font-mono">
              {formaterMontant(selected.montant_disponible)}
            </strong>
          </div>
        </div>
      )}
    </div>
  )
}
