import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  {
    q: 'Is ClearCut free?',
    a: 'Yes, completely. There is no account, no trial and no subscription. Ads cover the cost of the AI processing.',
  },
  {
    q: 'Why do I need to watch an ad?',
    a: 'Every cutout costs money to process. One short ad per image pays for that, which is what keeps the tool free and unlimited instead of putting it behind a paywall.',
  },
  {
    q: 'Are my images stored?',
    a: 'No. Your image is held in memory only while the background is being removed, then discarded. Nothing is written to a database or a storage bucket, and the edited result is built in your own browser.',
  },
  {
    q: 'Which file formats can I upload?',
    a: 'JPG, PNG and WEBP, up to 10 MB. Very large photos are resized before processing so the upload stays quick.',
  },
  {
    q: 'Can I use ClearCut on mobile?',
    a: 'Yes. The upload, editor and download all work in a mobile browser, and the file saves straight to your device.',
  },
  {
    q: 'Why did my image fail to process?',
    a: 'Usually the file was an unsupported format, larger than 10 MB, or the connection dropped mid-upload. Occasionally the AI service is at capacity — waiting a moment and trying again fixes it.',
  },
  {
    q: 'Can I use my edited image commercially?',
    a: 'Your image stays yours, and ClearCut claims no rights to it. Make sure you hold the rights to whatever you upload, including any background image you add.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="text-2xl font-semibold sm:text-[32px]">Questions</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {ITEMS.map((item, i) => {
          const expanded = open === i
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-display text-[15px] font-medium sm:text-base">{item.q}</span>
                  <Plus
                    size={17}
                    aria-hidden
                    className={cn(
                      'shrink-0 text-ink-faint transition-transform duration-200',
                      expanded && 'rotate-45 text-accent',
                    )}
                  />
                </button>
              </h3>
              <div id={`faq-${i}`} hidden={!expanded} className="pb-5 pr-8">
                <p className="text-[15px] leading-relaxed text-ink-soft">{item.a}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
