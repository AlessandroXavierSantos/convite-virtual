import { Drama } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface IntroProps {
  honoree: string
  dateText: string
  timeText: string
  onDone: () => void
}

/** Tempo até começar a sumir (a animação do envelope dura ~2,6 s) e duração do sumiço. */
const REVEAL_MS = 4200
const FADE_MS = 700

/**
 * Tela de abertura em forma de envelope. O toque no lacre abre o envelope, revela
 * o convite e (por ser o primeiro toque do convidado) libera o som da música.
 */
export function Intro({ honoree, dateText, timeText, onDone }: IntroProps) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'leaving'>('closed')
  const timers = useRef<number[]>([])
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Trava a rolagem da página enquanto a abertura está na tela.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const pending = timers.current
    return () => {
      document.body.style.overflow = previous
      pending.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  function leave() {
    timers.current.forEach((t) => window.clearTimeout(t))
    setPhase('leaving')
    timers.current = [window.setTimeout(() => onDoneRef.current(), FADE_MS)]
  }

  function open() {
    if (phase !== 'closed') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      leave()
      return
    }
    setPhase('opening')
    timers.current = [window.setTimeout(leave, REVEAL_MS)]
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Abertura do convite"
      // Tocar em qualquer lugar durante a animação pula direto para o convite.
      onClick={() => phase === 'opening' && leave()}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center gap-8 overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,#7d2433_0%,#4b1521_55%,#2a0b12_100%)] px-4 transition-opacity duration-700 ${
        phase === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Brilhos dourados de fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 size-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -right-16 bottom-10 size-80 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <p
        className={`relative text-xs font-semibold tracking-[0.35em] text-gold-light uppercase transition-opacity duration-500 ${
          phase === 'closed' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Você recebeu um convite
      </p>

      <div
        data-open={phase !== 'closed'}
        className="envelope relative aspect-[4/3] w-[min(88vw,380px)] [container-type:inline-size] [perspective:900px]"
      >
        {/* Fundo do envelope */}
        <div className="env-back absolute inset-0 rounded-xl bg-[#ead7c1] shadow-2xl shadow-black/50" />

        {/* O convite, guardado dentro do envelope */}
        <div className="env-card absolute inset-x-[3cqw] top-[3cqw] bottom-[3cqw] z-10 flex flex-col items-center justify-center rounded-md bg-[#fffaf3] text-center shadow-md">
          <div aria-hidden className="pointer-events-none absolute inset-[1.6cqw] rounded-sm border border-gold/70" />
          <div aria-hidden className="pointer-events-none absolute inset-[2.6cqw] rounded-sm border border-gold/35" />
          <Drama aria-hidden className="size-[6.5cqw] text-gold" />
          <p className="mt-[2cqw] text-[2.5cqw] font-semibold tracking-[0.25em] text-brand-600 uppercase">
            Você está convidado(a)
          </p>
          <p className="mt-[2.5cqw] font-display text-[8.5cqw] leading-[1.05] font-semibold text-ink">
            Festa a fantasia
            <br />
            da <span className="text-brand-600">{honoree}</span>
          </p>
          <span aria-hidden className="my-[3cqw] block h-px w-[14cqw] bg-gold" />
          <p className="text-[3.2cqw] leading-snug font-medium text-ink/80">{dateText}</p>
          <p className="text-[3.2cqw] leading-snug font-medium text-ink/80">{timeText}</p>
        </div>

        {/* Frente do envelope (laterais e parte de baixo) */}
        <div className="env-pocket absolute inset-0 z-20 rounded-xl bg-[linear-gradient(160deg,#f6e8d6,#ecd6bd)] [clip-path:polygon(0_0,50%_50%,100%_0,100%_100%,0_100%)]" />
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="env-pocket pointer-events-none absolute inset-0 z-[25] size-full"
        >
          <path
            d="M0 0 L50 50 L100 0 M0 100 L50 50 L100 100"
            fill="none"
            stroke="rgba(120, 80, 40, 0.28)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Aba de cima: gira para abrir */}
        <div className="env-flap absolute inset-x-0 top-0 z-30 h-1/2 origin-top rounded-t-xl bg-[linear-gradient(#e7cfb4,#d9bb9b)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />

        {/* Lacre dourado: é o botão que abre o convite */}
        <button
          type="button"
          onClick={open}
          autoFocus
          aria-label="Abrir convite"
          className="env-seal absolute top-1/2 left-1/2 z-50 grid size-[19cqw] -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f5dc9c,#c9a24f_55%,#8f6a22)] text-[#4a3208] shadow-lg shadow-black/40 ring-2 ring-gold-light/60 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none"
        >
          {phase === 'closed' && (
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-gold-light/70" />
          )}
          <Drama aria-hidden className="relative size-[9cqw]" />
        </button>
      </div>

      <p
        className={`relative text-sm text-white/70 transition-opacity duration-300 ${
          phase === 'closed' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Toque no lacre dourado para abrir
      </p>
    </div>
  )
}
