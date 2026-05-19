/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

interface Props {
  locale: 'en' | 'vi';
  placeholder: string;
  button: string;
  success: string;
  error: string;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function SignupForm({ locale, placeholder, button, success, error }: Props) {
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
        body: JSON.stringify({ email: email.trim(), locale }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p class="cta-success" role="status">{success}</p>;
  }

  return (
    <form class="cta-form" onSubmit={submit} noValidate>
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
      <button type="submit" class="btn-push" disabled={status === 'loading' || !email.trim()}>
        {status === 'loading' ? '…' : button}
      </button>
      {status === 'error' && (
        <p class="cta-error" role="alert">{error}</p>
      )}
    </form>
  );
}
