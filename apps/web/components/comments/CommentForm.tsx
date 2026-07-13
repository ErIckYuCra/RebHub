'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  onSubmit: (text: string) => Promise<void>
  submitting: boolean
  error: string | null
}

export function CommentForm({ onSubmit, submitting, error }: Props) {
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await onSubmit(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={submitting || !text.trim()} className="self-end">
        {submitting ? 'Publicando...' : 'Comentar'}
      </Button>
    </form>
  )
}
