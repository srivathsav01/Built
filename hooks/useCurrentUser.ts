'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase/client'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return user
}