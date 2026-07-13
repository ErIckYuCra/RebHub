'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, Clock } from 'lucide-react'

type Props = {
  article: {
    id: string
    title: string
    summary: string | null
    image_path: string | null
    created_at: string
    profiles: { email: string | null; role: string | null } | null
    likes: { count: number }[]
    views: { count: number }[]
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ArticleCard({ article }: Props) {
  const [imgError, setImgError] = useState(false)

  const imageUrl = article.image_path && !imgError
    ? `${SUPABASE_URL}/storage/v1/object/public/images/${article.image_path}`
    : null
  const author = article.profiles?.email?.split('@')[0] ?? 'Anónimo'
  const likesCount = article.likes?.[0]?.count ?? 0
  const viewsCount = article.views?.[0]?.count ?? 0

  return (
    <Link href={`/article/${article.id}`} className="group block">
      <article className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
        {imageUrl ? (
          <div className="relative h-44 overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-4xl text-primary/20 font-bold select-none">
              {article.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 p-4 flex-1">
          <h2 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h2>

          {article.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
            <span className="font-medium text-foreground/70">@{author}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(article.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {viewsCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="size-3" />
                {likesCount}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
