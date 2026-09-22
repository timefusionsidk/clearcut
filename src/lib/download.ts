/**
 * Triggers a real file download from an in-memory blob. Works on desktop and
 * on iOS/Android Chrome and Safari; nothing is uploaded to produce the file.
 */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  // Must be in the document for Firefox and older WebKit to honour `download`.
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser a beat to start the transfer before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function buildFilename(format: 'png' | 'jpg', quality: 'standard' | 'hd') {
  return quality === 'hd' ? `clearcut-image-hd.${format}` : `clearcut-image.${format}`
}
