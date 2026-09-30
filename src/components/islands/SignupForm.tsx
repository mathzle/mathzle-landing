/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

interface Props {
  locale: 'en' | 'vi';
  source: 'newsletter' | 'beta' | 'premium-waitlist';
  placeholder: string;
  button: string;
  success: string;
  error: string;
  invalid: string;
  variant?: 'light' | 'ink';
}

type Status = 'idle' | 'loading' | 'done' | 'error' | 'invalid';

export default function SignupForm({
  locale,
  source,
  placeholder,
  button,
  success,
  error,
  invalid,
  variant,
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function submit(e: Event) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale, source }),
      });
      if (res.ok) return setStatus('done');
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus(data.error === 'invalid-email' ? 'invalid' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p class="cta-success" role="status">{success}</p>;
  }

  return (
    <form class={`cta-form cta-form--${variant ?? 'light'}`} onSubmit={submit} noValidate>
      <input
        type="email"
        required
        placeholder={placeholder}
        value={email}
        onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
        disabled={status === 'loading'}
        aria-label={placeholder}
        autocomplete="email"
      />
      <button type="submit" class="btn-push" disabled={status === 'loading'}>
        {status === 'loading' ? '…' : button}
      </button>
      {status === 'invalid' && (
        <p class="cta-error" role="alert">{invalid}</p>
      )}
      {status === 'error' && (
        <p class="cta-error" role="alert">{error}</p>
      )}
    </form>
  );
}
