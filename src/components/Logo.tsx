export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect width="32" height="32" rx="9" fill="#4A22E0" />
        <path d="M8 8h8v8H8z" fill="#fff" fillOpacity=".32" />
        <path d="M16 16h8v8h-8z" fill="#fff" fillOpacity=".32" />
        <path
          d="M23 11.5 13.8 22 9 17.2"
          stroke="#fff"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[17px] font-bold tracking-[-0.03em]">ClearCut</span>
    </span>
  )
}
