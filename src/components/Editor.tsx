import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Eye, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from './ui/Button'
import { Segmented } from './ui/Segmented'
import { BackgroundOptions } from './BackgroundOptions'
import { AdjustPanel } from './AdjustPanel'
import { DownloadPanel, type DownloadFormat, type DownloadQuality } from './DownloadPanel'
import { RewardedAdGate } from './RewardedAdGate'
import { DEFAULT_SETTINGS } from '@/lib/defaults'
import { PREVIEW_MAX, STANDARD_MAX, canvasToBlob, compose, loadImage } from '@/lib/compose'
import { buildFilename, saveBlob } from '@/lib/download'
import type { Adjustments, Background, EditorSettings, Shadow } from '@/lib/types'
import { clamp, cn } from '@/lib/utils'

type Props = {
  cutoutUrl: string
  originalUrl: string | null
  fileName: string | null
  onStartOver: () => void
}

type Tab = 'background' | 'adjust' | 'download'

export function Editor({ cutoutUrl, originalUrl, fileName, onStartOver }: Props) {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS)
  const [cutout, setCutout] = useState<HTMLImageElement | null>(null)
  const [original, setOriginal] = useState<HTMLImageElement | null>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [comparing, setComparing] = useState(false)
  const [tab, setTab] = useState<Tab>('background')
  const [format, setFormat] = useState<DownloadFormat>('png')
  const [quality, setQuality] = useState<DownloadQuality>('hd')
  const [unlocked, setUnlocked] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgObjectUrl = useRef<string | null>(null)
  const frame = useRef(0)

  /* ---------------- load source images ---------------- */
  useEffect(() => {
    let alive = true
    loadImage(cutoutUrl)
      .then((img) => alive && setCutout(img))
      .catch(() => alive && setNote('That result could not be displayed. Try another image.'))
    return () => {
      alive = false
    }
  }, [cutoutUrl])

  useEffect(() => {
    if (!originalUrl) return
    let alive = true
    loadImage(originalUrl)
      .then((img) => alive && setOriginal(img))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [originalUrl])

  useEffect(
    () => () => {
      if (bgObjectUrl.current) URL.revokeObjectURL(bgObjectUrl.current)
    },
    [],
  )

  /* ---------------- live preview ---------------- */
  const renderPreview = useCallback(() => {
    const target = canvasRef.current
    if (!target || !cutout) return
    const rendered = compose({
      cutout,
      original,
      backgroundImage: bgImage,
      settings,
      maxDimension: PREVIEW_MAX,
    })
    target.width = rendered.width
    target.height = rendered.height
    const ctx = target.getContext('2d')
    ctx?.clearRect(0, 0, target.width, target.height)
    ctx?.drawImage(rendered, 0, 0)
  }, [cutout, original, bgImage, settings])

  useEffect(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(renderPreview)
    return () => cancelAnimationFrame(frame.current)
  }, [renderPreview])

  /* ---------------- derived ---------------- */
  const dimensions = useMemo(() => {
    if (!cutout) return null
    const w = cutout.naturalWidth
    const h = cutout.naturalHeight
    const longest = Math.max(w, h)
    const ratio = longest > STANDARD_MAX ? STANDARD_MAX / longest : 1
    return {
      standard: [Math.round(w * ratio), Math.round(h * ratio)] as [number, number],
      hd: [w, h] as [number, number],
    }
  }, [cutout])

  const hdAvailable = Boolean(dimensions && dimensions.hd[0] > dimensions.standard[0])
  const transparent = settings.background.kind === 'transparent'

  /* ---------------- settings updaters ---------------- */
  const patchBackground = (patch: Partial<Background>) =>
    setSettings((s) => ({ ...s, background: { ...s.background, ...patch } }))
  const patchAdjust = (patch: Partial<Adjustments>) =>
    setSettings((s) => ({ ...s, adjustments: { ...s.adjustments, ...patch } }))
  const patchShadow = (patch: Partial<Shadow>) =>
    setSettings((s) => ({ ...s, shadow: { ...s.shadow, ...patch } }))

  const pickBackgroundImage = async (file: File) => {
    if (bgObjectUrl.current) URL.revokeObjectURL(bgObjectUrl.current)
    const url = URL.createObjectURL(file)
    bgObjectUrl.current = url
    try {
      const img = await loadImage(url)
      setBgImage(img)
      patchBackground({ kind: 'image', imageUrl: url })
    } catch {
      setNote('That background image could not be read.')
    }
  }

  const clearBackgroundImage = () => {
    if (bgObjectUrl.current) URL.revokeObjectURL(bgObjectUrl.current)
    bgObjectUrl.current = null
    setBgImage(null)
    patchBackground({ kind: 'transparent', imageUrl: null })
  }

  /* ---------------- download ---------------- */
  const writeFile = useCallback(async () => {
    if (!cutout) return
    setBusy(true)
    setNote(null)
    try {
      const flatten = format === 'jpg'
      const rendered = compose({
        cutout,
        original,
        backgroundImage: bgImage,
        settings,
        maxDimension: quality === 'hd' ? undefined : STANDARD_MAX,
        flatten,
      })
      const blob = await canvasToBlob(rendered, flatten ? 'image/jpeg' : 'image/png')
      saveBlob(blob, buildFilename(format, quality))
    } catch {
      setNote('The file could not be prepared. Try a smaller image or a different format.')
    } finally {
      setBusy(false)
    }
  }, [cutout, original, bgImage, settings, format, quality])

  const requestDownload = () => {
    if (unlocked) {
      void writeFile()
      return
    }
    setGateOpen(true)
  }

  const onRewarded = useCallback(async () => {
    // Reached only from the ad network's own reward callback.
    setUnlocked(true)
    await writeFile()
  }, [writeFile])

  const startOver = () => {
    clearBackgroundImage()
    setSettings(DEFAULT_SETTINGS)
    setUnlocked(false)
    setZoom(1)
    onStartOver()
  }

  /* ---------------- panels ---------------- */
  const backgroundPanel = (
    <BackgroundOptions
      background={settings.background}
      onChange={patchBackground}
      onPickImage={pickBackgroundImage}
      onClearImage={clearBackgroundImage}
      hasOriginal={Boolean(original)}
    />
  )

  const adjustPanel = (
    <AdjustPanel
      adjustments={settings.adjustments}
      shadow={settings.shadow}
      onAdjust={patchAdjust}
      onShadow={patchShadow}
    />
  )

  const downloadPanel = (
    <DownloadPanel
      format={format}
      quality={quality}
      onFormat={setFormat}
      onQuality={setQuality}
      onDownload={requestDownload}
      unlocked={unlocked}
      busy={busy}
      transparent={transparent}
      hdAvailable={hdAvailable}
      dimensions={dimensions}
    />
  )

  return (
    <div className="rounded-xl2 border border-line bg-surface shadow-panel">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="checkerboard checkerboard-sm hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line sm:block">
            {originalUrl && <img src={originalUrl} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">Background removed</p>
            <p className="truncate text-[12px] text-ink-soft">{fileName ?? 'Your image'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => setComparing(true)}
            onPointerUp={() => setComparing(false)}
            onPointerLeave={() => setComparing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setComparing((c) => !c)}
            disabled={!originalUrl}
            aria-pressed={comparing}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-medium transition-colors disabled:opacity-40',
              comparing ? 'border-accent bg-accent-tint text-accent-dark' : 'border-line hover:border-ink-faint',
            )}
          >
            <Eye size={15} />
            Hold to compare
          </button>
          <Button variant="secondary" onClick={startOver}>
            <RotateCcw size={15} />
            Start over
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* preview */}
        <div className="flex flex-col border-b border-line lg:border-b-0 lg:border-r">
          <div className="checkerboard relative flex flex-1 flex-col overflow-hidden">
            <div className="grid min-h-[300px] flex-1 place-items-center p-4 sm:min-h-[420px] sm:p-6">
              <div
                className="max-w-full origin-center transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                {comparing && originalUrl ? (
                  <img
                    src={originalUrl}
                    alt="Original image"
                    className="max-h-[52vh] w-auto max-w-full rounded-sm object-contain"
                  />
                ) : (
                  <canvas
                    ref={canvasRef}
                    aria-label="Result preview"
                    role="img"
                    className="max-h-[52vh] w-auto max-w-full rounded-sm object-contain"
                  />
                )}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface/95 p-1 shadow-panel backdrop-blur">
                <IconButton label="Zoom out" onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 3))}>
                  <ZoomOut size={16} />
                </IconButton>
                <span className="w-12 text-center font-display text-[12px] tabular-nums text-ink-soft">
                  {Math.round(zoom * 100)}%
                </span>
                <IconButton label="Zoom in" onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 3))}>
                  <ZoomIn size={16} />
                </IconButton>
                <span className="mx-0.5 h-5 w-px bg-line" />
                <IconButton label="Fit to screen" onClick={() => setZoom(1)}>
                  <Maximize2 size={15} />
                </IconButton>
              </div>
            </div>
          </div>

          {note && (
            <p role="alert" className="border-t border-line bg-[#FDF3F2] px-4 py-2.5 text-[13px] text-ink">
              {note}
            </p>
          )}

          {/* mobile: stacked controls under the preview */}
          <div className="lg:hidden">
            <div className="border-t border-line p-3">
              <Segmented
                label="Editor panel"
                value={tab}
                onChange={setTab}
                className="w-full"
                options={[
                  { value: 'background', label: 'Background' },
                  { value: 'adjust', label: 'Adjust' },
                  { value: 'download', label: 'Download' },
                ]}
              />
            </div>
            <div className="px-4 pb-5">
              {tab === 'background' && backgroundPanel}
              {tab === 'adjust' && adjustPanel}
              {tab === 'download' && downloadPanel}
            </div>
          </div>
        </div>

        {/* desktop side panel */}
        <aside className="hidden max-h-[640px] overflow-y-auto p-5 lg:block">
          <div className="grid gap-6">
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold">Background</h3>
              {backgroundPanel}
            </div>
            <div className="border-t border-line pt-5">
              <h3 className="mb-3 font-display text-sm font-semibold">Adjust</h3>
              {adjustPanel}
            </div>
            <div className="border-t border-line pt-5">
              <h3 className="mb-3 font-display text-sm font-semibold">Download</h3>
              {downloadPanel}
            </div>
          </div>
        </aside>
      </div>

      <RewardedAdGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onRewarded={onRewarded}
        rewardLabel={quality === 'hd' ? 'your HD download' : 'your download'}
      />
    </div>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-black/[.04] hover:text-ink"
    >
      {children}
    </button>
  )
}
