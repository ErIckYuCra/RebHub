import { createClient } from '@supabase/supabase-js'
import { generateEmbedding, extractTextFromPdf } from '@readhub/ai'
import type { EmbeddingInput } from '@readhub/types'
import type { Database } from '@readhub/types'
import crypto from 'crypto'

function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function buildEmbeddingText(input: EmbeddingInput): Promise<string> {
  const parts = [`Título: ${input.title}`]
  if (input.summary) parts.push(`Resumen: ${input.summary}`)

  if (input.document_path) {
    const supabase = createAdminClient()
    const { data, error: storageError } = await supabase.storage
      .from('documents')
      .download(input.document_path)

    if (storageError) {
      console.error(`[embedding] PDF download failed (${input.document_path}):`, storageError.message)
    } else if (data) {
      try {
        const buffer = Buffer.from(await data.arrayBuffer())
        const extracted = await extractTextFromPdf(buffer)
        if (extracted.trim()) {
          parts.push(`Contenido:\n${extracted.slice(0, 8000)}`)
          console.log(`[embedding] PDF extracted: ${extracted.length} chars from ${input.document_path}`)
        } else {
          console.warn(`[embedding] PDF extracted empty text from ${input.document_path}`)
        }
      } catch (err) {
        console.error(`[embedding] PDF extraction error (${input.document_path}):`, err)
      }
    }
  }

  return parts.join('\n')
}

function hashContent(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export const embeddingService = {
  async upsert(input: EmbeddingInput): Promise<void> {
    const text = await buildEmbeddingText(input)
    const contentHash = hashContent(text)

    const supabase = createAdminClient()

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
        { article_id: input.article_id, embedding: JSON.stringify(embedding), content_hash: contentHash, chunk_text: text },
        { onConflict: 'article_id' }
      )

    if (error) throw new Error(`Embedding upsert failed: ${error.message}`)
  },

  async remove(articleId: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('article_embeddings')
      .delete()
      .eq('article_id', articleId)
    if (error) throw new Error(`Embedding delete failed: ${error.message}`)
  },
}
