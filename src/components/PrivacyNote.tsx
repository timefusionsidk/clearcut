import { Lock } from 'lucide-react'

export function PrivacyNote() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="flex flex-col gap-4 rounded-xl2 border border-line bg-surface p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-8">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-tint">
          <Lock size={18} className="text-accent-dark" aria-hidden />
        </span>
        <div className="max-w-2xl">
          <h2 className="font-display text-lg font-semibold">What happens to your image</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            Your upload is held in memory just long enough for the AI to cut out the background, then
            discarded. There is no account, no image gallery and no database — so there is nothing to
            delete later. Every edit you make afterwards, including any background image you add,
            happens on your own device.
          </p>
        </div>
      </div>
    </section>
  )
}
