export interface SearchResult {
  article_id: string
  similarity: number
  title: string
  summary: string | null
  chunk_text: string | null
  author_id: string
  created_at: string
}

export interface SearchOptions {
  topK?: number
  threshold?: number
}
