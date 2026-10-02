/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

/** Contact-page message form (D-023). Posts to /api/signup with source "contact". */
export interface ContactFormText {
  name: string;
  nameHint: string;
  email: string;
  emailHint: string;
  message: string;
  messageHint: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  success: string;
  invalidEmail: string;
  invalidMessage: string;
  invalidConsent: string;
  error: string;
  counter: string;
}

interface Props {
  locale: 'en' | 'vi';
  text: ContactFormText;
  max: number;
  nameMax: number;
}

type Status = 'idle' | 'loading' | 'done' | 'error' | 'invalid-email' | 'invalid-message' | 'invalid-consent';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({ locale, text, max, nameMax }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const fill = (s: string) => s.replace('{max}', String(max));

  async function submit(e: Event) {
    e.preventDefault();
    const m = message.trim();
    if (!EMAIL_RE.test(email.trim())) return setStatus('invalid-email');
    if (!m || m.length > max) return setStatus('invalid-message');
    if (!consent) return setStatus('invalid-consent');
    setStatus('loading');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), message: m, consent, locale, source: 'contact' }),
      });
      if (res.ok) return setStatus('done');
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus(
        data.error === 'invalid-email' ? 'invalid-email'
          : data.error === 'invalid-message' ? 'invalid-message'
          : data.error === 'consent-required' ? 'invalid-consent'
          : 'error',
      );
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p class="cf-done" role="status">{text.success}</p>;
  }

  const busy = status === 'loading';
  const alert =
    status === 'invalid-email' ? text.invalidEmail
      : status === 'invalid-message' ? fill(text.invalidMessage)
      : status === 'invalid-consent' ? text.invalidConsent
      : status === 'error' ? text.error
      : null;
  const [consentBefore, consentAfter] = text.consent.split('{link}');

  return (
    <form class="cf" onSubmit={submit} noValidate aria-busy={busy}>
      <div class="cf-row">
        <div class="cf-field">
          <label for="cf-name">{text.name} <span class="cf-hint">{text.nameHint}</span></label>
          <input id="cf-name" name="name" type="text" autocomplete="name" maxLength={nameMax}
            value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} disabled={busy} />
        </div>
        <div class="cf-field">
          <label for="cf-email">{text.email}</label>
          <input id="cf-email" name="email" type="email" autocomplete="email" required
            aria-invalid={status === 'invalid-email'} aria-describedby="cf-email-hint"
            value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} disabled={busy} />
          <span id="cf-email-hint" class="cf-hint">{text.emailHint}</span>
        </div>
      </div>
      <div class="cf-field">
        <label for="cf-message">{text.message}</label>
        <textarea id="cf-message" name="message" rows={5} required maxLength={max}
          aria-invalid={status === 'invalid-message'} aria-describedby="cf-message-hint"
          value={message} onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)} disabled={busy} />
        <span id="cf-message-hint" class="cf-hint cf-count">
          <span>{fill(text.messageHint)}</span>
          <span aria-hidden="true">{text.counter.replace('{n}', String(message.length)).replace('{max}', String(max))}</span>
        </span>
      </div>
      <label class="cf-consent">
        <input type="checkbox" name="consent" required checked={consent}
          aria-invalid={status === 'invalid-consent'}
          onChange={(e) => setConsent((e.target as HTMLInputElement).checked)} disabled={busy} />
        <span>{consentBefore}<a href={`/${locale}/privacy/`}>{text.privacy}</a>{consentAfter}</span>
      </label>
      <div class="cf-actions">
        <button type="submit" class="btn-push" disabled={busy}>{busy ? text.sending : text.submit}</button>
        {alert && <p class="cf-error" role="alert">{alert}</p>}
      </div>
    </form>
  );
}
