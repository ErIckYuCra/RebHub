'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { storageService } from '@/services/storage.service'
import { articleService } from '@/services/article.service'
import { createClient } from '@/lib/supabase/client'

export function useUpload() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const upload = useCallback(async (
    title: string,
    document: File | null,
    image: File | null
  ) => {
    setError(null)

    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (!document)      { setError('Selecciona un documento'); return }
    if (!image)         { setError('Selecciona una imagen de portada'); return }

    try {
      storageService.validateDocument(document)
      storageService.validateImage(image)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Archivo inválido')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const [documentPath, imagePath] = await Promise.all([
        storageService.uploadDocument(document, user.id),
        storageService.uploadImage(image, user.id),
      ])

      await articleService.create({ title: title.trim(), document_path: documentPath, image_path: imagePath })
      router.push('/')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al publicar el artículo')
    } finally {
      setLoading(false)
    }
  }, [router])

  return { upload, loading, error }
}
