export interface RsvpPayload {
  attending: boolean
  name: string
  /** Total de pessoas, incluindo o convidado. Sempre 0 quando não vai. */
  guests: number
  email: string
  phone: string
  message: string
}

/**
 * Envia a confirmação de presença.
 *
 * Por enquanto o envio é SIMULADO (não há backend): a resposta é apenas
 * registrada no console. Quando o destino das respostas for definido
 * (API própria, Supabase, Google Sheets etc.), basta trocar o corpo desta função.
 */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 900))
  console.info('[RSVP simulado]', payload)
}
