/**
 * iOS Safari does not reliably honour `a[download]` for in-memory blobs. Open
 * a blank tab while the download button still has a user gesture, then hand
 * the finished image to that tab so it can be saved with Share → Save Image.
 */
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function openMobileDownloadTarget() {
  return isIOS() ? window.open('about:blank', '_blank') : null
}

export function saveBlob(blob: Blob, filename: string, mobileTarget: Window | null = null) {
  const url = URL.createObjectURL(blob)
  if (mobileTarget) {
    mobileTarget.document.title = filename
    mobileTarget.location.replace(url)
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return
  }
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  // Must be in the document for Firefox and older WebKit to honour `download`.
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser a beat to start the transfer before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function buildFilename(format: 'png' | 'jpg', quality: 'standard' | 'hd') {
  return quality === 'hd' ? `clearcut-image-hd.${format}` : `clearcut-image.${format}`
}
