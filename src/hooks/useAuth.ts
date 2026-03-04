import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '../supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email: string) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signOut }
}
