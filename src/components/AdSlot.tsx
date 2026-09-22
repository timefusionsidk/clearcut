import { useEffect, useState } from 'react'
import { adConfig, mountDisplayAd } from '@/lib/ads'

/**
 * Non-intrusive display banner. Sits between content sections, never over the
 * editor controls, and keeps a fixed height so nothing shifts when it fills.
 *
 * CONNECT A DISPLAY UNIT HERE: replace the inner div with your network's tag
 * (AdSense <ins class="adsbygoogle">, or a GPT slot div) using
 * VITE_AD_BANNER_SLOT. Leave the wrapper and height as they are.
 */
export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    void mountDisplayAd('clearcut-banner-slot').then(setConfigured)
  }, [])

  return (
    <aside aria-label={label} className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div id="clearcut-banner-slot" className="flex h-[92px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-surface/60">
        {!configured && (
          <p className="px-4 text-center text-[12px] text-ink-faint">
            {adConfig.provider === 'admanager'
              ? 'Advertisement unavailable right now.'
              : 'ClearCut is free and processes images on your device.'}
          </p>
        )}
      </div>
    </aside>
  )
}
