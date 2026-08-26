import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Shell from '@/components/layout/Shell'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ProfilePage from '@/pages/Profile'
import Friends from '@/pages/Friends'
import Competitions from '@/pages/Competitions'
import MockInterview from '@/pages/MockInterview'
import MockExam from '@/pages/MockExam'
import BlueBook from '@/pages/BlueBook'
import Forum from '@/pages/Forum'
import NotFound from '@/pages/NotFound'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { signedIn } = useApp()
  const loc = useLocation()
  if (!signedIn) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}

export default function App() {
  const { signedIn } = useApp()
  return (
    <Routes>
      <Route path="/login" element={signedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/mock-exam" element={<MockExam />} />
        <Route path="/blue-book" element={<BlueBook />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
