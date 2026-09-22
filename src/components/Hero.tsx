import { BeforeAfterSlider } from './BeforeAfterSlider'
import { cn } from '@/lib/utils'

type Props = {
  /** Upload panel, processing screen or editor — whatever the flow is showing. */
  workArea: React.ReactNode
  /** Collapses the marketing column once an image is in the editor. */
  focused: boolean
}

export function Hero({ workArea, focused }: Props) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* One orchestrated background: two slow-drifting light pools. Nothing
          else on the page animates on load. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-32 h-[420px] w-[420px] animate-drift rounded-full bg-[radial-gradient(circle,rgba(74,34,224,.16),transparent_62%)] blur-2xl" />
        <div className="absolute -right-32 top-24 h-[460px] w-[460px] animate-drift rounded-full bg-[radial-gradient(circle,rgba(34,120,224,.14),transparent_62%)] blur-2xl [animation-delay:-8s]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-16">
        <div
          className={cn(
            'grid items-start gap-10',
            focused ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14',
          )}
        >
          <div className="animate-rise">
            {!focused && (
              <>
                <h1 className="max-w-[18ch] text-[34px] font-bold leading-[1.05] sm:text-[52px]">
                  Remove backgrounds in one click.
                </h1>
                <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft sm:text-[18px]">
                  Upload any image, let AI remove the background, and download a clean transparent PNG
                  for free.
                </p>
              </>
            )}

            <div className={cn(focused ? 'mt-0' : 'mt-7')}>{workArea}</div>
          </div>

          {!focused && (
            <div className="animate-rise [animation-delay:120ms]">
              <BeforeAfterSlider
                beforeSrc="/sample-before.svg"
                afterSrc="/sample-subject.svg"
                className="aspect-square w-full bg-surface"
              />
              <p className="mt-3 text-[13px] text-ink-faint">
                A sample cutout. Drag the handle to see the difference.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
