import { CheckCircle2, HeartHandshake, UserCheck, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { eventConfig } from '../config/event'
import { submitRsvp } from '../services/rsvp'
import { Modal } from './Modal'

interface RsvpDialogProps {
  open: boolean
  onClose: () => void
}

interface FormState {
  attending: boolean
  name: string
  guests: string
  email: string
  phone: string
  message: string
}

type FormErrors = Partial<Record<'name' | 'guests' | 'email' | 'phone', string>>

const INITIAL: FormState = {
  attending: true,
  name: '',
  guests: '1',
  email: '',
  phone: '',
  message: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const inputClass =
  'w-full rounded-xl border border-brand-200/70 bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-xs outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100'

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (form.name.trim().length < 2) errors.name = 'Informe seu nome.'

  if (form.attending) {
    const guests = Number(form.guests)
    if (!Number.isInteger(guests) || guests < 1 || guests > eventConfig.maxGuestsPerRsvp) {
      errors.guests = `Informe de 1 a ${eventConfig.maxGuestsPerRsvp} pessoas.`
    }
  }

  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Esse e-mail não parece válido.'
  }

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (form.phone.trim() && (phoneDigits.length < 10 || phoneDigits.length > 13)) {
    errors.phone = 'Use DDD + número, ex.: (11) 91234-5678.'
  }
  return errors
}

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  optional?: string
  error?: string
  children: ReactNode
}

function Field({ id, label, hint, optional, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">({optional})</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className="text-xs leading-snug text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function RsvpDialog({ open, onClose }: RsvpDialogProps) {
  const uid = useId()
  const titleId = `${uid}-title`
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const id = (name: string) => `${uid}-${name}`
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleClose() {
    onClose()
    // Só limpa depois de fechar, para não "piscar" o formulário durante a animação.
    if (status === 'done') {
      setForm(INITIAL)
      setErrors({})
      setStatus('idle')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === 'sending') return

    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstKey = (['name', 'guests', 'email', 'phone'] as const).find((k) => found[k])
      if (firstKey) document.getElementById(id(firstKey))?.focus()
      return
    }

    setStatus('sending')
    try {
      await submitRsvp({
        attending: form.attending,
        name: form.name.trim(),
        guests: form.attending ? Number(form.guests) : 0,
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <Modal open={open} onClose={handleClose} labelledBy={titleId}>
      {status === 'done' ? (
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:px-10">
          <span className="grid size-16 place-items-center rounded-full bg-brand-100 text-brand-600">
            {form.attending ? <CheckCircle2 className="size-8" /> : <HeartHandshake className="size-8" />}
          </span>
          <h2 id={titleId} className="font-display text-2xl font-semibold">
            {form.attending ? 'Presença confirmada!' : 'Obrigado por avisar!'}
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-muted">
            {form.attending
              ? `Que bom que você vem, ${form.name.trim().split(' ')[0]}! Mal podemos esperar para te ver.`
              : `Sentiremos sua falta, ${form.name.trim().split(' ')[0]}. Obrigado por responder!`}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 cursor-pointer rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
            <div>
              <h2 id={titleId} className="flex items-center gap-2.5 text-lg font-bold">
                <UserCheck className="size-5 text-brand-600" aria-hidden />
                Confirme sua presença
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                Preencha seus dados para o organizador saber que você vem.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar"
              className="-m-1.5 cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="rounded-2xl border border-brand-200/70 bg-brand-100 p-4 sm:p-5">
              <fieldset className="mb-5">
                <legend className="mb-2 text-sm font-semibold">Você vai?</legend>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Você vai?">
                  {[
                    { value: true, label: 'Vou' },
                    { value: false, label: 'Não vou' },
                  ].map((opt) => {
                    const active = form.attending === opt.value
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => set('attending', opt.value)}
                        className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25 ${
                          active
                            ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                            : 'border-brand-200 bg-brand-50 text-ink hover:border-brand-300 hover:bg-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 sm:items-start">
                <Field id={id('name')} label="Nome" error={errors.name}>
                  <input
                    id={id('name')}
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? `${id('name')}-msg` : undefined}
                    className={inputClass}
                  />
                </Field>

                {form.attending && (
                  <Field
                    id={id('guests')}
                    label="Quantidade de pessoas"
                    hint="Contando com você."
                    error={errors.guests}
                  >
                    <input
                      id={id('guests')}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={eventConfig.maxGuestsPerRsvp}
                      value={form.guests}
                      onChange={(e) => set('guests', e.target.value)}
                      aria-invalid={!!errors.guests}
                      aria-describedby={`${id('guests')}-msg`}
                      className={inputClass}
                    />
                  </Field>
                )}

                <Field
                  id={id('email')}
                  label="E-mail"
                  optional="recomendado"
                  hint="Enviamos sua confirmação e um link para cancelar depois, se precisar."
                  error={errors.email}
                >
                  <input
                    id={id('email')}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={`${id('email')}-msg`}
                    className={inputClass}
                  />
                </Field>

                <Field id={id('phone')} label="Telefone" optional="opcional" error={errors.phone}>
                  <input
                    id={id('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', formatPhone(e.target.value))}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? `${id('phone')}-msg` : undefined}
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field id={id('message')} label="Recado" optional="opcional">
                    <textarea
                      id={id('message')}
                      rows={4}
                      maxLength={eventConfig.maxMessageLength}
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      className={`${inputClass} resize-y`}
                    />
                    <p className="text-right text-xs text-muted" aria-live="off">
                      {form.message.length}/{eventConfig.maxMessageLength}
                    </p>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
            {status === 'error' && (
              <p role="alert" className="mb-3 text-center text-sm text-red-600">
                Não foi possível enviar agora. Tente novamente.
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full cursor-pointer rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30 disabled:cursor-wait disabled:opacity-70"
            >
              {sending ? 'Enviando…' : 'Confirmar presença'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
