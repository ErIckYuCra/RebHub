import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embeddings'
import type { SearchResult, SearchOptions } from '@/types/vector-search'

const DEFAULT_TOP_K = 5
const DEFAULT_THRESHOLD = 0.5

export const vectorSearchService = {
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { topK = DEFAULT_TOP_K, threshold = DEFAULT_THRESHOLD } = options

    const queryEmbedding = await generateEmbedding(query)
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('match_articles', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: threshold,
      match_count: topK,
    })

    if (error) throw new Error(`Vector search failed: ${error.message}`)
    return (data ?? []) as unknown as SearchResult[]
  },
}
