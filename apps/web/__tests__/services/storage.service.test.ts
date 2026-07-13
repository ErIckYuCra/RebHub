import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mocked before importing the service to avoid Supabase client initialization
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file' } }),
      }),
    },
  }),
}))

const { storageService } = await import('@/services/storage.service')

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}

describe('storageService.validateDocument', () => {
  it('acepta PDF válido dentro del límite de tamaño', () => {
    const file = makeFile('doc.pdf', 'application/pdf', 1024)
    expect(() => storageService.validateDocument(file)).not.toThrow()
  })

  it('acepta DOCX válido', () => {
    const file = makeFile('doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024)
    expect(() => storageService.validateDocument(file)).not.toThrow()
  })

  it('acepta TXT válido', () => {
    const file = makeFile('doc.txt', 'text/plain', 1024)
    expect(() => storageService.validateDocument(file)).not.toThrow()
  })

  it('rechaza imagen como documento', () => {
    const file = makeFile('foto.jpg', 'image/jpeg', 1024)
    expect(() => storageService.validateDocument(file)).toThrow('PDF, DOCX o TXT')
  })

  it('rechaza documento que supera 10MB', () => {
    const file = makeFile('grande.pdf', 'application/pdf', 11 * 1024 * 1024)
    expect(() => storageService.validateDocument(file)).toThrow('10MB')
  })

  it('acepta documento exactamente en el límite de 10MB', () => {
    const file = makeFile('limite.pdf', 'application/pdf', 10 * 1024 * 1024)
    expect(() => storageService.validateDocument(file)).not.toThrow()
  })

  it('rechaza tipo MIME desconocido', () => {
    const file = makeFile('exec.exe', 'application/x-msdownload', 1024)
    expect(() => storageService.validateDocument(file)).toThrow()
  })
})

describe('storageService.validateImage', () => {
  it('acepta JPEG válido', () => {
    const file = makeFile('foto.jpg', 'image/jpeg', 1024)
    expect(() => storageService.validateImage(file)).not.toThrow()
  })

  it('acepta PNG válido', () => {
    const file = makeFile('foto.png', 'image/png', 1024)
    expect(() => storageService.validateImage(file)).not.toThrow()
  })

  it('acepta WEBP válido', () => {
    const file = makeFile('foto.webp', 'image/webp', 1024)
    expect(() => storageService.validateImage(file)).not.toThrow()
  })

  it('acepta GIF válido', () => {
    const file = makeFile('anim.gif', 'image/gif', 1024)
    expect(() => storageService.validateImage(file)).not.toThrow()
  })

  it('rechaza PDF como imagen', () => {
    const file = makeFile('doc.pdf', 'application/pdf', 1024)
    expect(() => storageService.validateImage(file)).toThrow('JPG, PNG, WEBP o GIF')
  })

  it('rechaza imagen que supera 5MB', () => {
    const file = makeFile('grande.jpg', 'image/jpeg', 6 * 1024 * 1024)
    expect(() => storageService.validateImage(file)).toThrow('5MB')
  })

  it('acepta imagen exactamente en el límite de 5MB', () => {
    const file = makeFile('limite.jpg', 'image/jpeg', 5 * 1024 * 1024)
    expect(() => storageService.validateImage(file)).not.toThrow()
  })
})
