import { describe, it, expect } from 'vitest';
import { handleSignup, type KVLike } from '../../src/pages/api/signup';

const kv = () => {
  const m = new Map<string, string>();
  const store: KVLike & { m: Map<string, string> } = {
    m,
    get: async (k) => m.get(k) ?? null,
    put: async (k, v) => void m.set(k, v),
  };
  return store;
};
const req = (body: unknown) =>
  new Request('https://x/api/signup', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) });

describe('handleSignup', () => {
  it('stores email under its source', async () => {
    const s = kv();
    const res = await handleSignup(req({ email: ' A@B.co ', locale: 'vi', source: 'beta' }), { SIGNUPS: s });
    expect(res.status).toBe(200);
    expect([...s.m.keys()]).toEqual(['beta:a@b.co']);
    expect(JSON.parse(s.m.get('beta:a@b.co')!)).toMatchObject({ locale: 'vi', source: 'beta' });
  });
  it('defaults unknown sources to newsletter', async () => {
    const s = kv();
    await handleSignup(req({ email: 'a@b.co', source: 'hax' }), { SIGNUPS: s });
    expect([...s.m.keys()]).toEqual(['newsletter:a@b.co']);
  });
  it('does not overwrite an existing signup (keeps first timestamp)', async () => {
    const s = kv();
    await handleSignup(req({ email: 'a@b.co', source: 'beta' }), { SIGNUPS: s });
    const first = s.m.get('beta:a@b.co');
    const res = await handleSignup(req({ email: 'a@b.co', source: 'beta' }), { SIGNUPS: s });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, duplicate: true });
    expect(s.m.get('beta:a@b.co')).toBe(first);
  });
  it('rejects invalid email with 400 invalid-email', async () => {
    const res = await handleSignup(req({ email: 'nope' }), { SIGNUPS: kv() });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid-email' });
  });
  it('rejects malformed JSON with 400', async () => {
    expect((await handleSignup(req('{'), { SIGNUPS: kv() })).status).toBe(400);
  });
  it('returns 503 when the KV binding is missing', async () => {
    expect((await handleSignup(req({ email: 'a@b.co' }), undefined)).status).toBe(503);
  });
});
