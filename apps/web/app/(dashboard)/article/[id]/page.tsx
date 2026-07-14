'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye, Clock, User, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LikeButton } from '@/components/articles/LikeButton'
import { CommentList } from '@/components/comments/CommentList'
import { useArticle } from '@/hooks/useArticles'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getExt(path: string) {
  return path.split('.').pop()?.toLowerCase() ?? ''
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { article, loading, error } = useArticle(id)
  const [imgError, setImgError] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">Artículo no encontrado.</p>
        <Link href="/home"><Button variant="outline">Volver al inicio</Button></Link>
      </div>
    )
  }

  const imageUrl = article.image_path && !imgError
    ? `${SUPABASE_URL}/storage/v1/object/public/images/${article.image_path}`
    : null
  const documentUrl = article.document_path
    ? `${SUPABASE_URL}/storage/v1/object/public/documents/${article.document_path}`
    : null
  const docExt = article.document_path ? getExt(article.document_path) : ''
  const isPdf = docExt === 'pdf'
  const author = (article.profiles as { email?: string | null } | null)?.email?.split('@')[0] ?? 'Anónimo'
  const likesCount = (article.likes as { count: number }[])?.[0]?.count ?? 0
  const viewsCount = (article.views as { count: number }[])?.[0]?.count ?? 0

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <Link href="/home">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
      </Link>

      {imageUrl && (
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold leading-tight tracking-tight">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-4">
          <span className="flex items-center gap-1.5">
            <User className="size-4" />
            @{author}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatDate(article.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" />
            {viewsCount} vistas
          </span>
          <LikeButton articleId={id} />
        </div>

        {article.summary && (
          <p className="text-base text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4">
            {article.summary}
          </p>
        )}
      </div>

      {documentUrl && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <FileText className="size-4" />
              Documento
            </h2>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Descargar</Button>
            </a>
          </div>
          {isPdf && (
            <iframe
              src={documentUrl}
              className="w-full rounded-xl border border-border"
              style={{ height: '600px' }}
              title={article.title}
            />
          )}
        </div>
      )}

      <hr className="border-border" />

      <CommentList articleId={id} />
    </div>
  )
}
