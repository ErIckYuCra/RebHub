'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLikes(articleId: string) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!articleId) return
    const supabase = createClient()
    supabase.from('likes').select('id, user_id', { count: 'exact' })
      .eq('article_id', articleId)
      .then(({ data, count: total }) => {
        setCount(total ?? 0)
        if (userId && data) setLiked(data.some(l => l.user_id === userId))
        setLoading(false)
      })
  }, [articleId, userId])

  const toggleLike = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().eq('article_id', articleId).eq('user_id', userId)
      setLiked(false)
      setCount(prev => prev - 1)
    } else {
      await supabase.from('likes').insert({ article_id: articleId, user_id: userId })
      setLiked(true)
      setCount(prev => prev + 1)
    }
  }, [articleId, liked, userId])

  return { count, liked, loading, toggleLike }
}
