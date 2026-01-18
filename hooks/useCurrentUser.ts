'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase/client';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
    const supabase = createSupabaseClient()
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  return user
}