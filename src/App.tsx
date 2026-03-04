import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthPage } from './pages/AuthPage'
import { EventPage } from './pages/EventPage'
import { HomePage } from './pages/HomePage'
import { EventEditPage } from './pages/EventEditPage'
import { RequireAuth } from './components/RequireAuth'
import { BottomNav } from './components/BottomNav'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const location = useLocation()
  const { user } = useAuth()
  const showNav = user && location.pathname !== '/login'

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/e/:token" element={<EventPage />} />
          <Route path="/e/:token/edit" element={<RequireAuth><EventEditPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><div className="text-white p-4 bg-black min-h-screen">Profile coming soon</div></RequireAuth>} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </>
  )
}
