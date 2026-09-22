/**
 * Rewarded ad layer.
 *
 * ClearCut is free because a user watches one short rewarded ad before the HD
 * download unlocks. Everything ad-related lives behind `showRewardedAd()` so
 * the editor never needs to know which network is in use.
 *
 * Rules this file enforces:
 *  - The reward is granted only by the network's own completion callback.
 *  - `DEMO_AD_MODE` (VITE_DEMO_AD_MODE) simulates completion for LOCAL
 *    DEVELOPMENT ONLY and refuses to run on a production build.
 *  - No interstitial hijacking, no auto-clicking, no redirects, no pop-unders.
 *    Every ad is opened by a direct user click on "Watch ad & download".
 */

export type AdProvider = 'demo' | 'admanager' | 'adsense' | 'custom'

export type AdErrorCode =
  | 'skipped' // closed before the reward threshold
  | 'blocked' // ad blocker or network request failed
  | 'unavailable' // no fill, or no provider configured
  | 'failed' // unexpected error inside the SDK

export class AdError extends Error {
  code: AdErrorCode
  constructor(code: AdErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AdError'
  }
}

export const AD_MESSAGES: Record<AdErrorCode, string> = {
  skipped: 'The ad closed before it finished, so the download stayed locked. Watch it through to unlock.',
  blocked: 'An ad blocker stopped the ad from loading. Pause it for this site, then try again.',
  unavailable: 'No ad is available right now. Try again in a moment.',
  failed: 'The ad could not be played. Try again.',
}

export const adConfig = {
  provider: (import.meta.env.VITE_AD_PROVIDER ?? 'demo') as AdProvider,
  clientId: import.meta.env.VITE_AD_CLIENT_ID ?? '',
  rewardedSlot: import.meta.env.VITE_AD_REWARDED_SLOT ?? '',
  bannerSlot: import.meta.env.VITE_AD_BANNER_SLOT ?? '',
  /** Simulated rewards are permitted in dev builds only. */
  demoMode: import.meta.env.VITE_DEMO_AD_MODE === 'true' && import.meta.env.DEV,
}

/** True when a real network is wired up and can be asked for an ad. */
export const adProviderReady =
  adConfig.demoMode ||
  (adConfig.provider !== 'demo' && Boolean(adConfig.clientId && adConfig.rewardedSlot))

