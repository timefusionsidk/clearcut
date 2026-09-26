import { useCallback, useRef, useState } from 'react'
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
import { LegalModal, type LegalDoc } from './components/Legal'
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval'

export default function App() {
  const [legal, setLegal] = useState<LegalDoc>(null)
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
      <Footer onOpenLegal={setLegal} />
      <LegalModal doc={legal} onClose={() => setLegal(null)} />
    </>
  )
}
