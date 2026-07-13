import { InferenceClient } from '@huggingface/inference'

// OpenAI fallback (kept for easy revert):
// import OpenAI from 'openai'
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
// export const EMBEDDING_MODEL = 'text-embedding-3-small'
// export const EMBEDDING_DIMENSIONS = 1536

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY)

export const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
export const EMBEDDING_DIMENSIONS = 384

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await client.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text.replace(/\n/g, ' '),
  })
  return result as number[]
}
