/**
 * Dados do evento. Troque os valores abaixo para personalizar o convite.
 */
export const eventConfig = {
  /** Nome de quem faz aniversário */
  honoree: 'Monica',
  /** Frase de destaque abaixo do título */
  tagline: 'Venha celebrar comigo esse dia especial!',
  /**
   * Data e hora de início, com fuso de Brasília (-03:00).
   * Formato: AAAA-MM-DDTHH:mm:ss-03:00
   */
  startsAt: '2026-12-05T21:00:00-03:00',
  /** Fuso usado para exibir data e hora, independente de onde o convidado está */
  timeZone: 'America/Sao_Paulo',
  /** Endereço completo (também usado no mapa e nos links do Google Maps) */
  address: 'R. Sete, 64 - Cenaculo, Belo Horizonte - MG, 31615-212',

  /** Aviso em destaque acima do botão "Confirmar presença" */
  houseRule: {
    title: 'Convidado não convida!',
    text: 'Não é permitido convidar pessoas de fora.',
  },

  /** Bloco "Informações adicionais" (um item por linha) */
  additionalInfo: [
    { emoji: '🎭', text: '', highlight: 'O uso de fantasia é obrigatório!' },
    {
      emoji: '👗',
      text: 'Festa a Fantasia!',
      /** Trecho opcional, exibido com destaque */
      highlight: 'Não serão permitidas fantasias de times de futebol.',
    },
    { emoji: '🚗', text: 'Estacionamento: Você vai beber, venha de aplicativo.' },
    { emoji: '⏰', text: 'Horário de início e encerramento: 21hrs às 3hrs.' },
    { emoji: '✅', text: 'Confirmação de presença até: Até dia 30 de novembro.' },
  ],

  /** Bloco "Dicas para presentear" */
  giftTips: [
    { label: 'Roupa', value: 'Blusa G' },
    { label: 'Calçado', value: '39' },
    { label: 'Gosta de', value: 'Cremes para o corpo, Rosto, Joias e PIX.' },
  ],

  /** Pix para quem preferir contribuir em vez de comprar um presente */
  pix: {
    /** Chave (CPF), somente dígitos */
    key: '03231617669',
    displayKey: '032.316.176-69',
    /** Nome e cidade que aparecem no app do banco ao ler o QR Code */
    receiverName: 'Monica',
    city: 'Belo Horizonte',
  },

  /** Música (Spotify): o id é o trecho final do link da faixa. Faixa atual: "APT." */
  music: {
    spotifyTrackId: '5vNRhkKd0yEAg8suGBpjeY',
    title: 'APT.',
  },

  /** Máximo de pessoas por confirmação (convidado + acompanhantes) */
  maxGuestsPerRsvp: 4,
  /** Tamanho máximo do recado */
  maxMessageLength: 500,
}

export type EventConfig = typeof eventConfig
