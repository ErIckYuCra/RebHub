import { describe, it, expect } from 'vitest'
import { formatDate } from '@/lib/utils/index'
import { cn } from '@/lib/utils'

describe('formatDate', () => {
  it('formatea una fecha ISO a formato largo en español', () => {
    const result = formatDate('2026-07-12T00:00:00.000Z')
    // El resultado debe contener "julio" y "2026"
    expect(result).toContain('2026')
    expect(result.toLowerCase()).toContain('julio')
  })

  it('incluye el día en la salida', () => {
    // Usamos mediodía UTC para evitar desfase de zona horaria (Lima es UTC-5)
    const result = formatDate('2026-01-15T12:00:00.000Z')
    expect(result).toContain('15')
  })

  it('maneja fechas de distintos meses', () => {
    const result = formatDate('2026-12-25T00:00:00.000Z')
    expect(result.toLowerCase()).toContain('diciembre')
  })
})

describe('cn (classnames merge)', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resuelve conflictos de Tailwind (margin)', () => {
    expect(cn('m-2', 'm-4')).toBe('m-4')
  })

  it('resuelve conflictos de padding', () => {
    expect(cn('p-2', 'p-6')).toBe('p-6')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('maneja clases condicionales', () => {
    const active = true
    expect(cn('base', active && 'active')).toBe('base active')
  })

  it('devuelve cadena vacía si no hay clases', () => {
    expect(cn()).toBe('')
  })

  it('acepta arrays de clases', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})
