import type { SearchResult } from '@/types/vector-search'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompts'

const MAX_DOCUMENTS = 5
const MAX_CHARS_PER_DOC = 800
const MIN_SIMILARITY = 0.5

export interface BuiltContext {
  systemPrompt: string
  userPrompt: string
  sources: SearchResult[]
}

export const contextBuilderService = {
  build(query: string, results: SearchResult[]): BuiltContext {
    const selected = results
      .filter((r) => r.similarity >= MIN_SIMILARITY)
      .slice(0, MAX_DOCUMENTS)

    const contextBlocks = selected.map((doc, i) => {
      const summary = doc.summary ?? ''
      const excerpt = summary.length > MAX_CHARS_PER_DOC
        ? summary.slice(0, MAX_CHARS_PER_DOC) + '…'
        : summary

      return [
        `[Documento ${i + 1}]`,
        `Título: ${doc.title}`,
        `Relevancia: ${(doc.similarity * 100).toFixed(0)}%`,
        `Contenido: ${excerpt}`,
        `ID: ${doc.article_id}`,
      ].join('\n')
    })

    const context = selected.length > 0
      ? contextBlocks.join('\n\n---\n\n')
      : 'No se encontraron artículos relevantes para esta consulta.'

    return {
      systemPrompt: buildSystemPrompt(),
      userPrompt: buildUserPrompt(query, context),
      sources: selected,
    }
  },
}
