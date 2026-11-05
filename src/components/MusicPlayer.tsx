import { Music } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SpotifyController {
  play: () => void
  destroy: () => void
}

interface SpotifyIFrameApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: SpotifyController) => void,
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void
  }
}

let apiPromise: Promise<SpotifyIFrameApi> | undefined

/** Carrega a API oficial do player incorporado do Spotify uma única vez. */
function loadSpotifyApi() {
  apiPromise ??= new Promise<SpotifyIFrameApi>((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    script.onerror = () => {
      apiPromise = undefined
      reject(new Error('Falha ao carregar o player do Spotify'))
    }
    document.body.appendChild(script)
  })
  return apiPromise
}

interface MusicPlayerProps {
  trackId: string
  title: string
}

/**
 * Player do Spotify. Navegadores bloqueiam som automático, então a música
 * começa no primeiro toque/clique/tecla do convidado em qualquer lugar da página.
 * Até lá, o convidado também pode apertar play no próprio player.
 */
export function MusicPlayer({ trackId, title }: MusicPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const state: { cancelled: boolean; wantsPlay: boolean; started: boolean; controller?: SpotifyController } = {
      cancelled: false,
      wantsPlay: false,
      started: false,
    }

    // Primeira interação do convidado com a página: libera o som e dá o play.
    const events = ['pointerdown', 'keydown'] as const
    const stopListening = () => events.forEach((e) => window.removeEventListener(e, onFirstGesture))
    function onFirstGesture() {
      stopListening()
      state.wantsPlay = true
      if (state.controller && !state.started) {
        state.started = true
        state.controller.play()
      }
    }
    events.forEach((e) => window.addEventListener(e, onFirstGesture, { passive: true }))

    loadSpotifyApi()
      .then((api) => {
        if (state.cancelled) return
        // O Spotify troca o elemento pelo iframe; usamos um filho próprio para não confundir o React.
        const target = document.createElement('div')
        host.replaceChildren(target)
        api.createController(
          target,
          { uri: `spotify:track:${trackId}`, width: '100%', height: 80 },
          (created) => {
            if (state.cancelled) {
              created.destroy()
              return
            }
            state.controller = created
            if (state.wantsPlay && !state.started) {
              state.started = true
              created.play()
            }
          },
        )
      })
      .catch(() => {
        if (!state.cancelled) setFallback(true)
      })

    return () => {
      state.cancelled = true
      stopListening()
      state.controller?.destroy()
      host.replaceChildren()
    }
  }, [trackId])

  return (
    <div className="mx-auto mt-7 w-full max-w-md text-left">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-muted uppercase">
        <Music className="size-3.5" aria-hidden />
        Música da festa
      </p>
      <div ref={hostRef} className="min-h-20 overflow-hidden rounded-2xl">
        {fallback && (
          <iframe
            title={`Spotify: ${title}`}
            src={`https://open.spotify.com/embed/track/${trackId}`}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block rounded-2xl border-0"
          />
        )}
      </div>
    </div>
  )
}
