import { useCallback, useRef } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { UploadPanel } from './components/UploadPanel'
import { Processing } from './components/Processing'
import { Editor } from './components/Editor'
import { AdSlot } from './components/AdSlot'
import { HowItWorks } from './components/HowItWorks'
import { Features } from './components/Features'
import { FAQ } from './components/FAQ'
import { PrivacyNote } from './components/PrivacyNote'
import { Footer } from './components/Footer'
import { LegalPage } from './components/Legal'
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval'

export default function App() {
  const uploadRef = useRef<HTMLDivElement>(null)
  const {
    stage,
    progress,
    error,
    originalUrl,
    cutoutUrl,
    fileName,
    fileSize,
    process,
    reset,
    cancel,
  } = useBackgroundRemoval()

  const processing = ['uploading', 'detecting', 'removing', 'preparing'].includes(stage)
  const editing = stage === 'done' && Boolean(cutoutUrl)

  const focusUpload = useCallback(() => {
    if (editing || processing) {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.dispatchEvent(new Event('clearcut-open-picker'))
  }, [editing, processing])

  const workArea = (
    <div ref={uploadRef}>
      {editing && cutoutUrl ? (
        <Editor
          cutoutUrl={cutoutUrl}
          originalUrl={originalUrl}
          fileName={fileName}
          onStartOver={reset}
        />
      ) : processing ? (
        <Processing
          stage={stage}
          progress={progress}
          thumbnail={originalUrl}
          fileName={fileName}
          fileSize={fileSize}
          onCancel={cancel}
        />
      ) : (
        <UploadPanel onFile={process} error={error} onDismissError={reset} />
      )}
    </div>
  )

  const path = window.location.pathname.replace(/\/$/, '')
  if (path === '/privacy' || path === '/terms') return <LegalPage doc={path.slice(1) as 'privacy' | 'terms'} />
  if (path === '/contact') return <ContactPage />

  return (
    <>
      <Nav onPrimary={focusUpload} />
      <main>
        <Hero workArea={workArea} focused={editing || processing} />
        <AdSlot />
        <HowItWorks />
        <Features />
        <FAQ />
        <PrivacyNote />
      </main>
      <Footer />
    </>
  )
}

function ContactPage() {
  return <><main className="mx-auto max-w-3xl px-4 py-16 sm:px-6"><a href="/" className="text-sm text-accent hover:underline">← Back to ClearCut</a><h1 className="mt-5 font-display text-4xl font-semibold">Contact ClearCut</h1><p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">For support, bugs, copyright concerns, or feedback, contact the project through GitHub. Please do not attach private images.</p><a className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 font-medium text-white hover:opacity-90" href="https://github.com/timefusionsidk/clearcut/issues/new" target="_blank" rel="noreferrer">Contact project support</a></main><Footer /></>
}
