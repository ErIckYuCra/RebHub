export interface ArticleEmbedding {
  id: string
  article_id: string
  content_hash: string
  created_at: string
  updated_at: string
}

export interface EmbeddingInput {
  article_id: string
  title: string
  summary: string | null
  document_path?: string | null
}
