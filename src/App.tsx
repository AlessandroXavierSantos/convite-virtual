import { CalendarDays, Clock, ExternalLink, Gift, MapPin, Navigation, PartyPopper, UserCheck, UserX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import landscapePhoto from './assets/monica-paisagem.webp'
import portraitPhoto from './assets/monica-retrato.webp'
import { Countdown } from './components/Countdown'
import { Intro } from './components/Intro'
import { MusicPlayer } from './components/MusicPlayer'
import { PixCard } from './components/PixCard'
import { RsvpDialog } from './components/RsvpDialog'
import { Section } from './components/Section'
import { eventConfig } from './config/event'

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface InfoItemProps {
  icon: ReactNode
  label: string
  value: string
  className?: string
}

function InfoItem({ icon, label, value, className = '' }: InfoItemProps) {
  return (
    <li
      className={`flex items-start gap-3.5 rounded-2xl border border-brand-200/60 bg-white/70 p-4 text-left shadow-xs backdrop-blur ${className}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</p>
        <p className="mt-0.5 leading-snug font-semibold text-ink">{value}</p>
      </div>
    </li>
  )
}

const linkButtonClass =
  'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sand-300 bg-white/60 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25'

export default function App() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  const start = new Date(eventConfig.startsAt)
  const tz = eventConfig.timeZone
  const dateText = capitalize(
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: tz,
    }).format(start),
  )
  const timeText = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: tz })
    .format(start)
    .replace(':', 'h')

  const query = encodeURIComponent(eventConfig.address)
  const mapEmbedUrl = `https://www.google.com/maps?q=${query}&output=embed&hl=pt-BR`
  const mapViewUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
  const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`

  return (
    <>
      {!introDone && (
        <Intro
          honoree={eventConfig.honoree}
          dateText={dateText}
          timeText={timeText}
          onDone={() => setIntroDone(true)}
        />
      )}
    <div inert={!introDone} className="relative isolate flex min-h-dvh flex-col items-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      {/* Fundo decorativo suave */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-brand-200/60 blur-3xl" />
        <div className="absolute -right-24 -bottom-32 size-[30rem] rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-64 rounded-full bg-brand-300/20 blur-3xl" />
      </div>

      <main className="animate-rise-in w-full max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-600 backdrop-blur">
          <PartyPopper className="size-4" aria-hidden />
          Você está convidado(a)
        </span>

        {/* Retrato no celular, paisagem em telas maiores */}
        <picture className="mt-6 block">
          <source media="(min-width: 640px)" srcSet={landscapePhoto} />
          <img
            src={portraitPhoto}
            alt={`${eventConfig.honoree} com máscara dourada de carnaval e um leque de plumas azul`}
            width={834}
            height={1025}
            className="aspect-[834/1025] w-full rounded-2xl object-cover shadow-xl shadow-brand-600/20 sm:aspect-[1535/1025]"
          />
        </picture>

        <h1 className="mt-8 font-display text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-ink sm:text-6xl">
          Festa a fantasia
          <br />
          da <span className="text-brand-600">{eventConfig.honoree}</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">{eventConfig.tagline}</p>

        <MusicPlayer trackId={eventConfig.music.spotifyTrackId} title={eventConfig.music.title} />

        <ul className="mt-9 grid gap-3 sm:grid-cols-2">
          <InfoItem icon={<CalendarDays className="size-5" />} label="Data" value={dateText} />
          <InfoItem icon={<Clock className="size-5" />} label="Horário" value={timeText} />
        </ul>

        <div className="mt-3">
          <Section title="Local do Evento" icon={<MapPin />}>
            <p className="text-[15px] leading-snug text-ink/80">{eventConfig.address}</p>
            <iframe
              title={`Mapa: ${eventConfig.address}`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="mt-4 h-64 w-full rounded-xl border border-sand-300 bg-white sm:h-72"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={mapViewUrl} target="_blank" rel="noopener noreferrer" className={linkButtonClass}>
                <ExternalLink className="size-4" aria-hidden />
                Ver no Google Maps
              </a>
              <a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer" className={linkButtonClass}>
                <Navigation className="size-4" aria-hidden />
                Como Chegar
              </a>
            </div>
          </Section>
        </div>

        <div className="mt-10">
          <Countdown target={eventConfig.startsAt} />
        </div>

        {/* Regra da festa em destaque, logo antes de o convidado confirmar */}
        <div
          role="note"
          className="mx-auto mt-10 flex max-w-md items-center gap-4 rounded-2xl border border-gold/60 bg-[#4b1521] px-5 py-4 text-left shadow-lg shadow-[#4b1521]/30"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-light">
            <UserX className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl leading-tight font-semibold text-white">{eventConfig.houseRule.title}</p>
            <p className="mt-1 text-sm leading-snug text-white/80">{eventConfig.houseRule.text}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="group mt-6 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand-600 px-9 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30 active:translate-y-0"
        >
          <UserCheck className="size-5 transition group-hover:scale-110" aria-hidden />
          Confirmar presença
        </button>

        <div className="mt-10 grid gap-3">
          <Section title="Informações Adicionais">
            <ul className="grid gap-2.5">
              {eventConfig.additionalInfo.map((item) => (
                <li key={item.text} className="flex gap-2.5 text-[15px] leading-snug text-ink/85">
                  <span aria-hidden className="shrink-0">
                    {item.emoji}
                  </span>
                  <span>
                    {item.text}
                    {item.highlight && (
                      <>
                        {item.text && ' '}
                        <mark className="rounded-md bg-brand-200/80 px-1.5 py-0.5 font-bold text-brand-700 box-decoration-clone">
                          {item.highlight}
                        </mark>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Dicas para presentear" icon={<Gift />}>
            <dl className="grid gap-2 text-[15px] leading-snug">
              {eventConfig.giftTips.map((tip) => (
                <div key={tip.label} className="flex flex-wrap gap-x-1.5">
                  <dt className="font-bold text-ink">{tip.label}:</dt>
                  <dd className="text-ink/85">{tip.value}</dd>
                </div>
              ))}
            </dl>

            <PixCard
              pixKey={eventConfig.pix.key}
              displayKey={eventConfig.pix.displayKey}
              receiverName={eventConfig.pix.receiverName}
              city={eventConfig.pix.city}
            />
          </Section>
        </div>
      </main>

      <RsvpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
    </>
  )
}
