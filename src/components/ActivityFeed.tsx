import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listPosts, createPost } from '../sdk/posts'
import { subscribeToPosts, subscribeToBoops } from '../sdk/realtime'
import type { EventPost, Boop } from '../sdk/types'

interface Props {
  eventId: string
  userId: string | undefined
}

interface FloatingBoop extends Boop {
  _key: string
}

export function ActivityFeed({ eventId, userId }: Props) {
  const [posts, setPosts] = useState<EventPost[]>([])
  const [floatingBoops, setFloatingBoops] = useState<FloatingBoop[]>([])
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    listPosts(eventId).then(setPosts)

    const postChannel = subscribeToPosts(eventId, p => {
      setPosts(prev => [...prev, p])
    })
    const boopChannel = subscribeToBoops(eventId, b => {
      const key = `${b.id}-${Date.now()}`
      const fb: FloatingBoop = { ...b, _key: key }
      setFloatingBoops(prev => [...prev, fb])
      setTimeout(() => {
        setFloatingBoops(prev => prev.filter(x => x._key !== key))
      }, 3000)
    })

    return () => {
      postChannel.unsubscribe()
      boopChannel.unsubscribe()
    }
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
    <div className="space-y-4">
      {/* Floating boops */}
      <AnimatePresence>
        {floatingBoops.map(b => (
          <motion.div
            key={b._key}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.5 }}
            className="fixed bottom-32 right-6 text-5xl pointer-events-none z-50"
          >
            {b.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Activity feed header */}
      <h2 className="text-lg font-semibold text-white">Activity</h2>

      {/* Posts list */}
      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-zinc-500 text-sm">No posts yet. Be the first!</p>
        )}
        <AnimatePresence initial={false}>
          {posts.map(post => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-xl p-4 text-white text-sm"
            >
              <p>{post.body}</p>
              <p className="text-zinc-500 text-xs mt-2">
                {new Date(post.created_at ?? '').toLocaleTimeString(undefined, {
                  hour: 'numeric', minute: '2-digit'
                })}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Post input */}
      {userId && (
        <form onSubmit={handlePost} className="flex gap-2">
          <input
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Add to the feed..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-white text-sm min-h-[44px] outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={posting || !newPost.trim()}
            className="bg-white text-black rounded-full px-5 font-semibold text-sm min-h-[44px] disabled:opacity-50"
          >
            Post
          </button>
        </form>
      )}
    </div>
  )
}
