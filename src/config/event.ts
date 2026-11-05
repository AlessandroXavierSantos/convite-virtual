/**
 * Dados do evento. Troque os valores abaixo para personalizar o convite.
 * (Textos de exemplo — substitua pelos dados reais da festa.)
 */
export const eventConfig = {
  /** Nome de quem faz aniversário */
  honoree: 'Nome do Aniversariante',
  /** Idade que está completando (use null para esconder) */
  age: 30 as number | null,
  /** Frase de destaque abaixo do título */
  tagline: 'Venha celebrar comigo esse dia especial!',
  /** Data e hora de início, no formato ISO local (AAAA-MM-DDTHH:mm) */
  startsAt: '2026-12-12T18:00',
  /** Local da festa */
  venueName: 'Nome do local',
  venueAddress: 'Rua Exemplo, 123 — Bairro, Cidade',
  /** Prazo para confirmar (AAAA-MM-DD). Use null para não exibir. */
  rsvpDeadline: '2026-12-05' as string | null,
  /** Máximo de pessoas por confirmação (convidado + acompanhantes) */
  maxGuestsPerRsvp: 10,
  /** Tamanho máximo do recado */
  maxMessageLength: 500,
}

export type EventConfig = typeof eventConfig
