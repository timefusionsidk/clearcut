import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp, cn } from '@/lib/utils'

type Props = {
  beforeSrc: string
  afterSrc: string
  className?: string
  /** Shown under the handle on first paint to hint that it drags. */
  hint?: boolean
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, className, hint = true }: Props) {
  const [position, setPosition] = useState(52)
  const [dragging, setDragging] = useState(false)
  const frame = useRef<HTMLDivElement>(null)

  const moveTo = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect) return
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      moveTo(e.clientX)
    }
    const stop = () => setDragging(false)
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [dragging, moveTo])

  return (
    <div
      ref={frame}
      className={cn(
        'checkerboard relative select-none overflow-hidden rounded-xl2 border border-line',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      onPointerDown={(e) => {
        setDragging(true)
        moveTo(e.clientX)
      }}
    >
      {/* Cut-out result sits underneath, revealed as the handle moves left. */}
      <img
        src={afterSrc}
        alt="The same image with its background removed"
        className="block h-full w-full object-contain"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt="Original image before background removal"
          className="block h-full w-full object-contain"
          draggable={false}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(27,26,25,.18)]"
        style={{ left: `${position}%` }}
      />

      <button
        type="button"
        role="slider"
        aria-label="Compare original and result"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPosition((p) => clamp(p - 4, 0, 100))
          if (e.key === 'ArrowRight') setPosition((p) => clamp(p + 4, 0, 100))
          if (e.key === 'Home') setPosition(0)
          if (e.key === 'End') setPosition(100)
        }}
        className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface shadow-panel"
        style={{ left: `${position}%` }}
      >
        <span className="flex gap-[3px]">
          <span className="h-3.5 w-[2px] rounded bg-ink-faint" />
          <span className="h-3.5 w-[2px] rounded bg-ink-faint" />
        </span>
      </button>

      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-ink/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        Original
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-accent/90 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        ClearCut
      </span>
      {hint && !dragging && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-surface/85 px-2.5 py-1 text-[11px] text-ink-soft backdrop-blur-sm">
          Drag to compare
        </span>
      )}
    </div>
  )
}
