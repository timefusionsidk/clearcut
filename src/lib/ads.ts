/** Optional, non-rewarded display advertising configuration. */
export const adConfig = {
  provider: import.meta.env.VITE_AD_PROVIDER ?? '',
  bannerSlot: import.meta.env.VITE_AD_BANNER_SLOT ?? '',
}

let gptPromise: Promise<void> | null = null

function loadGpt() {
  if (gptPromise) return gptPromise
  gptPromise = new Promise((resolve, reject) => {
    const existing = (window as any).googletag
    if (existing?.apiReady) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Ad script could not load.'))
    document.head.appendChild(script)
  })
  return gptPromise
}

/** Render an optional standard banner. It never unlocks, blocks, or redirects. */
export async function mountDisplayAd(elementId: string) {
  if (adConfig.provider !== 'admanager' || !adConfig.bannerSlot) return false
  try {
    await loadGpt()
    const googletag = (window as any).googletag
    await new Promise<void>((resolve) => {
      googletag.cmd.push(() => {
        const slot = googletag
          .defineSlot(adConfig.bannerSlot, [[320, 50], [728, 90], [970, 90]], elementId)
          ?.addService(googletag.pubads())
        if (!slot) return resolve()
        googletag.enableServices()
        googletag.display(elementId)
        resolve()
      })
    })
    return true
  } catch {
    return false
  }
}
