import { describe, expect, it } from 'vitest'
import { validateMaterialFile } from '@/lib/validateMaterialFile'

describe('validateMaterialFile', () => {
  it('accepts a valid PDF', () => {
    const result = validateMaterialFile('sheet-music.pdf', 'application/pdf', 5 * 1024 * 1024)
    expect(result).toBeNull()
  })

  it('accepts a valid MP3', () => {
    const result = validateMaterialFile('track.mp3', 'audio/mpeg', 10 * 1024 * 1024)
    expect(result).toBeNull()
  })

  it('rejects an unsupported type', () => {
    const result = validateMaterialFile('image.png', 'image/png', 1024)
    expect(result).toMatch(/not supported/)
  })

  it('rejects a PDF that is too large', () => {
    const result = validateMaterialFile('big.pdf', 'application/pdf', 21 * 1024 * 1024)
    expect(result).toMatch(/20MB/)
  })

  it('rejects audio that is too large', () => {
    const result = validateMaterialFile('big.mp3', 'audio/mpeg', 51 * 1024 * 1024)
    expect(result).toMatch(/50MB/)
  })

  it('rejects a mismatched extension', () => {
    const result = validateMaterialFile('trick.txt', 'application/pdf', 1024)
    expect(result).toMatch(/not supported/)
  })
})
