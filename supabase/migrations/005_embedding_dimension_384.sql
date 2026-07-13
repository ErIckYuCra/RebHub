-- Migrate embedding dimension from 1536 (OpenAI) to 384 (HuggingFace all-MiniLM-L6-v2)
DROP INDEX IF EXISTS idx_article_embeddings_hnsw;

ALTER TABLE article_embeddings
  ALTER COLUMN embedding TYPE vector(384);

CREATE INDEX idx_article_embeddings_hnsw
  ON article_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
