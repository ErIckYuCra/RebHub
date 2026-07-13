'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpload } from '@/hooks/useUpload'

export function UploadForm() {
  const [title, setTitle] = useState('')
  const [document, setDocument] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const docRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const { upload, loading, error } = useUpload()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await upload(title, document, image)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Título del artículo *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Escribe un título atractivo..."
          required
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Documento *</label>
        <p className="text-xs text-muted-foreground">PDF, DOCX o TXT — máximo 10MB</p>
        <div
          onClick={() => docRef.current?.click()}
          className="cursor-pointer flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 p-8 transition-colors"
        >
          <FileText className="size-8 text-muted-foreground" />
          {document ? (
            <span className="text-sm font-medium text-primary">{document.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Haz clic para seleccionar</span>
          )}
        </div>
        <input
          ref={docRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={e => setDocument(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Imagen de portada *</label>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP o GIF — máximo 5MB</p>
        <div
          onClick={() => imgRef.current?.click()}
          className="cursor-pointer flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 p-8 transition-colors"
        >
          <Image className="size-8 text-muted-foreground" />
          {image ? (
            <span className="text-sm font-medium text-primary">{image.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Haz clic para seleccionar</span>
          )}
        </div>
        <input
          ref={imgRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => setImage(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} size="lg" className="gap-2">
        <Upload className="size-4" />
        {loading ? 'Publicando...' : 'Publicar artículo'}
      </Button>
    </form>
  )
}
