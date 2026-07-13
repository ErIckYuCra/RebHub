import { describe, it, expect } from 'vitest'
import { isValidUUID } from '@/lib/validators'

describe('isValidUUID', () => {
  it('acepta un UUID v4 válido', () => {
    expect(isValidUUID('c498064d-758c-4510-a05a-b33c43943b0d')).toBe(true)
  })

  it('acepta UUID v4 en mayúsculas', () => {
    expect(isValidUUID('C498064D-758C-4510-A05A-B33C43943B0D')).toBe(true)
  })

  it('rechaza cadena vacía', () => {
    expect(isValidUUID('')).toBe(false)
  })

  it('rechaza UUID sin guiones', () => {
    expect(isValidUUID('c498064d758c4510a05ab33c43943b0d')).toBe(false)
  })

  it('rechaza UUID con versión incorrecta (no v4)', () => {
    expect(isValidUUID('c498064d-758c-3510-a05a-b33c43943b0d')).toBe(false)
  })

  it('rechaza UUID con variante incorrecta', () => {
    // Variante debe ser 8, 9, a o b en el 17mo carácter
    expect(isValidUUID('c498064d-758c-4510-005a-b33c43943b0d')).toBe(false)
  })

  it('rechaza texto arbitrario', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
  })

  it('rechaza UUID demasiado corto', () => {
    expect(isValidUUID('c498064d-758c-4510-a05a')).toBe(false)
  })

  it('rechaza UUID con caracteres inválidos', () => {
    expect(isValidUUID('g498064d-758c-4510-a05a-b33c43943b0d')).toBe(false)
  })
})
