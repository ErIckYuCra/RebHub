'use client'
import { MessageSquare } from 'lucide-react'
import { useComments } from '@/hooks/useComments'
import { CommentForm } from './CommentForm'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function CommentList({ articleId }: { articleId: string }) {
  const { comments, loading, submitting, error, addComment } = useComments(articleId)

  return (
    <section className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="size-5" />
        Comentarios ({comments.length})
      </h3>

      <CommentForm onSubmit={addComment} submitting={submitting} error={error} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map(c => (
            <li key={c.id} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  @{(c.profiles as { email?: string | null } | null)?.email?.split('@')[0] ?? 'Anónimo'}
                </span>
                <span>{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed">{c.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
