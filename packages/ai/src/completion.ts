import { InferenceClient } from '@huggingface/inference'

// Anthropic fallback (kept for easy revert):
// import Anthropic from '@anthropic-ai/sdk'
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
// export const LLM_MODEL = 'claude-haiku-4-5-20251001'

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY)

export const LLM_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export async function generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  const result = await client.chatCompletion({
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
  })

  return result.choices[0]?.message?.content ?? ''
}
