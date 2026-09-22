const STEPS = [
  {
    title: 'Upload',
    body: 'Choose a photo from your device, or drag it straight onto the page. JPG, PNG and WEBP up to 10 MB.',
  },
  {
    title: 'Remove',
    body: 'AI finds the subject and cuts the background away, keeping hair, edges and fine detail intact.',
  },
  {
    title: 'Download',
    body: 'Watch a short ad and save your image in high quality — transparent PNG or JPG with a new background.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="max-w-lg text-2xl font-semibold sm:text-[32px]">
        Three steps, about ten seconds
      </h2>
      <ol className="mt-8 grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="bg-surface p-6">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-accent-tint font-display text-[13px] font-bold text-accent-dark"
            >
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
