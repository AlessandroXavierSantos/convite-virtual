import { CalendarDays, Clock, MapPin, PartyPopper, UserCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { RsvpDialog } from './components/RsvpDialog'
import { eventConfig } from './config/event'

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface InfoItemProps {
  icon: ReactNode
  label: string
  value: string
  detail?: string
  className?: string
}

function InfoItem({ icon, label, value, detail, className = '' }: InfoItemProps) {
  return (
    <li className={`flex items-start gap-3.5 rounded-2xl ${className} border border-brand-200/60 bg-white/70 p-4 text-left shadow-xs backdrop-blur`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 font-semibold leading-snug text-ink">{value}</p>
        {detail && <p className="mt-0.5 text-sm leading-snug text-muted">{detail}</p>}
      </div>
    </li>
  )
}

export default function App() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const start = new Date(eventConfig.startsAt)
  const dateText = capitalize(
    new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(start),
  )
  const timeText = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
    .format(start)
    .replace(':', 'h')
  const deadlineText = eventConfig.rsvpDeadline
    ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(
        new Date(`${eventConfig.rsvpDeadline}T12:00`),
      )
    : null

  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Fundo decorativo suave */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-brand-200/60 blur-3xl" />
        <div className="absolute -right-24 -bottom-32 size-[30rem] rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-64 rounded-full bg-brand-300/20 blur-3xl" />
      </div>

      <main className="animate-rise-in w-full max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-600 backdrop-blur">
          <PartyPopper className="size-4" aria-hidden />
          Você está convidado(a)
        </span>

        <h1 className="mt-6 font-display text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-ink sm:text-6xl">
          {eventConfig.age !== null ? (
            <>
              <span className="text-brand-600">{eventConfig.age} anos</span> de
              <br />
              {eventConfig.honoree}
            </>
          ) : (
            <>
              Aniversário
              <br />
              <span className="text-brand-600">{eventConfig.honoree}</span>
            </>
          )}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">{eventConfig.tagline}</p>

        <ul className="mt-9 grid gap-3 sm:grid-cols-2">
          <InfoItem icon={<CalendarDays className="size-5" />} label="Data" value={dateText} />
          <InfoItem icon={<Clock className="size-5" />} label="Horário" value={timeText} />
          <InfoItem
            className="sm:col-span-2"
            icon={<MapPin className="size-5" />}
            label="Local"
            value={eventConfig.venueName}
            detail={eventConfig.venueAddress}
          />
        </ul>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="group mt-9 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand-600 px-9 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30 active:translate-y-0"
        >
          <UserCheck className="size-5 transition group-hover:scale-110" aria-hidden />
          Confirmar presença
        </button>

        {deadlineText && <p className="mt-4 text-sm text-muted">Por favor, confirme até {deadlineText}.</p>}
      </main>

      <RsvpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
