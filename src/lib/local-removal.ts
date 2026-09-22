import type { BackgroundRemovalPipeline } from '@huggingface/transformers'

/**
 * MIT-licensed, Transformers.js-compatible ONNX model. The model is fetched
 * directly by the browser on first use and cached by the browser afterwards.
 */
const MODEL_ID = 'onnx-community/BiRefNet_lite-ONNX'

let segmenter: Promise<BackgroundRemovalPipeline> | null = null

type Progress = (stage: 'detecting' | 'removing' | 'preparing', percent?: number) => void

function supportsWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

async function getSegmenter(onProgress: Progress) {
  if (!segmenter) {
    // Dynamic import keeps the large WebAssembly runtime out of ClearCut's
    // landing-page bundle. It is fetched only after a visitor chooses an image.
    const { env, pipeline } = await import('@huggingface/transformers')
    // Keep model files on the Hugging Face CDN. Nothing is proxied through, or
    // stored by, ClearCut. Browser Cache Storage handles repeat visits.
    env.allowLocalModels = false
    env.useBrowserCache = true

    const progress_callback = (event: { status?: string; progress?: number }) => {
      if (event.status === 'progress') onProgress('detecting', event.progress)
    }

    const load = (device?: 'webgpu') =>
      pipeline('background-removal', MODEL_ID, {
        ...(device ? { device } : {}),
        progress_callback,
      }) as Promise<BackgroundRemovalPipeline>

    // WebGPU is much faster where it exists. If its driver, browser or model
    // variant cannot run, fall back to the WebAssembly/CPU runtime.
    segmenter = supportsWebGPU() ? load('webgpu').catch(() => load()) : load()
  }
  return segmenter
}

/** Returns a transparent PNG entirely from local browser inference. */
export async function removeBackgroundLocally(file: File, onProgress: Progress): Promise<Blob> {
  onProgress('detecting', 0)
  const remover = await getSegmenter(onProgress)
  onProgress('removing', 5)

  const source = URL.createObjectURL(file)
  try {
    const output = await remover(source)
    onProgress('preparing', 85)
    const canvas = document.createElement('canvas')
    canvas.width = output.width
    canvas.height = output.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available in this browser.')

    const image = new ImageData(new Uint8ClampedArray(output.data), output.width, output.height)
    ctx.putImageData(image, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('Could not create PNG.'))), 'image/png'),
    )
    onProgress('preparing', 100)
    return blob
  } finally {
    URL.revokeObjectURL(source)
  }
}
