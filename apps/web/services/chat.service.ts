import { generateCompletion } from '@readhub/ai'
import { vectorSearchService } from './vector-search.service'
import { contextBuilderService } from './context-builder.service'
import type { ChatResponse } from '@readhub/types'

// Anthropic fallback (kept for easy revert):
// import Anthropic from '@anthropic-ai/sdk'
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
// const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

export const chatService = {
  async query(userQuery: string): Promise<ChatResponse> {
    const results = await vectorSearchService.search(userQuery, { topK: 5, threshold: 0.15 })
    const { systemPrompt, userPrompt, sources } = contextBuilderService.build(userQuery, results)

    const answer = await generateCompletion(systemPrompt, userPrompt)

    return {
      answer,
      sources,
    }
  },
}
