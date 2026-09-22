import { useRef, useState } from 'react'
import { AlertCircle, ImagePlus, Lock, Upload } from 'lucide-react'
import { Button } from './ui/Button'
import { ACCEPT_ATTR } from '@/lib/defaults'
import type { AppError } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  onFile: (file: File) => void
  error: AppError | null
  onDismissError: () => void
  compact?: boolean
}

export function UploadPanel({ onFile, error, onDismissError, compact = false }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const take = (files: FileList | null) => {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          take(e.dataTransfer.files)
        }}
        className={cn(
          'checkerboard checkerboard-sm relative rounded-xl2 border-2 border-dashed transition-colors',
          dragOver ? 'border-accent' : 'border-line',
        )}
      >
        <div
          className={cn(
            'rounded-[16px] bg-surface/80 backdrop-blur-[1px]',
            compact ? 'px-5 py-7' : 'px-6 py-10 sm:px-10 sm:py-12',
          )}
        >
          <div className="flex flex-col items-center text-center">
            <span
              className={cn(
                'grid place-items-center rounded-2xl border border-line bg-paper transition-transform',
                compact ? 'h-12 w-12' : 'h-14 w-14',
                dragOver && 'scale-105 border-accent bg-accent-tint',
              )}
            >
              {dragOver ? (
                <ImagePlus size={22} className="text-accent" />
              ) : (
                <Upload size={20} className="text-ink-soft" />
              )}
            </span>

            <p className={cn('mt-4 font-display font-semibold', compact ? 'text-base' : 'text-lg')}>
              {dragOver ? 'Drop to start' : 'Drag an image here'}
            </p>
            <p className="mt-1 text-sm text-ink-soft">or pick one from your device</p>

            <Button
              size="lg"
              className="mt-5 w-full sm:w-auto"
              onClick={() => input.current?.click()}
            >
              Upload image
            </Button>

            <p className="mt-4 text-[13px] text-ink-faint">Supports JPG, PNG and WEBP up to 10 MB</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
              <Lock size={13} className="text-accent" />
              Images are not permanently stored.
            </p>
          </div>
        </div>

        <input
          ref={input}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          aria-label="Choose an image to remove the background from"
          onChange={(e) => {
            take(e.target.files)
            // Allow re-selecting the same file after a Start over.
            e.target.value = ''
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-[#FDF3F2] px-4 py-3"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="shrink-0 text-[13px] font-medium text-ink-soft hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
