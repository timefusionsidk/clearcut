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
          An image you upload is sent to our processing function, passed to an AI background-removal
          provider, and returned to your browser as a transparent PNG. It is held in memory for the
          length of that single request and is then discarded. We do not write uploads or results to
          a database, a storage bucket or a disk.
        </p>
      </Section>

      <Section title="Images are not intentionally stored permanently">
        <p>
          We do not keep copies of your images, do not build galleries or project histories, and have
          no way to retrieve an image you processed earlier. Any temporary copy created while
          processing is deleted as soon as processing finishes.
        </p>
      </Section>

      <Section title="Third-party AI processing">
        <p>
          Background removal is performed by a third-party AI provider. Your image is shared with
          that provider only to perform the removal you requested, and is subject to their own data
          policy for the duration of that request. We do not send them your name, email or any other
          personal detail, because we do not collect any.
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
          The site is funded by ads, including a rewarded ad you watch before downloading. Ad networks
          may set cookies or use device identifiers to serve and measure ads, as described in their own
          policies. We do not sell data, and we do not pass your images to advertisers.
        </p>
      </Section>

      <Section title="What we log">
        <p>
          Our server records the outcome of a processing request — whether it succeeded, failed or was
          rate limited — plus a short-lived record of request counts per IP address to prevent abuse.
          We do not log image contents, filenames or API keys.
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
          it for personal and commercial work. Automated or bulk use, scraping the processing endpoint,
          or attempting to bypass the rate limits or the rewarded-ad step is not permitted.
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
        <p>
          Downloads are unlocked by completing a rewarded ad. Blocking or interfering with the ad
          leaves the download locked. We do not use pop-ups, forced redirects or auto-clicking ads.
        </p>
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
