import { Modal } from './ui/Modal'

export type LegalDoc = 'privacy' | 'terms' | null

const UPDATED = 'This policy was last updated on the date this site was deployed.'

export function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  if (!doc) return null

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={doc === 'privacy' ? 'Privacy policy' : 'Terms of use'}
    >
      <div className="grid gap-5 text-[14px] leading-relaxed text-ink-soft">
        {doc === 'privacy' ? <Privacy /> : <Terms />}
        <p className="border-t border-line pt-4 text-[12px] text-ink-faint">{UPDATED}</p>
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 font-display text-[15px] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  )
}

function Privacy() {
  return (
    <>
      <p>
        ClearCut is a free background-removal tool. It has no accounts, no sign-in and no user
        database. This policy explains what happens to an image you upload.
      </p>

      <Section title="Images are processed temporarily only">
        <p>
          The AI model is downloaded directly by your browser and processes your image on your own
          device. ClearCut does not receive, upload, write or store the image or the resulting PNG.
        </p>
      </Section>

      <Section title="Images are not intentionally stored permanently">
        <p>
          We do not keep copies of your images, do not build galleries or project histories, and have
          no way to retrieve an image you processed earlier. Your browser may cache the AI model to
          make future removals faster; that model cache does not contain your images.
        </p>
      </Section>

      <Section title="AI model delivery">
        <p>
          Your browser downloads the open model files from our selected model host. The model host
          receives a normal file-download request, not your image. We do not send them your name,
          email or image data.
        </p>
      </Section>

      <Section title="Editing happens in your browser">
        <p>
          Background colours, gradients, blur, shadows and any background image you add are
          composited on your own device. A background image you choose is never uploaded anywhere.
        </p>
      </Section>

      <Section title="Advertising">
        <p>
          The site may be funded by standard display ads. Ad networks may set cookies or use device
          identifiers to serve and measure ads, as described in their own policies. We do not sell data,
          and we never pass your images to advertisers.
        </p>
      </Section>

      <Section title="What we log">
        <p>
          ClearCut has no image-processing server. Our hosting and advertising providers may collect
          standard technical request logs under their own policies. We do not log image contents,
          filenames or API keys.
        </p>
      </Section>

      <Section title="What you should not upload">
        <p>
          Do not upload illegal content, intimate or otherwise sensitive images, or material you do
          not hold the rights to. You are responsible for what you process here.
        </p>
      </Section>
    </>
  )
}

function Terms() {
  return (
    <>
      <Section title="Using ClearCut">
        <p>
          ClearCut is provided free of charge, as is, with no uptime or accuracy guarantee. You may use
          it for personal and commercial work. Automated or bulk use that makes the public website
          unavailable for others is not permitted.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You keep all rights to the images you upload and to the results you download. We claim no
          licence over them. You confirm that you hold the rights to any image you process, including
          any background image you add.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Do not use ClearCut to process illegal material, to create misleading imagery of real people,
          or to infringe anyone&apos;s rights. We may block requests that appear abusive.
        </p>
      </Section>

      <Section title="Ads">
        <p>ClearCut may show standard display ads. We do not use forced redirects or auto-clicking ads.</p>
      </Section>

      <Section title="Liability">
        <p>
          ClearCut is not liable for any loss arising from the use of the tool or the results it
          produces. If the service is unavailable or a cutout is imperfect, your remedy is to stop
          using it.
        </p>
      </Section>
    </>
  )
}
