import type { SearchResult } from '@readhub/types'
import { buildSystemPrompt, buildUserPrompt } from '@readhub/ai'

const MAX_DOCUMENTS = 5
const MAX_CHARS_PER_DOC = 2000
const MIN_SIMILARITY = 0.15

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
      const content = doc.chunk_text ?? doc.summary ?? ''
      const excerpt = content.length > MAX_CHARS_PER_DOC
        ? content.slice(0, MAX_CHARS_PER_DOC) + '…'
        : content

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


