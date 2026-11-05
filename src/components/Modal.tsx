import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Diálogo acessível: fecha com Esc ou clique no fundo, trava o scroll e prende o foco. */
export function Modal({ open, onClose, labelledBy, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Foca o primeiro campo do formulário (ou o painel) ao abrir.
    const panel = panelRef.current
    const firstField = panel?.querySelector<HTMLElement>('input, textarea, select')
    ;(firstField ?? panel)?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="animate-pop-in flex max-h-[100dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
      >
        {children}
      </div>
    </div>
  )
}
