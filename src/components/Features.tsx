import { Cpu, Image, Layers, Smartphone, Sparkles, Trash2 } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'One-click background removal',
    body: 'Drop an image in and the cutout starts immediately. No selections, no masking, no settings to learn.',
  },
  {
    icon: Layers,
    title: 'High-quality transparent PNG',
    body: 'Your download keeps real alpha transparency, so it drops cleanly into any design, deck or store listing.',
  },
  {
    icon: Image,
    title: 'Custom backgrounds',
    body: 'Swap in a solid colour, a gradient, your own photo, or blur the original scene behind the subject.',
  },
  {
    icon: Smartphone,
    title: 'Works on phones and computers',
    body: 'The editor, the preview and the download all work the same on a phone as on a desktop browser.',
  },
  {
    icon: Cpu,
    title: 'Fast AI processing',
    body: 'Processing runs on a hosted model, so a typical photo is ready to preview in a few seconds.',
  },
  {
    icon: Trash2,
    title: 'Images are not permanently stored',
    body: 'Your upload is processed and discarded. There is no account, no gallery and no image database.',
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="max-w-lg text-2xl font-semibold sm:text-[32px]">
          Everything you need, nothing you have to sign up for
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-surface p-6">
              <Icon size={19} className="text-accent" aria-hidden />
              <h3 className="mt-3.5 font-display text-[15px] font-semibold">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
