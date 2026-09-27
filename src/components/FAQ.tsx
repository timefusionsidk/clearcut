import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  {
    q: 'Is ClearCut free?',
    a: 'Yes. There is no account, trial or subscription. If standard display ads are enabled later, they will never block image processing or downloads.',
  },
  {
    q: 'Does ClearCut require watching an ad?',
    a: 'No. ClearCut never requires an ad view or ad click to unlock background removal or downloads. Optional display ads may appear only in informational areas.',
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
    a: 'Usually the file is unsupported, larger than 10 MB, or your browser does not have enough memory for local AI processing. Try a smaller image, close other tabs, or use a current browser.',
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
