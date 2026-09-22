import { useRef } from 'react'
import { Image as ImageIcon, Trash2 } from 'lucide-react'
import { Slider } from './ui/Slider'
import { GRADIENTS } from '@/lib/gradients'
import type { Background } from '@/lib/types'
import { cn } from '@/lib/utils'

const SWATCHES = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Light gray', value: '#EFEDEA' },
  { label: 'Black', value: '#141416' },
]

type Props = {
  background: Background
  onChange: (patch: Partial<Background>) => void
  /** Pick a background image locally — never uploaded to a server. */
  onPickImage: (file: File) => void
  onClearImage: () => void
  hasOriginal: boolean
}

export function BackgroundOptions({
  background,
  onChange,
  onPickImage,
  onClearImage,
  hasOriginal,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const selected = (kind: Background['kind'], extra?: boolean) =>
    background.kind === kind && extra !== false

  return (
    <section aria-label="Background" className="grid gap-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
        <OptionTile
          label="None"
          active={selected('transparent')}
          onClick={() => onChange({ kind: 'transparent' })}
        >
          <span className="checkerboard checkerboard-sm block h-full w-full" />
        </OptionTile>

        {SWATCHES.map((swatch) => (
          <OptionTile
            key={swatch.value}
            label={swatch.label}
            active={background.kind === 'color' && background.color.toUpperCase() === swatch.value}
            onClick={() => onChange({ kind: 'color', color: swatch.value })}
          >
            <span className="block h-full w-full" style={{ background: swatch.value }} />
          </OptionTile>
        ))}

        <OptionTile
          label="Blur"
          active={selected('blur')}
          disabled={!hasOriginal}
          onClick={() => onChange({ kind: 'blur' })}
        >
          <span
            className="block h-full w-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #C6D2DE, #8E9CAC 45%, #6C7886)',
              filter: 'blur(1.5px)',
            }}
          />
        </OptionTile>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-ink-soft">Gradients</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
          {GRADIENTS.map((gradient) => (
            <OptionTile
              key={gradient.id}
              label={gradient.name}
              active={background.kind === 'gradient' && background.gradientId === gradient.id}
              onClick={() => onChange({ kind: 'gradient', gradientId: gradient.id })}
            >
              <span
                className="block h-full w-full"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${gradient.stops.join(', ')})`,
                }}
              />
            </OptionTile>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-paper p-3">
        <label className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink-soft">Custom colour</span>
          <span className="flex items-center gap-2">
            <span className="font-display text-[13px] tabular-nums text-ink">
              {background.color.toUpperCase()}
            </span>
            <input
              type="color"
              aria-label="Pick a background colour"
              value={background.color}
              onChange={(e) => onChange({ kind: 'color', color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1"
            />
          </span>
        </label>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink-soft">Background image</span>
          <span className="flex items-center gap-1.5">
            {background.imageUrl && (
              <button
                type="button"
                onClick={onClearImage}
                aria-label="Remove background image"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-soft hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium hover:border-ink-faint"
            >
              <ImageIcon size={14} />
              {background.imageUrl ? 'Replace' : 'Choose'}
            </button>
          </span>
        </div>

        {background.imageUrl && (
          <button
            type="button"
            onClick={() => onChange({ kind: 'image' })}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-2 text-left transition-colors',
              background.kind === 'image' ? 'border-accent bg-accent-tint' : 'border-line bg-surface',
            )}
          >
            <img
              src={background.imageUrl}
              alt=""
              className="h-10 w-14 rounded-md border border-line object-cover"
            />
            <span className="text-[13px] text-ink-soft">
              {background.kind === 'image' ? 'In use' : 'Tap to use this image'}
            </span>
          </button>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onPickImage(file)
            e.target.value = ''
          }}
        />
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Background images stay on your device — they are composited in your browser and never uploaded.
        </p>
      </div>

      {background.kind === 'blur' && (
        <Slider
          label="Background blur"
          value={background.blurAmount}
          min={2}
          max={40}
          onChange={(value) => onChange({ blurAmount: value })}
          onReset={() => onChange({ blurAmount: 18 })}
        />
      )}
    </section>
  )
}

function OptionTile({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={label}
      className={cn(
        'group flex flex-col items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      <span
        className={cn(
          'block h-11 w-full overflow-hidden rounded-[10px] border transition-shadow',
          active ? 'border-accent ring-2 ring-accent/30' : 'border-line group-hover:border-ink-faint',
        )}
      >
        {children}
      </span>
      <span className={cn('text-[11px]', active ? 'text-accent-dark' : 'text-ink-faint')}>{label}</span>
    </button>
  )
}