type ShowOptions = {
  /** 0–100, for the modal's progress bar. */
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

/**
 * Resolves only when the network confirms the reward. Rejects with an AdError
 * in every other case — the caller must keep the download locked on rejection.
 */
export async function showRewardedAd(opts: ShowOptions = {}): Promise<void> {
  if (adConfig.demoMode) return runDemoAd(opts)

  switch (adConfig.provider) {
    case 'admanager':
      return runAdManagerRewarded(opts)
    case 'adsense':
      return runAdSenseRewarded(opts)
    case 'custom':
      return runCustomRewarded(opts)
    default:
      throw new AdError(
        'unavailable',
        'No rewarded ad provider is configured. Set VITE_AD_PROVIDER and the matching slot IDs.',
      )
  }
}

/* -------------------------------------------------------------------------- */
/* Demo — local development only                                              */
/* -------------------------------------------------------------------------- */

const DEMO_DURATION = 5000

function runDemoAd({ onProgress, signal }: ShowOptions) {
  return new Promise<void>((resolve, reject) => {
    if (!import.meta.env.DEV) {
      reject(new AdError('unavailable', 'Demo ad mode is disabled in production builds.'))
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = () => {
      if (signal?.aborted) {
        cancelAnimationFrame(raf)
        reject(new AdError('skipped', AD_MESSAGES.skipped))
        return
      }
      const percent = Math.min(100, ((performance.now() - start) / DEMO_DURATION) * 100)
      onProgress?.(percent)
      if (percent >= 100) {
        resolve()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  })
}

/* -------------------------------------------------------------------------- */
/* Google Ad Manager — rewarded ads via GPT                                   */
/* -------------------------------------------------------------------------- */

/**
 * CONNECT GOOGLE AD MANAGER HERE.
 *
 * 1. Create a rewarded ad unit in Ad Manager and copy its ad unit path into
 *    VITE_AD_REWARDED_SLOT, e.g. `/1234567/clearcut_rewarded`.
 * 2. Add the GPT library to index.html:
 *      <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
 * 3. The flow below is GPT's documented rewarded sequence:
 *      defineOutOfPageSlot(REWARDED) -> rewardedSlotReady -> makeRewardedVisible()
 *      -> rewardedSlotGranted (reward) | rewardedSlotClosed (no reward)
 *    See: developers.google.com/publisher-tag/samples/display-rewarded-ad
 *
 * Nothing here fakes a reward: the promise resolves only inside
 * `rewardedSlotGranted`.
 */
async function runAdManagerRewarded({ onProgress, signal }: ShowOptions) {
  const googletag = (window as any).googletag
  if (!googletag || !googletag.apiReady) {
    throw new AdError('blocked', AD_MESSAGES.blocked)
  }

  onProgress?.(8)

  await new Promise<void>((resolve, reject) => {
    googletag.cmd.push(() => {
      try {
        const slot = googletag
          .defineOutOfPageSlot(adConfig.rewardedSlot, googletag.enums.OutOfPageFormat.REWARDED)
          ?.addService(googletag.pubads())

        if (!slot) {
          reject(new AdError('unavailable', AD_MESSAGES.unavailable))
          return
        }

        let granted = false
        const pubads = googletag.pubads()

        const cleanup = () => {
          pubads.removeEventListener('rewardedSlotReady', onReady)
          pubads.removeEventListener('rewardedSlotGranted', onGranted)
          pubads.removeEventListener('rewardedSlotClosed', onClosed)
          pubads.removeEventListener('slotRenderEnded', onRenderEnded)
          googletag.destroySlots([slot])
        }

        const onReady = (event: any) => {
          if (event.slot !== slot) return
          onProgress?.(25)
          // Must be triggered from the user's click, which is where we already are.
          event.makeRewardedVisible()
        }
        const onGranted = (event: any) => {
          if (event.slot !== slot) return
          granted = true
          onProgress?.(100)
          cleanup()
          resolve()
        }
        const onClosed = (event: any) => {
          if (event.slot !== slot) return
          cleanup()
          if (!granted) reject(new AdError('skipped', AD_MESSAGES.skipped))
        }
        const onRenderEnded = (event: any) => {
          if (event.slot === slot && event.isEmpty) {
            cleanup()
            reject(new AdError('unavailable', AD_MESSAGES.unavailable))
          }
        }

        pubads.addEventListener('rewardedSlotReady', onReady)
        pubads.addEventListener('rewardedSlotGranted', onGranted)
        pubads.addEventListener('rewardedSlotClosed', onClosed)
        pubads.addEventListener('slotRenderEnded', onRenderEnded)

        signal?.addEventListener('abort', () => {
          cleanup()
          reject(new AdError('skipped', AD_MESSAGES.skipped))
        })

        googletag.enableServices()
        googletag.display(slot)

        window.setTimeout(() => {
          if (!granted) {
            cleanup()
            reject(new AdError('unavailable', AD_MESSAGES.unavailable))
          }
        }, 20000)
      } catch {
        reject(new AdError('failed', AD_MESSAGES.failed))
      }
    })
  })
}

/* -------------------------------------------------------------------------- */
/* Google AdSense                                                             */
/* -------------------------------------------------------------------------- */

/**
 * CONNECT ADSENSE HERE.
 *
 * AdSense serves rewarded formats through "AdSense for Games / H5" rather than
 * the standard display tag. Once your account is approved for it:
 *  1. Put your publisher ID in VITE_AD_CLIENT_ID (`ca-pub-…`) and the rewarded
 *     placement in VITE_AD_REWARDED_SLOT.
 *  2. Load the SDK in index.html.
 *  3. Call `adBreak({ type: 'reward', beforeReward, adViewed, adDismissed })`
 *     below and resolve the promise inside `adViewed` only.
 *
 * Until that is in place this throws `unavailable`, which the UI shows as an
 * honest "no ad available" message. Standard display AdSense cannot grant a
 * verified reward, so it is deliberately not used as a stand-in.
 */
async function runAdSenseRewarded({ onProgress, signal }: ShowOptions) {
  const adBreak = (window as any).adBreak ?? (window as any).adConfig
  if (typeof adBreak !== 'function') {
    throw new AdError('unavailable', AD_MESSAGES.unavailable)
  }

  onProgress?.(10)

  await new Promise<void>((resolve, reject) => {
    signal?.addEventListener('abort', () => reject(new AdError('skipped', AD_MESSAGES.skipped)))
    try {
      adBreak({
        type: 'reward',
        name: 'clearcut-hd-download',
        beforeReward: (showAdFn: () => void) => {
          onProgress?.(30)
          showAdFn()
        },
        adViewed: () => {
          onProgress?.(100)
          resolve()
        },
        adDismissed: () => reject(new AdError('skipped', AD_MESSAGES.skipped)),
        adBreakDone: (placementInfo: { breakStatus?: string }) => {
          if (placementInfo?.breakStatus && placementInfo.breakStatus !== 'viewed') {
            reject(new AdError('unavailable', AD_MESSAGES.unavailable))
          }
        },
      })
    } catch {
      reject(new AdError('failed', AD_MESSAGES.failed))
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Any other compliant network                                                */
/* -------------------------------------------------------------------------- */

/**
 * CONNECT ANOTHER NETWORK HERE (Unity, AppLovin, ironSource, a house SDK…).
 *
 * Expose one global from the network's script:
 *
 *   window.clearcutRewardedAd = {
 *     show: ({ onProgress }) => Promise<void>   // resolve ONLY on verified reward
 *   }
 *
 * Reject with `new AdError('skipped' | 'unavailable' | 'failed', message)` for
 * anything else. Never resolve on a timer.
 */
async function runCustomRewarded({ onProgress, signal }: ShowOptions) {
  const custom = (window as any).clearcutRewardedAd
  if (!custom || typeof custom.show !== 'function') {
    throw new AdError('unavailable', AD_MESSAGES.unavailable)
  }
  try {
    await custom.show({ onProgress, signal })
  } catch (err) {
    if (err instanceof AdError) throw err
    throw new AdError('failed', AD_MESSAGES.failed)
  }
}
