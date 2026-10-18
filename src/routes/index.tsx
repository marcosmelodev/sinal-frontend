import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import CadastroPage from '../pages/CadastroPage'
import HomePage from '../pages/HomePage'
import EmergenciaPage from '../pages/EmergenciaPage'
import HistoricoChamadosPage from '../pages/HistoricoChamadosPage'
import ContatosPage from '../pages/ContatosPage'
import PerfilPage from '../pages/PerfilPage'
import OcorrenciasPage from '../pages/OcorrenciasPage'
import ResumoChamadoPage from '../pages/ResumoChamadoPage'
import SolicitacaoRegistadaPage from '../pages/SolicitacaoRegistadaPage'
import AcompanhamentoChamadoPage from '../pages/AcompanhamentoChamadoPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/emergencia" element={<EmergenciaPage />} />
        <Route path="/ocorrencias/:orgaoId" element={<OcorrenciasPage />} />
        <Route path="/resumo" element={<ResumoChamadoPage />} />
        <Route path="/chamado/:id/registrado" element={<SolicitacaoRegistadaPage />} />
        <Route path="/chamado/:id/acompanhamento" element={<AcompanhamentoChamadoPage />} />
        <Route path="/historico" element={<HistoricoChamadosPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/contatos" element={<ContatosPage />} />
      </Route>
    </Routes>
  )
}
