import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/e/:token" element={<div>Event</div>} />
      <Route path="/e/:token/edit" element={<div>Edit Event</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
    </Routes>
  )
}
