import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

/* Pages publiques */
import LoginPage         from './pages/LoginPage'
import LandingPage       from './pages/landing/LandingPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

/* Admin */
import AdminDashboard   from './pages/admin/AdminDashboard'
import BudgetAnnuelPage from './pages/admin/BudgetAnnuelPage'
import BudgetsPage      from './pages/admin/BudgetsPage'
import UtilisateursPage  from './pages/admin/UtilisateursPage'
import DepartementsPage  from './pages/admin/DepartementsPage'
import AuditLogsPage     from './pages/admin/AuditLogsPage'

/* Gestionnaire */
import GestionnaireDashboard from './pages/gestionnaire/GestionnaireDashboard'
import MesBudgets            from './pages/gestionnaire/MesBudgets'
import CreerBudget           from './pages/gestionnaire/CreerBudget'
import BudgetDetail          from './pages/gestionnaire/BudgetDetail'
import MesDepenses           from './pages/gestionnaire/MesDepenses'

/* Comptable */
import ComptableDashboard                              from './pages/comptable/ComptableDashboard'
import { BudgetsAValiderList, BudgetValidationDetail } from './pages/comptable/BudgetsAValider'
import ProfilPage from './pages/ProfilPage'

/* IA */
import IADashboard    from './pages/ia/IADashboard'
import RapportIADetail from './pages/ia/RapportIADetail'

/* Rapports */
import RapportsKPIPage from './pages/admin/RapportsKPIPage'
import RapportPage     from './pages/admin/RapportPage'

/* Dépenses (comptable) */
import DepensesPage from './pages/comptable/DepensesPage'

/* ── Guards ──────────────────────────────────────────────────────────────── */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <span style={{ color: 'var(--color-gray-500)', fontSize: '.85rem' }}>Chargement…</span>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

/* ── Routes authentifiées ────────────────────────────────────────────────── */
function AppRoutes() {
  const { user, isAdmin, isGestionnaire, isComptable } = useAuth()
  if (!user) return null

  const DashboardPage = isAdmin
    ? AdminDashboard
    : isGestionnaire
      ? GestionnaireDashboard
      : ComptableDashboard

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ── Admin ── */}
        {isAdmin && <>
          <Route path="/budget-annuel" element={<BudgetAnnuelPage />} />
          <Route path="/departements"  element={<DepartementsPage />} />
          <Route path="/budgets"       element={<BudgetsPage />} />
          <Route path="/budgets/:id"   element={<BudgetDetail basePath="/budgets" />} />
          <Route path="/utilisateurs"  element={<UtilisateursPage />} />
          <Route path="/audit"         element={<AuditLogsPage />} />
          <Route path="/rapports"           element={<RapportsKPIPage />} />
          <Route path="/rapports-detailles" element={<RapportPage />} />
        </>}

        {/* ── Gestionnaire ── */}
        {isGestionnaire && <>
          <Route path="/mes-budgets"      element={<MesBudgets />} />
          <Route path="/mes-budgets/:id"  element={<BudgetDetail basePath="/mes-budgets" />} />
          <Route path="/creer-budget"     element={<CreerBudget />} />
          <Route path="/mes-depenses"     element={<MesDepenses />} />
        </>}

        {/* ── Comptable ── */}
        {isComptable && <>
          <Route path="/validation"      element={<BudgetsAValiderList />} />
          <Route path="/validation/:id"  element={<BudgetValidationDetail />} />
          <Route path="/depenses"        element={<DepensesPage />} />
          <Route path="/rapports"        element={<RapportsKPIPage />} />
        </>}

        {/* IA — tous les rôles */}
        <Route path="/ia"                element={<IADashboard />} />
        <Route path="/ia-rapport/:id"    element={<RapportIADetail />} />
        <Route path="/ia/rapports/:id"   element={<RapportIADetail />} />

        {/* Profil — tous les rôles */}
        <Route path="/profil" element={<ProfilPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

/* ── Root ────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<LandingPage />} />
          <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/*"              element={<PrivateRoute><AppRoutes /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
