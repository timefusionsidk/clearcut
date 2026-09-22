import { Logo } from './Logo'
import type { LegalDoc } from './Legal'

export function Footer({ onOpenLegal }: { onOpenLegal: (doc: LegalDoc) => void }) {
  return (
    <footer
      className="border-t border-line bg-surface"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            Free AI background removal. No account, no stored images.
          </p>
        </div>
        <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="min-h-11 text-[13px] text-ink-soft hover:text-ink"
          >
            Privacy policy
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="min-h-11 text-[13px] text-ink-soft hover:text-ink"
          >
            Terms of use
          </button>
          <span className="text-[13px] text-ink-faint">© {new Date().getFullYear()} ClearCut</span>
        </nav>
      </div>
    </footer>
  )
}
