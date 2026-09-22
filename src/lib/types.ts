export type BackgroundKind = 'transparent' | 'color' | 'gradient' | 'image' | 'blur'

export type Gradient = {
  id: string
  name: string
  /** Colour stops rendered top-left to bottom-right. */
  stops: [string, string] | [string, string, string]
}

export type Adjustments = {
  scale: number // 0.4 – 2
  offsetX: number // -50 – 50, percent of canvas width
  offsetY: number
  brightness: number // 50 – 150 (%)
  contrast: number
  saturation: number
  blur: number // 0 – 12 (px at 1000px wide)
}

export type Shadow = {
  enabled: boolean
  opacity: number // 0 – 100
  blur: number // 0 – 80
  distance: number // 0 – 60
}

export type Background = {
  kind: BackgroundKind
  color: string
  gradientId: string
  /** Object URL for a locally-selected background image. Never uploaded. */
  imageUrl: string | null
  /** Blur strength for the "blur original" option. */
  blurAmount: number
}

export type EditorSettings = {
  background: Background
  adjustments: Adjustments
  shadow: Shadow
}

export type ProcessStage = 'idle' | 'uploading' | 'detecting' | 'removing' | 'preparing' | 'done' | 'error'

export type AppError = {
  code: string
  message: string
}
