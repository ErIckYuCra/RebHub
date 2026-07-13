'use client'
import { createClient } from '@/lib/supabase/client'

export const articleService = {
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id ( id, email, role ),
        likes ( count ),
        views ( count )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id ( id, email, role ),
        likes ( count ),
        views ( count )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload: {
    title: string
    summary?: string
    document_path?: string
    image_path?: string
  }) {
    const res = await fetch('/api/v1/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? 'Error al crear artículo')
    return json.data
  },

  async registerView(articleId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('views').insert({ article_id: articleId, user_id: user.id })
  },

  async getStorageUrl(bucket: string, path: string) {
    const supabase = createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
}
