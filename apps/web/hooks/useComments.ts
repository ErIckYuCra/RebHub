'use client'
import { useState, useEffect, useCallback } from 'react'
import { commentService } from '@/services/comment.service'

type Comment = Awaited<ReturnType<typeof commentService.getByArticle>>[number]

export function useComments(articleId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!articleId) return
    setLoading(true)
    try {
      const data = await commentService.getByArticle(articleId)
      setComments(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar comentarios')
    } finally {
      setLoading(false)
    }
  }, [articleId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchComments() }, [fetchComments])

  const addComment = useCallback(async (text: string) => {
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const newComment = await commentService.create(articleId, text.trim())
      setComments(prev => [...prev, newComment])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al publicar comentario')
    } finally {
      setSubmitting(false)
    }
  }, [articleId])

  return { comments, loading, submitting, error, addComment }
}
