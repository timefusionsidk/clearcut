import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, PlayCircle, ShieldCheck } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { AD_MESSAGES, AdError, adConfig, adProviderReady, showRewardedAd } from '@/lib/ads'

type Props = {
  open: boolean
  onClose: () => void
  /**
   * Called once, and only once, after the ad network confirms the reward.
   * Everything the reward unlocks must happen inside this callback.
   */
  onRewarded: () => void | Promise<void>
  /** What the reward unlocks, shown in the modal. */
  rewardLabel?: string
}

type Phase = 'prompt' | 'playing' | 'granting' | 'error'

/**
 * The single place where "has this user earned a download?" is answered.
 * Any feature that needs to be ad-gated should render this component rather
 * than calling the ad SDK directly.
 */
export function RewardedAdGate({ open, onClose, onRewarded, rewardLabel = 'your HD download' }: Props) {
  const [phase, setPhase] = useState<Phase>('prompt')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      setPhase('prompt')
      setProgress(0)
      setMessage('')
    } else {
      abort.current?.abort()
      abort.current = null
    }
  }, [open])

  const watch = useCallback(async () => {
    setPhase('playing')
    setProgress(0)
    setMessage('')
    const controller = new AbortController()
    abort.current = controller

    try {
      await showRewardedAd({
        onProgress: setProgress,
        signal: controller.signal,
      })
      // Reward confirmed by the network — and only now.
      setPhase('granting')
      await onRewarded()
      onClose()
    } catch (err) {
      const code = err instanceof AdError ? err.code : 'failed'
      setMessage(err instanceof AdError ? err.message : AD_MESSAGES.failed)
      setPhase('error')
      if (import.meta.env.DEV) console.warn('[ads] rewarded ad not granted:', code)
    } finally {
      abort.current = null
    }
  }, [onClose, onRewarded])

  const playing = phase === 'playing' || phase === 'granting'

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!playing}
      title={playing ? 'Playing your ad' : 'Watch a short ad to download'}
      description={
        playing
          ? 'Keep this open until the ad finishes. Closing early cancels the download.'
          : 'A short ad helps keep ClearCut free for everyone.'
      }
    >
      {phase === 'prompt' && (
        <>
          <div className="mt-1 rounded-xl border border-line bg-paper px-4 py-3.5">
            <p className="inline-flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" />
              One ad unlocks {rewardLabel} at full quality. No account, no payment, no watermark.
            </p>
          </div>

          {!adProviderReady && (
            <p className="mt-3 rounded-xl border border-danger/25 bg-[#FDF3F2] px-4 py-3 text-[13px] text-ink">
              No rewarded ad provider is configured, so downloads stay locked. Set
              <code className="mx-1 rounded bg-white px-1 py-0.5 font-mono text-[12px]">VITE_AD_PROVIDER</code>
              and its slot IDs, or turn on
              <code className="mx-1 rounded bg-white px-1 py-0.5 font-mono text-[12px]">VITE_DEMO_AD_MODE</code>
              in local development.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <Button size="lg" className="flex-1" onClick={watch} disabled={!adProviderReady}>
              <PlayCircle size={17} />
              Watch ad &amp; download
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {adConfig.demoMode && (
            <p className="mt-3 text-center text-[12px] text-ink-faint">
              Demo ad mode is on — this simulates a completed ad for local testing only.
            </p>
          )}
        </>
      )}

      {playing && (
        <div className="mt-1">
          {/* The network renders its own ad surface over the page. This panel
              only reports progress and blocks the download until it completes. */}
          <div
            id="clearcut-rewarded-slot"
            className="grid h-36 place-items-center rounded-xl border border-line bg-paper text-[13px] text-ink-soft"
          >
            {phase === 'granting' ? 'Reward confirmed — preparing your file…' : 'Ad is playing…'}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-200"
              style={{ width: `${phase === 'granting' ? 100 : progress}%` }}
            />
          </div>
          <p aria-live="polite" className="mt-2 text-center text-[13px] tabular-nums text-ink-soft">
            {Math.round(phase === 'granting' ? 100 : progress)}% complete
          </p>
        </div>
      )}

      {phase === 'error' && (
        <>
          <div className="mt-1 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-[#FDF3F2] px-4 py-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
            <p className="text-sm leading-relaxed text-ink">{message}</p>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <Button size="lg" className="flex-1" onClick={watch}>
              Try again
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={onClose}>
              Not now
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
