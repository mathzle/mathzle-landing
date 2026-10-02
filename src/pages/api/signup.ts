import type { APIRoute } from 'astro';

export const prerender = false;

export const SOURCES = ['newsletter', 'beta', 'premium-waitlist'] as const;
export type SignupSource = (typeof SOURCES)[number];
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
  let body: { email?: unknown; locale?: unknown; source?: unknown };
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

  if (!env?.SIGNUPS) {
    // KV binding missing — happens before Task 15 is finished.
    // We deliberately don't tell the client which environment-side
    // thing went wrong; they see the generic error toast.
    console.error('SIGNUPS KV binding missing');
    return json({ error: 'unavailable' }, 503);
  }

  const key = `${source}:${email}`;
  if (await env.SIGNUPS.get(key)) {
    return json({ ok: true, duplicate: true });
  }

  await env.SIGNUPS.put(
    key,
    JSON.stringify({
      locale,
      source,
      ts: Date.now(),
      ua: request.headers.get('user-agent') ?? null,
      ref: request.headers.get('referer') ?? null,
    }),
  );

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
