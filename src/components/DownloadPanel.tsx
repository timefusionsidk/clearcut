import { Download, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Segmented } from './ui/Segmented'
import { cn } from '@/lib/utils'

export type DownloadFormat = 'png' | 'jpg'
export type DownloadQuality = 'standard' | 'hd'

type Props = {
  format: DownloadFormat
  quality: DownloadQuality
  onFormat: (format: DownloadFormat) => void
  onQuality: (quality: DownloadQuality) => void
  onDownload: () => void
  busy: boolean
  transparent: boolean
  hdAvailable: boolean
  dimensions: { standard: [number, number]; hd: [number, number] } | null
}

export function DownloadPanel({
  format,
  quality,
  onFormat,
  onQuality,
  onDownload,
  busy,
  transparent,
  hdAvailable,
  dimensions,
}: Props) {
  const size = dimensions?.[quality]

  return (
    <section aria-label="Download" className="grid gap-3">
      <Segmented
        label="File format"
        value={format}
        onChange={(value) => onFormat(value)}
        className="w-full"
        options={[
          { value: 'png', label: 'PNG' },
          { value: 'jpg', label: 'JPG' },
        ]}
      />

      <Segmented
        label="Resolution"
        value={quality}
        onChange={(value) => onQuality(value)}
        className="w-full"
        options={[
          { value: 'standard', label: 'Standard' },
          { value: 'hd', label: hdAvailable ? 'HD' : 'HD (max)' },
        ]}
      />

      <p className="text-[12px] leading-relaxed text-ink-faint">
        {format === 'png'
          ? transparent
            ? 'PNG keeps the transparent background.'
            : 'PNG keeps your chosen background, lossless.'
          : 'JPG is smaller and flattens transparency to white.'}
        {size ? ` Output: ${size[0]} × ${size[1]} px.` : ''}
      </p>

      <Button size="lg" className="w-full" onClick={onDownload} disabled={busy}>
        {busy ? 'Preparing file…' : (
          <>
            <Download size={17} />
            Download {quality === 'hd' ? 'HD' : 'image'}
          </>
        )}
      </Button>

      <p
        className={cn(
          'inline-flex items-start gap-1.5 text-[12px] leading-relaxed',
          'text-ink-soft',
        )}
      >
        <Sparkles size={13} className="mt-0.5 shrink-0" />
        Your edited image is created and downloaded on this device.
      </p>
    </section>
  )
}
