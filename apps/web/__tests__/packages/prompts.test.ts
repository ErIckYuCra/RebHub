import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserPrompt } from '@readhub/ai'

describe('buildSystemPrompt', () => {
  it('retorna una cadena no vacía', () => {
    const result = buildSystemPrompt()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('contiene instrucciones de contexto', () => {
    const result = buildSystemPrompt()
    expect(result.toLowerCase()).toContain('contexto')
  })

  it('menciona ReadHub', () => {
    const result = buildSystemPrompt()
    expect(result).toContain('ReadHub')
  })

  it('es determinístico (mismo resultado en cada llamada)', () => {
    expect(buildSystemPrompt()).toBe(buildSystemPrompt())
  })
})

describe('buildUserPrompt', () => {
  it('incluye la query del usuario', () => {
    const query = '¿Qué es pgvector?'
    const result = buildUserPrompt(query, 'contexto de prueba')
    expect(result).toContain(query)
  })

  it('incluye el contexto provisto', () => {
    const context = 'pgvector es una extensión de PostgreSQL'
    const result = buildUserPrompt('pregunta', context)
    expect(result).toContain(context)
  })

  it('estructura correctamente el prompt con saltos de línea', () => {
    const result = buildUserPrompt('mi pregunta', 'mi contexto')
    expect(result).toContain('\n')
    expect(result.indexOf('mi contexto')).toBeLessThan(result.indexOf('mi pregunta'))
  })

  it('maneja query vacía sin lanzar excepción', () => {
    expect(() => buildUserPrompt('', 'contexto')).not.toThrow()
  })

  it('maneja contexto vacío sin lanzar excepción', () => {
    expect(() => buildUserPrompt('query', '')).not.toThrow()
  })

  it('maneja ambos parámetros vacíos', () => {
    const result = buildUserPrompt('', '')
    expect(typeof result).toBe('string')
  })
})
