import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

// Espace Public F01-F08
import F01_Accueil from './pages/F01_Accueil'
import F02_Catalogue from './pages/F02_Catalogue'
import F03_FicheFormation from './pages/F03_FicheFormation'
import F04_APropos from './pages/F04_APropos'
import F05_Temoignages from './pages/F05_Temoignages'
import F06_Blog from './pages/F06_Blog'
import F07_Contact from './pages/F07_Contact'
import F08_Login from './pages/F08_Login'

// Espace Apprenant F09-F13
import F09_Dashboard from './pages/F09_Dashboard'
import F10_MesFormations from './pages/F10_MesFormations'
import F11_SalleVirtuelle from './pages/F11_SalleVirtuelle'
import F12_MonProfil from './pages/F12_MonProfil'
import F13_Paiements from './pages/F13_Paiements'

// Back-office F14-F15
import F14_AdminDashboard from './pages/F14_AdminDashboard'
import F15_AdminFormations from './pages/F15_AdminFormations'

// Autres
import F16_AuthCallback from './pages/F16_AuthCallback'
import F17_Confirmation from './pages/F17_Confirmation'
import F18_Inscription from './pages/F18_Inscription'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* 1. Routes Publiques F01-F08 */}
        <Route path="/" element={<F01_Accueil />} />
        <Route path="/formations" element={<F02_Catalogue />} />
        <Route path="/formation/:id" element={<F03_FicheFormation />} />
        <Route path="/a-propos" element={<F04_APropos />} />
        <Route path="/temoignages" element={<F05_Temoignages />} />
        <Route path="/blog" element={<F06_Blog />} />
        <Route path="/contact" element={<F07_Contact />} />
        <Route path="/connexion" element={<F08_Login />} />
        <Route path="/login" element={<Navigate to="/connexion" replace />} />

        {/* 2. Routes Apprenant F09-F13 - Protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute><F09_Dashboard /></ProtectedRoute>
        } />
        <Route path="/mes-formations" element={
          <ProtectedRoute><F10_MesFormations /></ProtectedRoute>
        } />
        <Route path="/profil" element={
          <ProtectedRoute><F12_MonProfil /></ProtectedRoute>
        } />
        <Route path="/paiements" element={
          <ProtectedRoute><F13_Paiements /></ProtectedRoute>
        } />

        {/* Salle virtuelle : protégée par décharge, pas par login */}
        <Route path="/salle-virtuelle/:numeroDecharge" element={<F11_SalleVirtuelle />} />

        {/* 3. Routes Admin F14-F15 - Protégées Admin */}
        <Route path="/f14-admin" element={
          <F14_AdminDashboard />
        } />
        <Route path="/admin/formations" element={
          <ProtectedRoute requireAdmin={true}><F15_AdminFormations /></ProtectedRoute>
        } />

        {/* 4. Routes Processus Inscription */}
        <Route path="/formation/:id/inscription" element={<F18_Inscription />} />
        <Route path="/confirmation/:id" element={<F17_Confirmation />} />

        {/* 5. Auth Callback OAuth */}
        <Route path="/auth/callback" element={<F16_AuthCallback />} />

        {/* 6. 404 - TOUJOURS en dernier */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App