export interface RsvpPayload {
  attending: boolean
  name: string
  /** Total de pessoas, incluindo o convidado. Sempre 0 quando não vai. */
  guests: number
  email: string
  phone: string
  message: string
  /** Campo-armadilha: humanos não veem nem preenchem; robôs sim. */
  website: string
}

/**
 * Endereço do Google Apps Script (veja docs/google-planilhas.md).
 * Defina em `.env.local` (VITE_RSVP_ENDPOINT=...). Sem ele, o envio é só simulado.
 */
const ENDPOINT = (import.meta.env.VITE_RSVP_ENDPOINT as string | undefined)?.trim()

/** Verdadeiro quando as respostas realmente são gravadas na planilha. */
export const rsvpEnabled = Boolean(ENDPOINT)

/** Envia a confirmação de presença para a planilha. Lança erro se não for gravada. */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  if (!ENDPOINT) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    console.info('[RSVP simulado: configure VITE_RSVP_ENDPOINT para gravar de verdade]', payload)
    return
  }

  // "text/plain" evita o pré-voo de CORS, que o Google Apps Script não responde.
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Falha ao enviar (${response.status})`)

  const result = (await response.json()) as { ok?: boolean; error?: string }
  if (!result.ok) throw new Error(result.error ?? 'Falha ao enviar')
}
