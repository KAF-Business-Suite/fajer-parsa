// Adapted from Tailark's MIT-licensed dusk header, commit 8139698115c1341bfd2e3e286c04bb4d8146f472.
import { X } from 'lucide-react'

export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button type="button" data-state={open ? 'active' : 'closed'} onClick={onToggle}
      aria-label="منوی موبایل" aria-expanded={open} aria-controls="mobile-navigation"
      className="fp-menu-toggle relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--fp-line)] bg-[var(--fp-surface)] lg:hidden">
      <span aria-hidden="true" className="fp-menu-bars flex w-[18px] flex-col items-center justify-center gap-[6px] transition duration-200">
        <span className="h-0.5 w-full rounded-full bg-current" />
        <span className="h-0.5 w-full rounded-full bg-current" />
      </span>
      <X aria-hidden="true" size={21} className="fp-menu-close absolute inset-0 m-auto transition duration-200" />
    </button>
  )
}
