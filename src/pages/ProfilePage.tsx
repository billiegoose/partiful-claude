import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getProfile, updateProfile } from '../sdk/profiles'
import { uploadAvatar } from '../lib/uploadImage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      if (p) {
        setProfile(p)
        setUsername(p.username ?? '')
      }
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
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10 MB.')
      return
    }
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
      className="min-h-screen bg-black text-white pb-24"
    >
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center min-h-[44px]"
            aria-label="Change profile photo"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{letter}</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                ...
              </div>
            )}
          </button>
          <span className="text-zinc-500 text-sm">Tap to change photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label className="text-zinc-300">Username</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
            placeholder="your name"
          />
        </div>

        <p className="text-zinc-500 text-sm">{user?.email}</p>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 text-base font-semibold"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>

        <button
          onClick={() => signOut()}
          className="w-full text-zinc-500 text-sm min-h-[44px]"
        >
          Sign out
        </button>
      </div>
    </motion.div>
  )
}
