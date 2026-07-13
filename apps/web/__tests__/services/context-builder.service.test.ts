import { describe, it, expect } from 'vitest'
import { contextBuilderService } from '@/services/context-builder.service'
import type { SearchResult } from '@readhub/types'

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    article_id: 'c498064d-758c-4510-a05a-b33c43943b0d',
    similarity: 0.8,
    title: 'Artículo de prueba',
    summary: 'Resumen del artículo de prueba',
    chunk_text: 'Contenido completo del artículo de prueba sobre tecnología',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    created_at: '2026-07-12T00:00:00.000Z',
    ...overrides,
  }
}

describe('contextBuilderService.build', () => {
  it('retorna systemPrompt, userPrompt y sources', () => {
    const result = contextBuilderService.build('¿Qué es RAG?', [makeResult()])
    expect(result).toHaveProperty('systemPrompt')
    expect(result).toHaveProperty('userPrompt')
    expect(result).toHaveProperty('sources')
  })

  it('incluye los resultados en sources', () => {
    const docs = [makeResult(), makeResult({ article_id: 'b498064d-758c-4510-a05a-b33c43943b0d', title: 'Otro artículo' })]
    const { sources } = contextBuilderService.build('query', docs)
    expect(sources).toHaveLength(2)
  })

  it('filtra resultados con similitud menor a 0.15', () => {
    const below = makeResult({ similarity: 0.10 })
    const above = makeResult({ similarity: 0.80 })
    const { sources } = contextBuilderService.build('query', [below, above])
    expect(sources).toHaveLength(1)
    expect(sources[0].similarity).toBe(0.80)
  })

  it('incluye el chunk_text en el userPrompt cuando está disponible', () => {
    const doc = makeResult({ chunk_text: 'pgvector es una extensión de PostgreSQL para búsqueda vectorial', summary: null })
    const { userPrompt } = contextBuilderService.build('¿Qué es pgvector?', [doc])
    expect(userPrompt).toContain('pgvector')
  })

  it('usa summary como fallback cuando chunk_text es null', () => {
    const doc = makeResult({ chunk_text: null, summary: 'Resumen de respaldo' })
    const { userPrompt } = contextBuilderService.build('query', [doc])
    expect(userPrompt).toContain('Resumen de respaldo')
  })

  it('incluye la query del usuario en el userPrompt', () => {
    const query = '¿Cuándo se usa pgvector?'
    const { userPrompt } = contextBuilderService.build(query, [makeResult()])
    expect(userPrompt).toContain(query)
  })

  it('retorna sources vacío cuando no hay resultados', () => {
    const { sources } = contextBuilderService.build('query', [])
    expect(sources).toHaveLength(0)
  })

  it('indica en el userPrompt que no hay artículos cuando sources está vacío', () => {
    const { userPrompt } = contextBuilderService.build('query', [])
    expect(userPrompt.toLowerCase()).toContain('no se encontraron')
  })

  it('no toma más de 5 documentos aunque haya más', () => {
    const docs = Array.from({ length: 10 }, (_, i) =>
      makeResult({ article_id: `c498064d-758c-4510-a05a-b33c43943b${String(i).padStart(2, '0')}` })
    )
    const { sources } = contextBuilderService.build('query', docs)
    expect(sources.length).toBeLessThanOrEqual(5)
  })

  it('el systemPrompt contiene instrucciones del asistente', () => {
    const { systemPrompt } = contextBuilderService.build('query', [])
    expect(systemPrompt.toLowerCase()).toContain('readhub')
  })
})
