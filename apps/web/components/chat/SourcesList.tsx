'use client'
import Link from 'next/link'
import type { SearchResult } from '@readhub/types'

interface SourcesListProps {
  sources: SearchResult[]
}

export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">Fuentes utilizadas:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((src) => (
          <Link
            key={src.article_id}
            href={`/article/${src.article_id}`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted transition-colors"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="max-w-[200px] truncate">{src.title}</span>
            <span className="text-muted-foreground">{(src.similarity * 100).toFixed(0)}%</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

