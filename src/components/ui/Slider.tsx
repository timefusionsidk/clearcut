import { useId } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  disabled?: boolean
  onChange: (value: number) => void
  onReset?: () => void
  className?: string
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  disabled,
  onChange,
  onReset,
  className,
}: Props) {
  const id = useId()
  return (
    <div className={cn('py-0.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-soft">
          {label}
        </label>
        <button
          type="button"
          onClick={onReset}
          disabled={!onReset || disabled}
          title={onReset ? `Reset ${label.toLowerCase()}` : undefined}
          className="font-display text-[13px] tabular-nums text-ink transition-colors hover:text-accent disabled:cursor-default disabled:hover:text-ink"
        >
          {Math.round(value)}
          {suffix}
        </button>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
