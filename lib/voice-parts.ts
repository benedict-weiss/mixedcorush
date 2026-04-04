export const VOICE_PARTS = ['Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass'] as const
export type VoicePart = (typeof VOICE_PARTS)[number]
