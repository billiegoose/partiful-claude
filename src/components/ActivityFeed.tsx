import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listPosts, createPost } from '../sdk/posts'
import { subscribeToPosts, subscribeToBoops } from '../sdk/realtime'
import type { EventPost, Boop } from '../sdk/types'

interface Props { eventId: string; userId: string | undefined }
interface FloatingBoop extends Boop { _key: string }

const DOT_COLORS = [
  { bg: 'var(--p-purple)', shadow: 'rgba(155,92,246,0.6)' },
  { bg: 'var(--p-accent)', shadow: 'rgba(255,60,110,0.6)' },
  { bg: 'var(--p-accent2)', shadow: 'rgba(255,140,66,0.6)' },
]

export function ActivityFeed({ eventId, userId }: Props) {
  const [posts, setPosts] = useState<EventPost[]>([])
  const [floatingBoops, setFloatingBoops] = useState<FloatingBoop[]>([])
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    listPosts(eventId).then(setPosts)
    const postChannel = subscribeToPosts(eventId, p => setPosts(prev => [...prev, p]))
    const boopChannel = subscribeToBoops(eventId, b => {
      const key = `${b.id}-${Date.now()}`
      setFloatingBoops(prev => [...prev, { ...b, _key: key }])
      setTimeout(() => setFloatingBoops(prev => prev.filter(x => x._key !== key)), 3000)
    })
    return () => { postChannel.unsubscribe(); boopChannel.unsubscribe() }
  }, [eventId])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newPost.trim() || posting) return
    setPosting(true)
    try {
      await createPost({ event_id: eventId, author_id: userId, body: newPost.trim() })
      setNewPost('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Floating boops */}
      <AnimatePresence>
        {floatingBoops.map(b => (
          <motion.div
            key={b._key}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.5 }}
            style={{ position: 'fixed', bottom: 128, right: 24, fontSize: 48, pointerEvents: 'none', zIndex: 50 }}
          >
            {b.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <p className="font-syne" style={{
        fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 12,
      }}>
        Activity
      </p>

      <div className="p-card" style={{ padding: 18, marginBottom: 10 }}>
        {posts.length === 0 && (
          <p style={{ color: 'var(--p-muted)', fontSize: 13 }}>No posts yet. Be the first!</p>
        )}
        <AnimatePresence initial={false}>
          {posts.map((post, i) => {
            const dot = DOT_COLORS[i % DOT_COLORS.length]
            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', gap: 12, padding: '10px 0',
                  borderBottom: i < posts.length - 1 ? '1px solid var(--p-border)' : 'none',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: dot.bg, marginTop: 6, flexShrink: 0,
                  boxShadow: `0 0 8px ${dot.shadow}`,
                }} />
                <div>
                  <div style={{ fontSize: 13.5, color: '#ccc8e8', lineHeight: 1.5 }}>{post.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--p-muted)', marginTop: 2 }}>
                    {new Date(post.created_at ?? '').toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Post input */}
      {userId && (
        <form onSubmit={handlePost} style={{ display: 'flex', gap: 8 }}>
          <input
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Add to the feed..."
            style={{
              flex: 1, background: 'var(--p-card)',
              border: '1px solid var(--p-border)', borderRadius: 100,
              padding: '0 16px', color: 'var(--p-text)', fontSize: 14,
              minHeight: 44, outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={posting || !newPost.trim()}
            className="p-gradient-btn"
            style={{
              borderRadius: 100, padding: '0 20px',
              fontWeight: 600, fontSize: 14, minHeight: 44,
              border: 'none', color: '#fff', cursor: 'pointer',
              opacity: posting || !newPost.trim() ? 0.5 : 1,
            }}
          >
            Post
          </button>
        </form>
      )}
    </div>
  )
}
