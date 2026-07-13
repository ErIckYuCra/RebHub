import Anthropic from '@anthropic-ai/sdk'
import { vectorSearchService } from './vector-search.service'
import { contextBuilderService } from './context-builder.service'
import type { ChatResponse } from '@/types/chat'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

export const chatService = {
  async query(userQuery: string): Promise<ChatResponse> {
    const results = await vectorSearchService.search(userQuery, { topK: 5, threshold: 0.45 })
    const { systemPrompt, userPrompt, sources } = contextBuilderService.build(userQuery, results)

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const answer = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    return {
      answer,
      sources,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    }
  },
}
