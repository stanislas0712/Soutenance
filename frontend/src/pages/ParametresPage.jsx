import { useState, useEffect } from 'react'
import { Sun, Moon, Bell, Globe, Monitor, Check } from 'lucide-react'

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

/* ── Toggle switch ───────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#1E3A8A' : '#D1D5DB',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
        minHeight: 44, display: 'inline-flex', alignItems: 'center',
      }}
    >
      <span style={{
        position: 'absolute',
        left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.25)',
        transition: 'left .2s',
      }} />
    </button>
  )
}

/* ── Section card ────────────────────────────────────────────────────────── */
function Section({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div className="card mb-5">
      <h2 className="card-section-title font-bold text-[14px] text-[#1F2937]">
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={14} strokeWidth={2} style={{ color: iconColor }} />
        </div>
        {title}
      </h2>
      <div className="flex flex-col gap-0">{children}</div>
    </div>
  )
}

/* ── Row item ────────────────────────────────────────────────────────────── */
function Row({ label, description, control }) {
  return (
    <div
      className="flex items-center justify-between gap-6 py-[14px]"
      style={{ borderBottom: '1px solid #F3F4F6' }}
    >
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-[#111827]">{label}</div>
        {description && <div className="text-[12px] text-[#6B7280] mt-[2px] leading-snug">{description}</div>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

/* ── Theme selector ─────────────────────────────────────────────────────── */
const THEMES = [
  { value: 'light',  label: 'Clair',    Icon: Sun     },
  { value: 'dark',   label: 'Sombre',   Icon: Moon    },
  { value: 'system', label: 'Système',  Icon: Monitor },
]

function ThemeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {THEMES.map(({ value: v, label, Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
              border: active ? '2px solid #1E3A8A' : '1.5px solid #E5E7EB',
              background: active ? '#EFF6FF' : '#fff',
              color: active ? '#1E3A8A' : '#6B7280',
              fontWeight: active ? 700 : 400, fontSize: '12px',
              transition: 'all .15s', minHeight: 44,
            }}
          >
            <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
            {label}
            {active && <Check size={10} strokeWidth={3} style={{ color: '#1E3A8A' }} />}
          </button>
        )
      })}
    </div>
  )
}

/* ── Language selector ───────────────────────────────────────────────────── */
const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English'  },
]

function LangSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {LANGS.map(({ value: v, label }) => {
        const active = value === v
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              padding: '6px 18px', borderRadius: 8, cursor: 'pointer',
              border: active ? '2px solid #1E3A8A' : '1.5px solid #E5E7EB',
              background: active ? '#EFF6FF' : '#fff',
              color: active ? '#1E3A8A' : '#6B7280',
              fontWeight: active ? 700 : 400, fontSize: '13px',
              transition: 'all .15s', minHeight: 36,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ msg }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#1E3A8A', color: '#fff',
      padding: '10px 18px', borderRadius: 10,
      fontSize: '13px', fontWeight: 600,
      boxShadow: '0 8px 24px rgba(0,0,0,.2)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'fadeIn .2s ease',
    }}>
      <Check size={14} strokeWidth={3} /> {msg}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ParametresPage() {

  /* State */
  const [theme,  setThemeState]  = useState(() => load('pref_theme', 'light'))
  const [lang,   setLangState]   = useState(() => load('pref_lang', 'fr'))

  const [notifBudget,  setNotifBudget]  = useState(() => load('notif_budget', true))
  const [notifDepense, setNotifDepense] = useState(() => load('notif_depense', true))
  const [notifEmail,   setNotifEmail]   = useState(() => load('notif_email', false))
  const [notifSon,     setNotifSon]     = useState(() => load('notif_son', false))

  const [densiteTable, setDensiteTable] = useState(() => load('pref_densite', 'normal'))

  const [toast, setToast] = useState(false)

  /* Apply dark mode to <html> */
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  /* Persist */
  const setTheme = (v)  => { setThemeState(v);  save('pref_theme', v)   }
  const setLang  = (v)  => { setLangState(v);   save('pref_lang', v)    }

  const toggle = (setter, key) => (v) => { setter(v); save(key, v); flash() }
  const flash  = () => { setToast(true); setTimeout(() => setToast(false), 2000) }

  const handleTheme  = (v) => { setTheme(v);  flash() }
  const handleLang   = (v) => { setLang(v);   flash() }
  const handleDensite = (v) => { setDensiteTable(v); save('pref_densite', v); flash() }

  return (
    <div className="max-w-[680px] mx-auto">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Personnalisez votre expérience sur la plateforme</p>
        </div>
      </div>

      {/* ── Apparence ─────────────────────────────────────────────────── */}
      <Section icon={Sun} iconBg="#FEF9EC" iconColor="#C9910A" title="Apparence">
        <Row
          label="Thème de l'interface"
          description="Choisissez entre le mode clair, sombre ou automatique selon votre système."
          control={<ThemeSelector value={theme} onChange={handleTheme} />}
        />
        <Row
          label="Langue"
          description="Langue d'affichage de l'interface."
          control={<LangSelector value={lang} onChange={handleLang} />}
        />
        <div
          style={{ paddingTop: 14 }}
        >
          <div className="text-[13.5px] font-semibold text-[#111827] mb-3">Densité du tableau</div>
          <div className="flex gap-2">
            {[
              { v: 'compact', label: 'Compact' },
              { v: 'normal',  label: 'Normal'  },
              { v: 'relaxed', label: 'Aéré'    },
            ].map(({ v, label }) => {
              const active = densiteTable === v
              return (
                <button
                  key={v}
                  onClick={() => handleDensite(v)}
                  style={{
                    padding: '6px 18px', borderRadius: 8, cursor: 'pointer',
                    border: active ? '2px solid #1E3A8A' : '1.5px solid #E5E7EB',
                    background: active ? '#EFF6FF' : '#fff',
                    color: active ? '#1E3A8A' : '#6B7280',
                    fontWeight: active ? 700 : 400, fontSize: '13px',
                    transition: 'all .15s', minHeight: 36,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-[12px] text-[#6B7280] mt-2">Espacement des lignes dans les tableaux de données.</p>
        </div>
      </Section>

      {/* ── Notifications ─────────────────────────────────────────────── */}
      <Section icon={Bell} iconBg="#EFF6FF" iconColor="#1E3A8A" title="Notifications">
        <Row
          label="Alertes budgets"
          description="Recevoir une notification lors de la création, validation ou rejet d'un budget."
          control={<Toggle checked={notifBudget}  onChange={toggle(setNotifBudget,  'notif_budget')}  id="notif_budget"  />}
        />
        <Row
          label="Alertes dépenses"
          description="Être notifié lors de l'enregistrement ou du rejet d'une dépense."
          control={<Toggle checked={notifDepense} onChange={toggle(setNotifDepense, 'notif_depense')} id="notif_depense" />}
        />
        <Row
          label="Notifications par email"
          description="Recevoir un résumé des activités importantes par email."
          control={<Toggle checked={notifEmail}   onChange={toggle(setNotifEmail,   'notif_email')}   id="notif_email"   />}
        />
        <Row
          label="Son de notification"
          description="Jouer un son lorsqu'une nouvelle notification arrive."
          control={<Toggle checked={notifSon}     onChange={toggle(setNotifSon,     'notif_son')}     id="notif_son"     />}
        />
      </Section>

      {/* ── Informations plateforme ───────────────────────────────────── */}
      <div className="card">
        <h2 className="card-section-title font-bold text-[14px] text-[#1F2937]">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: '#F3F4F6' }}>
            <Globe size={14} strokeWidth={2} style={{ color: '#6B7280' }} />
          </div>
          À propos de la plateforme
        </h2>
        <div className="flex flex-col gap-0">
          {[
            { label: 'Version', value: '2.0.0' },
            { label: 'Environnement', value: 'Production' },
            { label: 'Développé par', value: 'KONATÉ Stanislas' },
            { label: 'Stack',  value: 'Django REST Framework · React 19 · Vite' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-[12px]"
              style={{ borderBottom: '1px solid #F3F4F6' }}
            >
              <span className="text-[13px] text-[#6B7280]">{label}</span>
              <span className="text-[13px] font-semibold text-[#111827] font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast msg="Préférence enregistrée" />}
    </div>
  )
}
