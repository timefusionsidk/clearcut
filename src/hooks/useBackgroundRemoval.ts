import { useCallback, useRef, useState } from 'react'
import { compressForUpload } from '@/lib/compose'
import { validateFile } from '@/lib/validate'
import type { AppError, ProcessStage } from '@/lib/types'

type State = {
  stage: ProcessStage
  progress: number
  error: AppError | null
  /** Object URL for the user's original upload. */
  originalUrl: string | null
  /** Object URL for the transparent PNG the AI returned. */
  cutoutUrl: string | null
  fileName: string | null
  fileSize: number | null
}

const initial: State = {
  stage: 'idle',
  progress: 0,
  error: null,
  originalUrl: null,
  cutoutUrl: null,
  fileName: null,
  fileSize: null,
}

export function useBackgroundRemoval() {
  const [state, setState] = useState<State>(initial)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const urlsRef = useRef<string[]>([])

  const track = (url: string) => {
    urlsRef.current.push(url)
    return url
  }

  const releaseUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    urlsRef.current = []
  }, [])

  const reset = useCallback(() => {
    xhrRef.current?.abort()
    xhrRef.current = null
    releaseUrls()
    setState(initial)
  }, [releaseUrls])

  const cancel = useCallback(() => {
    xhrRef.current?.abort()
    xhrRef.current = null
    setState((s) => ({ ...initial, originalUrl: s.originalUrl, fileName: s.fileName, fileSize: s.fileSize }))
  }, [])

  const process = useCallback(
    async (file: File) => {
      const invalid = validateFile(file)
      if (invalid) {
        setState((s) => ({ ...s, stage: 'error', error: invalid }))
        return
      }

      releaseUrls()
      const originalUrl = track(URL.createObjectURL(file))
      setState({
        ...initial,
        stage: 'uploading',
        originalUrl,
        fileName: file.name,
        fileSize: file.size,
      })

      let payload: File
      try {
        payload = await compressForUpload(file)
      } catch {
        payload = file
      }

      const body = new FormData()
      body.append('image', payload, payload.name || 'upload')

      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr
      xhr.open('POST', '/api/remove-background')
      xhr.responseType = 'blob'

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const pct = Math.round((event.loaded / event.total) * 100)
        setState((s) => (s.stage === 'uploading' ? { ...s, progress: pct } : s))
      }

      xhr.upload.onload = () => {
        // Bytes are with the server now; the provider does the slow part.
        setState((s) => ({ ...s, stage: 'detecting', progress: 100 }))
        window.setTimeout(
          () => setState((s) => (s.stage === 'detecting' ? { ...s, stage: 'removing' } : s)),
          1200,
        )
      }

      xhr.onload = async () => {
        xhrRef.current = null
        const blob = xhr.response as Blob

        if (xhr.status === 200 && blob && blob.type.startsWith('image/')) {
          setState((s) => ({ ...s, stage: 'preparing' }))
          const cutoutUrl = track(URL.createObjectURL(blob))
          setState((s) => ({ ...s, stage: 'done', cutoutUrl, error: null }))
          return
        }

        const parsed = await readError(blob)
        setState((s) => ({
          ...s,
          stage: 'error',
          error: parsed ?? {
            code: 'failed',
            message: 'We could not remove the background. Please try another image.',
          },
        }))
      }

      xhr.onerror = () => {
        xhrRef.current = null
        setState((s) => ({
          ...s,
          stage: 'error',
          error: {
            code: 'network',
            message: 'The connection dropped before processing finished. Check your network and try again.',
          },
        }))
      }

      xhr.onabort = () => {
        xhrRef.current = null
      }

      xhr.send(body)
    },
    [releaseUrls],
  )

  return { ...state, process, reset, cancel }
}

async function readError(blob: Blob | null): Promise<AppError | null> {
  if (!blob) return null
  try {
    const text = await blob.text()
    const json = JSON.parse(text) as { code?: string; error?: string }
    if (!json.error) return null
    return { code: json.code ?? 'failed', message: json.error }
  } catch {
    return null
  }
}
