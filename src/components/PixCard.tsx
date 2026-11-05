import { Check, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildPixPayload } from '../lib/pix'

interface PixCardProps {
  /** Chave Pix, só com os dígitos (CPF). */
  pixKey: string
  /** Chave como deve aparecer na tela. */
  displayKey: string
  receiverName: string
  city: string
}

/** Mensagem "prefere mandar um Pix?" com QR Code e botão para copiar a chave. */
export function PixCard({ pixKey, displayKey, receiverName, city }: PixCardProps) {
  const payload = useMemo(() => buildPixPayload({ key: pixKey, receiverName, city }), [pixKey, receiverName, city])
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(pixKey)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Sem permissão de área de transferência: a chave continua visível para copiar à mão.
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-sand-300 bg-white/60 p-4 sm:p-5">
      <p className="text-[15px] leading-relaxed text-ink/85">
        <strong className="font-bold text-ink">Prefere mandar um Pix?</strong> Se em vez de comprar um presente você quiser
        contribuir por Pix, fica à vontade! Basta apontar a câmera do banco para o QR Code ou copiar a chave.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="shrink-0 rounded-xl bg-white p-3 shadow-xs ring-1 ring-sand-300">
          <QRCodeSVG
            value={payload}
            size={168}
            level="M"
            marginSize={1}
            title={`QR Code do Pix de ${receiverName}`}
            className="block size-40 sm:size-[168px]"
          />
        </div>

        <div className="w-full min-w-0 text-center sm:text-left">
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Chave Pix (CPF)</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-ink">{displayKey}</p>
          <button
            type="button"
            onClick={copyKey}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sand-300 bg-white/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25"
          >
            {copied ? <Check className="size-4 text-green-700" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? 'Chave copiada!' : 'Copiar chave Pix'}
          </button>
          <span role="status" className="sr-only">
            {copied ? 'Chave Pix copiada' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
