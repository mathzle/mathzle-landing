import type { APIRoute } from 'astro';
import { MESSAGE_MAX, NAME_MAX } from '../../lib/contact';

export const prerender = false;

export const SOURCES = ['newsletter', 'beta', 'premium-waitlist', 'contact'] as const;
export type SignupSource = (typeof SOURCES)[number];
export { MESSAGE_MAX, NAME_MAX };
export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}
interface CloudflareLocals {
  runtime?: { env?: { SIGNUPS?: KVLike } };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleSignup(
  request: Request,
  env: { SIGNUPS?: KVLike } | undefined,
): Promise<Response> {
  let body: { email?: unknown; locale?: unknown; source?: unknown; name?: unknown; message?: unknown; consent?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'bad-json' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const locale = body.locale === 'vi' ? 'vi' : 'en';
  const source: SignupSource = SOURCES.includes(body.source as SignupSource)
    ? (body.source as SignupSource)
    : 'newsletter';

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid-email' }, 400);
  }

  // Contact messages (D-023): validated before the KV check so a bad form
  // gets a precise error even when storage is down.
  let contact: { name: string | null; message: string } | null = null;
  if (source === 'contact') {
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > MESSAGE_MAX) return json({ error: 'invalid-message' }, 400);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length > NAME_MAX) return json({ error: 'invalid-name' }, 400);
    if (body.consent !== true) return json({ error: 'consent-required' }, 400);
    contact = { name: name || null, message };
  }

  if (!env?.SIGNUPS) {
    // KV binding missing — happens before Task 15 is finished.
    // We deliberately don't tell the client which environment-side
    // thing went wrong; they see the generic error toast.
    console.error('SIGNUPS KV binding missing');
    return json({ error: 'unavailable' }, 503);
  }

  const ts = Date.now();
  const meta = {
    locale,
    source,
    ts,
    ua: request.headers.get('user-agent') ?? null,
    ref: request.headers.get('referer') ?? null,
  };

  if (contact) {
    // Every message is kept: one key per message, never the signup dedupe below.
    // The random suffix keeps two messages sent in the same millisecond apart.
    await env.SIGNUPS.put(`contact:${email}:${ts}:${crypto.randomUUID()}`, JSON.stringify({ ...meta, ...contact }));
    return json({ ok: true });
  }

  const key = `${source}:${email}`;
  if (await env.SIGNUPS.get(key)) {
    return json({ ok: true, duplicate: true });
  }

  await env.SIGNUPS.put(key, JSON.stringify(meta));

  return json({ ok: true });
}

export const POST: APIRoute = ({ request, locals }) =>
  handleSignup(request, (locals as CloudflareLocals).runtime?.env);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
