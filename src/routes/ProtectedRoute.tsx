import { Navigate, Outlet } from 'react-router-dom'
import { ACCESS_TOKEN_KEY } from '../api/axiosClient'

function ProtectedRoute() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  return token ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
