import type { SearchResult } from './vector-search'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SearchResult[]
  createdAt: Date
}

export interface ChatRequest {
  query: string
}

export interface ChatResponse {
  answer: string
  sources: SearchResult[]
  tokensUsed?: number
}
