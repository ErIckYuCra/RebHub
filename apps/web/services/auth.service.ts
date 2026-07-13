'use client'
import { createClient } from '@/lib/supabase/client'

export const authService = {
  async signUp(email: string, password: string, phone: string, birthDate: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ phone, birth_date: birthDate })
        .eq('id', data.user.id)
    }
    return data
  },

  async signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user
  },

  async getSession() {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}
