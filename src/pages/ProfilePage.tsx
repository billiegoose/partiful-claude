import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getProfile, updateProfile } from '../sdk/profiles'
import { uploadAvatar } from '../lib/uploadImage'
import type { Profile } from '../sdk/types'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(p => {
      if (p) { setProfile(p); setUsername(p.username ?? '') }
    })
  }, [user?.id])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, { username })
      setProfile(updated)
    } catch {
      alert('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10 MB.'); return }
    setUploading(true)
    try {
      const url = await uploadAvatar(file, user.id)
      const updated = await updateProfile(user.id, { avatar_url: url })
      setProfile(updated)
      e.target.value = ''
    } catch {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const letter = (username || user?.email || '?')[0].toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', background: 'var(--p-bg)', color: 'var(--p-text)', paddingBottom: 96 }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="font-syne p-gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Profile
        </h1>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile photo"
            style={{
              position: 'relative', width: 96, height: 96,
              borderRadius: '50%', overflow: 'hidden',
              background: 'var(--p-card2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 0 0 3px var(--p-bg), 0 0 0 5px rgba(155,92,246,0.4)',
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="font-syne" style={{ fontSize: 36, fontWeight: 800, color: 'var(--p-text)' }}>{letter}</span>
            )}
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--p-text)', fontSize: 12,
              }}>
                ...
              </div>
            )}
          </button>
          <span style={{ color: 'var(--p-muted)', fontSize: 13 }}>Tap to change photo</span>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* Fields */}
        <div className="p-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: 'var(--p-muted)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
              Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your name"
              style={{
                background: 'var(--p-card2)', border: '1px solid var(--p-border)',
                borderRadius: 12, padding: '0 16px', height: 48,
                color: 'var(--p-text)', fontSize: 15, outline: 'none', width: '100%',
              }}
            />
          </div>

          <p style={{ color: 'var(--p-muted)', fontSize: 13 }}>{user?.email}</p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="p-gradient-btn"
            style={{
              width: '100%', height: 48, border: 'none', borderRadius: 12,
              fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700,
              color: '#fff', cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <button
          onClick={() => signOut()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--p-muted)', fontSize: 14, minHeight: 44,
          }}
        >
          Sign out
        </button>
      </div>
    </motion.div>
  )
}
