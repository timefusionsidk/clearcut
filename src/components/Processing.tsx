import { Button } from './ui/Button'
import type { ProcessStage } from '@/lib/types'
import { formatBytes } from '@/lib/utils'

const COPY: Record<Exclude<ProcessStage, 'idle' | 'done' | 'error'>, string> = {
  uploading: 'Uploading image…',
  detecting: 'Detecting subject…',
  removing: 'Removing background…',
  preparing: 'Preparing your preview…',
}

const ORDER: Array<keyof typeof COPY> = ['uploading', 'detecting', 'removing', 'preparing']

type Props = {
  stage: ProcessStage
  progress: number
  thumbnail: string | null
  fileName: string | null
  fileSize: number | null
  onCancel: () => void
}

export function Processing({ stage, progress, thumbnail, fileName, fileSize, onCancel }: Props) {
  const key = (ORDER.includes(stage as keyof typeof COPY) ? stage : 'uploading') as keyof typeof COPY
  const index = ORDER.indexOf(key)
  // Upload progress is real; the provider gives no progress, so the bar holds
  // at a stage floor rather than pretending to know how far along it is.
  const bar = key === 'uploading' ? Math.max(6, progress * 0.35) : 35 + index * 20

  return (
    <div className="mx-auto max-w-lg rounded-xl2 border border-line bg-surface p-5 shadow-panel sm:p-7">
      <div className="flex items-center gap-4">
        <div className="checkerboard checkerboard-sm relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line">
          {thumbnail && (
            <img src={thumbnail} alt="" className="h-full w-full object-cover opacity-90" />
          )}
          <span className="absolute inset-0 overflow-hidden">
            <span className="absolute inset-y-0 w-1/3 animate-sheen bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p aria-live="polite" className="font-display text-[15px] font-semibold">
            {COPY[key]}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-ink-soft">
            {fileName}
            {fileSize ? ` · ${formatBytes(fileSize)}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${bar}%` }}
        />
      </div>

      <ol className="mt-4 grid gap-1.5">
        {ORDER.map((step, i) => (
          <li
            key={step}
            className={
              i < index
                ? 'text-[13px] text-ink-faint line-through decoration-line'
                : i === index
                  ? 'text-[13px] font-medium text-ink'
                  : 'text-[13px] text-ink-faint'
            }
          >
            {COPY[step]}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-[13px] text-ink-soft">This usually takes a few seconds.</p>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
