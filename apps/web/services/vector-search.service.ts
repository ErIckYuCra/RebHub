import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@readhub/ai'
import type { SearchResult, SearchOptions } from '@readhub/types'
import type { Database } from '@readhub/types'

// Use service role for vector search: public read-only operation, avoids cookie dependency
function createSearchClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DEFAULT_TOP_K = 5
const DEFAULT_THRESHOLD = 0.15

export const vectorSearchService = {
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { topK = DEFAULT_TOP_K, threshold = DEFAULT_THRESHOLD } = options

    const queryEmbedding = await generateEmbedding(query)

    const supabase = createSearchClient()
    const { data, error } = await supabase.rpc('match_articles', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: threshold,
      match_count: topK,
    })

    if (error) throw new Error(`Vector search failed: ${error.message}`)
    return (data ?? []) as unknown as SearchResult[]
  },
}
