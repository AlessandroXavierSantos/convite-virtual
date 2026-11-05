/**
 * Gera o "Pix copia e cola" (BR Code estático) do Banco Central, usado também no QR Code.
 * Sem valor definido: quem paga digita quanto quer enviar.
 */

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido pelo padrão. */
export function crc16(payload: string) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Remove acentos e caracteres fora do padrão aceito pelos apps de banco. */
function clean(text: string, max: number) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, max)
}

interface PixInput {
  key: string
  receiverName: string
  city: string
}

export function buildPixPayload({ key, receiverName, city }: PixInput) {
  const body =
    field('00', '01') +
    field('01', '11') + // 11 = QR estático, pode ser usado várias vezes
    field('26', field('00', 'br.gov.bcb.pix') + field('01', key)) +
    field('52', '0000') +
    field('53', '986') + // BRL
    field('58', 'BR') +
    field('59', clean(receiverName, 25)) +
    field('60', clean(city, 15)) +
    field('62', field('05', '***')) +
    '6304'
  return body + crc16(body)
}
