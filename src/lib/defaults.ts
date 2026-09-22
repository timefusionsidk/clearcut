import type { EditorSettings } from './types'

export const DEFAULT_SETTINGS: EditorSettings = {
  background: {
    kind: 'transparent',
    color: '#FFFFFF',
    gradientId: 'dusk',
    imageUrl: null,
    blurAmount: 18,
  },
  adjustments: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  },
  shadow: {
    enabled: false,
    opacity: 30,
    blur: 28,
    distance: 14,
  },
}

export const MAX_BYTES = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
