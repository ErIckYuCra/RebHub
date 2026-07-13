'use client'
import { createClient } from '@/lib/supabase/client'

export const commentService = {
  async getByArticle(articleId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .select(`*, profiles:user_id ( id, email, role )`)
      .eq('article_id', articleId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async create(articleId: string, comment: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('comments')
      .insert({ article_id: articleId, user_id: user.id, comment })
      .select(`*, profiles:user_id ( id, email, role )`)
      .single()
    if (error) throw error
    return data
  },

  async delete(commentId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) throw error
  },
}
