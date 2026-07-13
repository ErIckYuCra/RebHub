'use client'
import { BookOpen, Loader2 } from 'lucide-react'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { useArticles } from '@/hooks/useArticles'

export default function HomePage() {
  const { articles, loading, error } = useArticles()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Artículos recientes</h1>
        <p className="text-sm text-muted-foreground">Descubre lo que la comunidad está leyendo</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <BookOpen className="size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No hay artículos publicados todavía.</p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                id: article.id,
                title: article.title,
                summary: article.summary,
                image_path: article.image_path,
                created_at: article.created_at,
                profiles: article.profiles as { email: string | null; role: string | null } | null,
                likes: article.likes as { count: number }[],
                views: article.views as { count: number }[],
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
