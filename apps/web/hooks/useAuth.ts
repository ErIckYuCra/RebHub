'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { authService } from '@/services/auth.service'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/user'

function extractMessage(e: unknown): string {
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const err = e as Record<string, unknown>
    if (typeof err.message === 'string' && err.message) return err.message
    if (typeof err.msg === 'string' && err.msg) return err.msg
  }
  return 'Error inesperado'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function fetchProfile(userId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchProfile(data.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string, phone: string, birthDate: string) => {
    setError(null)
    setLoading(true)
    try {
      await authService.signUp(email, password, phone, birthDate)
      router.push('/home')
    } catch (e) {
      setError(extractMessage(e))
    } finally {
      setLoading(false)
    }
  }, [router])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      await authService.signIn(email, password)
      router.push('/home')
      router.refresh()
    } catch (e) {
      setError(extractMessage(e))
    } finally {
      setLoading(false)
    }
  }, [router])

  const signOut = useCallback(async () => {
    await authService.signOut()
    router.push('/login')
    router.refresh()
  }, [router])

  return { user, profile, loading, error, signIn, signUp, signOut }
}
