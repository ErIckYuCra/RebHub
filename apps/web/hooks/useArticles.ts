'use client'
import { useState, useEffect, useCallback } from 'react'
import { articleService } from '@/services/article.service'

export function useArticles() {
  const [articles, setArticles] = useState<Awaited<ReturnType<typeof articleService.getAll>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await articleService.getAll()
      setArticles(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar artículos')
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetch() }, [fetch])

  return { articles, loading, error, refetch: fetch }
}

export function useArticle(id: string) {
  const [article, setArticle] = useState<Awaited<ReturnType<typeof articleService.getById>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    articleService.getById(id)
      .then(data => { setArticle(data); articleService.registerView(id) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar artículo'))
      .finally(() => setLoading(false))
  }, [id])

  return { article, loading, error }
}
