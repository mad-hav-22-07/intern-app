/**
 * The route table.
 *
 * Everything except `/login` renders inside `Shell`, so the sidebar and header are
 * mounted once and survive navigation. `RequireAuth` gates that whole branch.
 */
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Shell from '@/components/layout/Shell'
import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import Dashboard from '@/pages/Dashboard'
import ProfilePage from '@/pages/Profile'
import Friends from '@/pages/Friends'
import Competitions from '@/pages/Competitions'
import MockInterview from '@/pages/MockInterview'
import MockExam from '@/pages/MockExam'
import BlueBook from '@/pages/BlueBook'
import Forum from '@/pages/Forum'
import Daily from '@/pages/Daily'
import ComingSoon from '@/pages/ComingSoon'
import ForumThread from '@/pages/ForumThread'
import NotFound from '@/pages/NotFound'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { signedIn, authLoading } = useApp()
  const loc = useLocation()
  // Restoring a Supabase session is async. Rendering the redirect before it
  // resolves would bounce a signed-in user to /login on every hard refresh.
  if (authLoading) return null
  if (!signedIn) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}

export default function App() {
  const { signedIn, authLoading } = useApp()
  return (
    <Routes>
      <Route
        path="/login"
        element={authLoading ? null : signedIn ? <Navigate to="/" replace /> : <Login />}
      />
      {/* Outside RequireAuth: the recovery session exists but the user is mid-reset. */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/mock-exam" element={<MockExam />} />
        <Route path="/blue-book" element={<BlueBook />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:postId" element={<ForumThread />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
