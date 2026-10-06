/**
 * The route table.
 *
 * Everything except `/login` renders inside `Shell`, so the sidebar and header are
 * mounted once and survive navigation. `RequireAuth` gates that whole branch.
 *
 * **The data-heavy routes are lazy.** The Blue Book alone carries 182 companies
 * with their rounds and student feedback, the study trackers carry ~1,100 items,
 * and the solvable problems carry four hand-written starters each — none of
 * which a student opening the dashboard should be made to download. Everything
 * on the critical path to a first paint stays eagerly imported; anything a
 * student reaches by clicking gets its own chunk.
 */
import { Suspense, lazy } from 'react'
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
import Forum from '@/pages/Forum'
import Daily from '@/pages/Daily'
import ComingSoon from '@/pages/ComingSoon'
import ForumThread from '@/pages/ForumThread'
import NotFound from '@/pages/NotFound'

const MockExam = lazy(() => import('@/pages/MockExam'))
const BlueBook = lazy(() => import('@/pages/BlueBook'))
const BlueBookCompany = lazy(() => import('@/pages/BlueBookCompany'))
const StudyTrack = lazy(() => import('@/pages/StudyTrack'))
const Practice = lazy(() => import('@/pages/Practice'))
const PracticeProblem = lazy(() => import('@/pages/PracticeProblem'))
const PracticeSqlProblem = lazy(() => import('@/pages/PracticeSqlProblem'))
const Admin = lazy(() => import('@/pages/Admin'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { signedIn, authLoading } = useApp()
  const loc = useLocation()
  // Restoring a Supabase session is async. Rendering the redirect before it
  // resolves would bounce a signed-in user to /login on every hard refresh.
  if (authLoading) return null
  if (!signedIn) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}

/*
 * Deliberately blank rather than a spinner. These chunks land in well under the
 * ~200ms where a loading indicator starts helping, and a flash of spinner on
 * every navigation reads as slower than nothing at all.
 */
const Loading = <div className="min-h-[40vh]" />

export default function App() {
  return (
    <Suspense fallback={Loading}>
      <Routes>
        <Route path="/login" element={<LoginGate />} />
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
          <Route path="/blue-book/:companyId" element={<BlueBookCompany />} />
          <Route path="/study/:trackId" element={<StudyTrack />} />
          <Route path="/practice" element={<Practice />} />
          {/* The static `sql` segment must be declared before the parameter so
              `/practice/sql/x` cannot be read as a coding problem named "sql". */}
          <Route path="/practice/sql/:problemId" element={<PracticeSqlProblem />} />
          <Route path="/practice/:problemId" element={<PracticeProblem />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:postId" element={<ForumThread />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

/** Split out so the auth state is read inside the router, not above it. */
function LoginGate() {
  const { signedIn, authLoading } = useApp()
  if (authLoading) return null
  return signedIn ? <Navigate to="/" replace /> : <Login />
}
