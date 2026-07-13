'use client'
import { createClient } from '@/lib/supabase/client'

const ALLOWED_DOCS = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_DOC_SIZE = 10 * 1024 * 1024
const MAX_IMG_SIZE = 5 * 1024 * 1024

export const storageService = {
  validateDocument(file: File) {
    if (!ALLOWED_DOCS.includes(file.type))
      throw new Error('El documento debe ser PDF, DOCX o TXT')
    if (file.size > MAX_DOC_SIZE)
      throw new Error('El documento no puede superar 10MB')
  },

  validateImage(file: File) {
    if (!ALLOWED_IMAGES.includes(file.type))
      throw new Error('La imagen debe ser JPG, PNG, WEBP o GIF')
    if (file.size > MAX_IMG_SIZE)
      throw new Error('La imagen no puede superar 5MB')
  },

  async uploadDocument(file: File, userId: string) {
    this.validateDocument(file)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (error) throw error
    return path
  },

  async uploadImage(file: File, userId: string) {
    this.validateImage(file)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, file)
    if (error) throw error
    return path
  },

  getPublicUrl(bucket: string, path: string) {
    const supabase = createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
}
