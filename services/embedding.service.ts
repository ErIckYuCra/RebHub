import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embeddings'
import type { EmbeddingInput } from '@/types/embedding'
import crypto from 'crypto'

function buildEmbeddingText(input: EmbeddingInput): string {
  const parts = [`Título: ${input.title}`]
  if (input.summary) parts.push(`Resumen: ${input.summary}`)
  return parts.join('\n')
}

function hashContent(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export const embeddingService = {
  async upsert(input: EmbeddingInput): Promise<void> {
    const text = buildEmbeddingText(input)
    const contentHash = hashContent(text)

    const supabase = await createClient()

    // Skip if content hasn't changed
    const { data: existing } = await supabase
      .from('article_embeddings')
      .select('content_hash')
      .eq('article_id', input.article_id)
      .single()

    if (existing?.content_hash === contentHash) return

    const embedding = await generateEmbedding(text)

    const { error } = await supabase
      .from('article_embeddings')
      .upsert(
        { article_id: input.article_id, embedding: JSON.stringify(embedding), content_hash: contentHash },
        { onConflict: 'article_id' }
      )

    if (error) throw new Error(`Embedding upsert failed: ${error.message}`)
  },

  async remove(articleId: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('article_embeddings')
      .delete()
      .eq('article_id', articleId)
    if (error) throw new Error(`Embedding delete failed: ${error.message}`)
  },
}
