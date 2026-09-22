import { useCallback, useRef, useState } from 'react'
import { compressForUpload } from '@/lib/compose'
import { removeBackgroundLocally } from '@/lib/local-removal'
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
  const taskRef = useRef(0)
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
    taskRef.current += 1
    releaseUrls()
    setState(initial)
  }, [releaseUrls])

  const cancel = useCallback(() => {
    taskRef.current += 1
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

      const task = ++taskRef.current
      let payload: File
      try {
        payload = await compressForUpload(file)
      } catch {
        payload = file
      }

      try {
        const blob = await removeBackgroundLocally(payload, (stage, progress) => {
          if (task !== taskRef.current) return
          setState((s) => ({ ...s, stage, progress: progress ?? s.progress }))
        })
        if (task !== taskRef.current) return
        const cutoutUrl = track(URL.createObjectURL(blob))
        setState((s) => ({ ...s, stage: 'done', progress: 100, cutoutUrl, error: null }))
      } catch (error) {
        if (task !== taskRef.current) return
        console.error('[ClearCut] local processing failed', error)
        setState((s) => ({
          ...s,
          stage: 'error',
          error: {
            code: 'local_processing_failed',
            message: 'This device could not process the image locally. Try a smaller image or a newer browser.',
          },
        }))
      }
    },
    [releaseUrls],
  )

  return { ...state, process, reset, cancel }
}
