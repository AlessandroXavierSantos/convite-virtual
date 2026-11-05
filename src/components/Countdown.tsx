import { useEffect, useState } from 'react'

interface CountdownProps {
  /** Data/hora do evento (ISO com fuso). */
  target: string
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

/** Contagem regressiva até o início da festa. */
export function Countdown({ target }: CountdownProps) {
  const targetMs = new Date(target).getTime()
  const [now, setNow] = useState(() => Date.now())

  const remaining = targetMs - now
  const finished = remaining <= 0

  useEffect(() => {
    if (finished) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [finished])

  if (finished) {
    return (
      <p className="rounded-2xl border border-brand-200/60 bg-white/70 px-5 py-4 text-center font-display text-xl font-semibold text-brand-600">
        A festa começou! 🎉
      </p>
    )
  }

  const { days, hours, minutes, seconds } = split(remaining)
  const units = [
    { label: 'Dias', value: days },
    { label: 'Horas', value: hours },
    { label: 'Min', value: minutes },
    { label: 'Seg', value: seconds },
  ]

  return (
    <div>
      <p className="mb-3 text-sm font-semibold tracking-wider text-muted uppercase">Faltam</p>
      {/* Leitor de tela lê só o total de dias, para não anunciar a cada segundo */}
      <p className="sr-only">
        Faltam {days} {days === 1 ? 'dia' : 'dias'} para a festa.
      </p>
      <ul aria-hidden className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {units.map((unit) => (
          <li
            key={unit.label}
            className="rounded-2xl border border-brand-200/60 bg-white/80 px-1 py-3.5 shadow-xs backdrop-blur sm:py-4"
          >
            <span className="block font-display text-3xl leading-none font-semibold text-brand-600 tabular-nums sm:text-4xl">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="mt-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
              {unit.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
