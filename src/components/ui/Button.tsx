import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-key hover:bg-accent-dark active:translate-y-px disabled:bg-ink-faint',
  secondary:
    'bg-surface text-ink border border-line hover:border-ink-faint hover:bg-paper active:translate-y-px',
  ghost: 'bg-transparent text-ink hover:bg-black/[.04]',
  quiet: 'bg-accent-tint text-accent-dark hover:bg-[#E4DDFD]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] rounded-lg',
  md: 'min-h-11 px-4 text-sm rounded-[10px]',
  lg: 'min-h-12 px-6 text-[15px] rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
})
