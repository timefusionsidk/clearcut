import { gradientById } from './gradients'
import type { EditorSettings } from './types'

/** Longest edge used for the "standard" download and the live preview. */
export const STANDARD_MAX = 1400
/** Longest edge used for the on-screen preview canvas. */
export const PREVIEW_MAX = 1100

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that image.'))
    img.src = src
  })
}

type ComposeInput = {
  /** Transparent PNG created by the local browser model. */
  cutout: HTMLImageElement
  /** The user's original upload, needed for the "blur original" background. */
  original: HTMLImageElement | null
  /** A locally-chosen background image, if any. */
  backgroundImage: HTMLImageElement | null
  settings: EditorSettings
  /** Longest edge of the output. Omit for the cutout's native resolution. */
  maxDimension?: number
  /** Flatten transparency onto white — used for JPG export. */
  flatten?: boolean
}

/**
 * Renders the final image. The same function drives both the live preview and
 * every download, so what a user sees is exactly what they get — only the
 * output resolution differs.
 */
export function compose({
  cutout,
  original,
  backgroundImage,
  settings,
  maxDimension,
  flatten = false,
}: ComposeInput): HTMLCanvasElement {
  const nw = cutout.naturalWidth || cutout.width
  const nh = cutout.naturalHeight || cutout.height
  const longest = Math.max(nw, nh)
  const ratio = maxDimension && longest > maxDimension ? maxDimension / longest : 1

  const W = Math.max(1, Math.round(nw * ratio))
  const H = Math.max(1, Math.round(nh * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  /** Scale factor so blur/shadow sizes read the same at any resolution. */
  const s = Math.max(W, H) / 1000
  const { background, adjustments, shadow } = settings

  /* ---------------- background ---------------- */
  if (background.kind === 'color') {
    ctx.fillStyle = background.color
    ctx.fillRect(0, 0, W, H)
  } else if (background.kind === 'gradient') {
    const g = gradientById(background.gradientId)
    const grad = ctx.createLinearGradient(0, 0, W, H)
    g.stops.forEach((stop, i) => grad.addColorStop(i / (g.stops.length - 1), stop))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  } else if (background.kind === 'image' && backgroundImage) {
    drawCover(ctx, backgroundImage, W, H)
  } else if (background.kind === 'blur' && original) {
    ctx.save()
    ctx.filter = `blur(${background.blurAmount * s}px)`
    // Slight overscan so the blur doesn't feather in from the canvas edge.
    drawCover(ctx, original, W, H, 1.08)
    ctx.restore()
  } else if (flatten) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, W, H)
  }

  /* ---------------- subject placement ---------------- */
  const sw = W * adjustments.scale
  const sh = H * adjustments.scale
  const x = (W - sw) / 2 + (adjustments.offsetX / 100) * W
  const y = (H - sh) / 2 + (adjustments.offsetY / 100) * H

  /* ---------------- drop shadow ---------------- */
  // Rendered on its own layer, then the subject silhouette is punched back out,
  // leaving only the shadow. That keeps the shadow crisp and independent of the
  // colour filters applied to the subject itself.
  if (shadow.enabled && shadow.opacity > 0) {
    const layer = document.createElement('canvas')
    layer.width = W
    layer.height = H
    const lctx = layer.getContext('2d')
    if (lctx) {
      lctx.shadowColor = `rgba(24, 22, 20, ${shadow.opacity / 100})`
      lctx.shadowBlur = shadow.blur * s
      lctx.shadowOffsetX = shadow.distance * 0.45 * s
      lctx.shadowOffsetY = shadow.distance * s
      lctx.drawImage(cutout, x, y, sw, sh)
      lctx.shadowColor = 'transparent'
      lctx.shadowBlur = 0
      lctx.globalCompositeOperation = 'destination-out'
      lctx.drawImage(cutout, x, y, sw, sh)
      ctx.drawImage(layer, 0, 0)
    }
  }

  /* ---------------- subject ---------------- */
  const filters = [
    adjustments.brightness !== 100 ? `brightness(${adjustments.brightness}%)` : '',
    adjustments.contrast !== 100 ? `contrast(${adjustments.contrast}%)` : '',
    adjustments.saturation !== 100 ? `saturate(${adjustments.saturation}%)` : '',
    adjustments.blur > 0 ? `blur(${adjustments.blur * s}px)` : '',
  ]
    .filter(Boolean)
    .join(' ')

  ctx.save()
  if (filters) ctx.filter = filters
  ctx.drawImage(cutout, x, y, sw, sh)
  ctx.restore()

  return canvas
}

/** Draws an image as a centred "cover" fill, optionally overscanned. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
  overscan = 1,
) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const scale = Math.max(W / iw, H / ih) * overscan
  const w = iw * scale
  const h = ih * scale
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg') {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not build the image file.'))),
      type,
      type === 'image/jpeg' ? 0.92 : undefined,
    )
  })
}

/**
 * Shrinks very large local inputs before inference to avoid memory pressure on
 * phones and make browser processing faster. The original never leaves device.
 */
export async function compressForUpload(file: File, maxEdge = 1280): Promise<File> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const longest = Math.max(img.naturalWidth, img.naturalHeight)
    if (longest <= maxEdge) return file

    const scale = maxEdge / longest
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Keep PNG as PNG so images that are already transparent stay lossless.
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const blob = await canvasToBlob(canvas, type)
    // Local inference is constrained by pixel dimensions, not file size. Keep
    // the resized version even if a PNG becomes a little larger in bytes.
    return new File([blob], file.name, { type })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}
