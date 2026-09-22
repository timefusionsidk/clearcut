import { Slider } from './ui/Slider'
import { DEFAULT_SETTINGS } from '@/lib/defaults'
import type { Adjustments, Shadow } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  adjustments: Adjustments
  shadow: Shadow
  onAdjust: (patch: Partial<Adjustments>) => void
  onShadow: (patch: Partial<Shadow>) => void
}

const D = DEFAULT_SETTINGS

export function AdjustPanel({ adjustments, shadow, onAdjust, onShadow }: Props) {
  return (
    <div className="grid gap-5">
      <section aria-label="Subject placement" className="grid gap-1">
        <Slider
          label="Scale"
          value={adjustments.scale * 100}
          min={40}
          max={200}
          suffix="%"
          onChange={(value) => onAdjust({ scale: value / 100 })}
          onReset={() => onAdjust({ scale: D.adjustments.scale })}
        />
        <Slider
          label="Position across"
          value={adjustments.offsetX}
          min={-50}
          max={50}
          onChange={(value) => onAdjust({ offsetX: value })}
          onReset={() => onAdjust({ offsetX: 0 })}
        />
        <Slider
          label="Position down"
          value={adjustments.offsetY}
          min={-50}
          max={50}
          onChange={(value) => onAdjust({ offsetY: value })}
          onReset={() => onAdjust({ offsetY: 0 })}
        />
      </section>

      <section aria-label="Colour" className="grid gap-1 border-t border-line pt-4">
        <Slider
          label="Brightness"
          value={adjustments.brightness}
          min={50}
          max={150}
          suffix="%"
          onChange={(value) => onAdjust({ brightness: value })}
          onReset={() => onAdjust({ brightness: 100 })}
        />
        <Slider
          label="Contrast"
          value={adjustments.contrast}
          min={50}
          max={150}
          suffix="%"
          onChange={(value) => onAdjust({ contrast: value })}
          onReset={() => onAdjust({ contrast: 100 })}
        />
        <Slider
          label="Saturation"
          value={adjustments.saturation}
          min={0}
          max={200}
          suffix="%"
          onChange={(value) => onAdjust({ saturation: value })}
          onReset={() => onAdjust({ saturation: 100 })}
        />
        <Slider
          label="Blur"
          value={adjustments.blur}
          min={0}
          max={12}
          step={0.5}
          onChange={(value) => onAdjust({ blur: value })}
          onReset={() => onAdjust({ blur: 0 })}
        />
      </section>

      <section aria-label="Drop shadow" className="border-t border-line pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink-soft">Drop shadow</span>
          <button
            type="button"
            role="switch"
            aria-checked={shadow.enabled}
            aria-label="Drop shadow"
            onClick={() => onShadow({ enabled: !shadow.enabled })}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
              shadow.enabled ? 'border-accent bg-accent' : 'border-line bg-line',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-key transition-[left]',
                shadow.enabled ? 'left-[22px]' : 'left-0.5',
              )}
            />
          </button>
        </div>

        <div className={cn('mt-1 grid gap-1', !shadow.enabled && 'opacity-50')}>
          <Slider
            label="Shadow opacity"
            value={shadow.opacity}
            min={0}
            max={100}
            suffix="%"
            disabled={!shadow.enabled}
            onChange={(value) => onShadow({ opacity: value })}
            onReset={() => onShadow({ opacity: D.shadow.opacity })}
          />
          <Slider
            label="Shadow blur"
            value={shadow.blur}
            min={0}
            max={80}
            disabled={!shadow.enabled}
            onChange={(value) => onShadow({ blur: value })}
            onReset={() => onShadow({ blur: D.shadow.blur })}
          />
          <Slider
            label="Shadow distance"
            value={shadow.distance}
            min={0}
            max={60}
            disabled={!shadow.enabled}
            onChange={(value) => onShadow({ distance: value })}
            onReset={() => onShadow({ distance: D.shadow.distance })}
          />
        </div>
      </section>

      <section className="border-t border-line pt-4">
        <p className="text-[13px] font-medium text-ink-soft">Coming soon</p>
        <ul className="mt-2 grid gap-1.5 text-[13px] text-ink-faint">
          <li>Manual brush touch-up for tricky edges</li>
          <li>Batch removal for multiple images</li>
          <li>Edge refine and feather control</li>
        </ul>
      </section>
    </div>
  )
}
