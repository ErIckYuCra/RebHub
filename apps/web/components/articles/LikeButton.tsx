'use client'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLikes } from '@/hooks/useLikes'

export function LikeButton({ articleId }: { articleId: string }) {
  const { count, liked, loading, toggleLike } = useLikes(articleId)

  return (
    <Button
      variant={liked ? 'default' : 'outline'}
      size="sm"
      onClick={toggleLike}
      disabled={loading}
      className="gap-1.5"
    >
      <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} />
      {count} {count === 1 ? 'Me gusta' : 'Me gusta'}
    </Button>
  )
}
