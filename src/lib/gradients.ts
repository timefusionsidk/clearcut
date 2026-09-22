import type { Gradient } from './types'

/** Six restrained presets. Muted enough that a cutout stays the subject. */
export const GRADIENTS: Gradient[] = [
  { id: 'dusk', name: 'Dusk', stops: ['#EFEBFE', '#C9BCF7'] },
  { id: 'slate', name: 'Slate', stops: ['#F3F4F6', '#CBD5E1'] },
  { id: 'sand', name: 'Sand', stops: ['#FBF6EE', '#E8D8BE'] },
  { id: 'mint', name: 'Mint', stops: ['#EEF8F3', '#BFE3D2'] },
  { id: 'ember', name: 'Ember', stops: ['#FDF0EA', '#F0C3A8'] },
  { id: 'ink', name: 'Ink', stops: ['#2A2A33', '#0F0F14'] },
]

export const gradientById = (id: string) => GRADIENTS.find((g) => g.id === id) ?? GRADIENTS[0]
