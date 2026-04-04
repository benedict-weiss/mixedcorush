const ALLOWED_PDF = {
  mimeTypes: ['application/pdf'],
  extensions: ['.pdf'],
  maxBytes: 20 * 1024 * 1024,
  label: '20MB',
  fileType: 'pdf' as const,
}

const ALLOWED_AUDIO = {
  mimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav'],
  extensions: ['.mp3', '.m4a', '.wav'],
  maxBytes: 50 * 1024 * 1024,
  label: '50MB',
  fileType: 'audio' as const,
}

export type FileType = 'pdf' | 'audio'

export function validateMaterialFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number
): string | null {
  const ext = `.${fileName.split('.').pop()?.toLowerCase() ?? ''}`

  if (ALLOWED_PDF.mimeTypes.includes(mimeType) && ALLOWED_PDF.extensions.includes(ext)) {
    if (sizeBytes > ALLOWED_PDF.maxBytes) {
      return `PDF files must be under ${ALLOWED_PDF.label}.`
    }
    return null
  }

  if (ALLOWED_AUDIO.mimeTypes.includes(mimeType) && ALLOWED_AUDIO.extensions.includes(ext)) {
    if (sizeBytes > ALLOWED_AUDIO.maxBytes) {
      return `Audio files must be under ${ALLOWED_AUDIO.label}.`
    }
    return null
  }

  return 'File type not supported. Upload PDF (.pdf) or audio (.mp3, .m4a, .wav).'
}

export function getFileType(mimeType: string): FileType {
  if (ALLOWED_PDF.mimeTypes.includes(mimeType)) {
    return ALLOWED_PDF.fileType
  }
  return ALLOWED_AUDIO.fileType
}
