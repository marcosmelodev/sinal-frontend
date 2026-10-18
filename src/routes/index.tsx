import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import CadastroPage from '../pages/CadastroPage'
import HomePage from '../pages/HomePage'
import EmergenciaPage from '../pages/EmergenciaPage'
import HistoricoChamadosPage from '../pages/HistoricoChamadosPage'
import ContatosPage from '../pages/ContatosPage'
import OcorrenciasPage from '../pages/OcorrenciasPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/emergencia" element={<EmergenciaPage />} />
        <Route path="/ocorrencias/:orgaoId" element={<OcorrenciasPage />} />
        <Route path="/historico" element={<HistoricoChamadosPage />} />
        <Route path="/contatos" element={<ContatosPage />} />
      </Route>
    </Routes>
  )
}
