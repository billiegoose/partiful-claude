import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'

export function AuthPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email)
    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--p-bg)', padding: '0 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 50% at 20% 30%, rgba(155,92,246,0.2) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 70%, rgba(255,60,110,0.15) 0%, transparent 60%)
        `,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 360, position: 'relative', zIndex: 1,
          background: 'var(--p-card)', border: '1px solid var(--p-border)',
          borderRadius: 24, padding: 32,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="font-syne p-gradient-text" style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: 8 }}>
            partiful
          </h1>
          <p style={{ color: 'var(--p-muted)', fontSize: 14 }}>the fun way to throw a party</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', color: 'var(--p-text)',
              background: 'rgba(155,92,246,0.1)',
              border: '1px solid rgba(155,92,246,0.3)',
              borderRadius: 16, padding: 20, fontSize: 15,
            }}
          >
            ✨ Check your email for a magic link
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ color: 'var(--p-muted)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  background: 'var(--p-card2)', border: '1px solid var(--p-border)',
                  borderRadius: 12, padding: '0 16px', height: 48,
                  color: 'var(--p-text)', fontSize: 15, outline: 'none',
                  width: '100%',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="p-gradient-btn"
              style={{
                width: '100%', height: 48, border: 'none', borderRadius: 12,
                fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700,
                color: '#fff', cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
