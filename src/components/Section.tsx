import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  icon?: ReactNode
  /** Começa aberta? Padrão: sim. */
  defaultOpen?: boolean
  children: ReactNode
}

/** Cartão recolhível (acordeão) usado nos blocos de informação do convite. */
export function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const uid = useId()

  return (
    <section className="rounded-2xl border border-sand-300 bg-sand-100 text-left shadow-xs">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left font-bold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25 sm:px-5"
        >
          <span className="flex items-center gap-2.5">
            {icon && <span className="text-ink [&>svg]:size-[1.1rem]">{icon}</span>}
            {title}
          </span>
          <ChevronDown
            aria-hidden
            className={`size-5 shrink-0 text-ink transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>

      {/* grid-rows anima a altura de 0 até o conteúdo sem precisar medir */}
      <div
        id={`${uid}-panel`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
        </div>
      </div>
    </section>
  )
}
