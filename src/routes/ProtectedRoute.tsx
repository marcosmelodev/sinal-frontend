import { Navigate, Outlet } from 'react-router-dom'
import { ACCESS_TOKEN_KEY } from '../api/axiosClient'
import BottomNav from '../components/layout/BottomNav'

function ProtectedRoute() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (!token) return <Navigate to="/login" replace />

  return (
    <>
      <div className="min-h-screen pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </>
  )
}

export default ProtectedRoute
