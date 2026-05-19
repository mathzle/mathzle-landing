import type { APIRoute } from 'astro';

export const prerender = false;

interface KVNamespaceLike {
  put: (key: string, value: string) => Promise<void>;
}

interface CloudflareLocals {
  runtime?: { env?: { SIGNUPS?: KVNamespaceLike } };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
  let body: { email?: unknown; locale?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'bad-json' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const locale = body.locale === 'vi' ? 'vi' : 'en';

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid-email' }, 400);
  }

  const env = (locals as CloudflareLocals).runtime?.env;
  if (!env?.SIGNUPS) {
    // KV binding missing — happens before Task 15 is finished.
    // We deliberately don't tell the client which environment-side
    // thing went wrong; they see the generic error toast.
    console.error('SIGNUPS KV binding missing');
    return json({ error: 'unavailable' }, 503);
  }

  await env.SIGNUPS.put(
    email,
    JSON.stringify({
      locale,
      ts: Date.now(),
      ua: request.headers.get('user-agent') ?? null,
      ref: request.headers.get('referer') ?? null,
    }),
  );

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
