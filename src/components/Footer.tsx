import { Logo } from './Logo'
export function Footer() {
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
          <a href="/privacy" className="flex min-h-11 items-center text-[13px] text-ink-soft hover:text-ink">
            Privacy policy
          </a>
          <a href="/terms" className="flex min-h-11 items-center text-[13px] text-ink-soft hover:text-ink">
            Terms of use
          </a>
          <a href="/contact" className="flex min-h-11 items-center text-[13px] text-ink-soft hover:text-ink">Contact</a>
          <span className="text-[13px] text-ink-faint">© {new Date().getFullYear()} ClearCut</span>
        </nav>
      </div>
    </footer>
  )
}
