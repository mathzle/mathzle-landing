import { describe, it, expect, vi } from 'vitest';
import { handleSignup, MESSAGE_MAX, NAME_MAX, type KVLike } from '../../src/pages/api/signup';

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

describe('handleSignup — contact messages (D-023)', () => {
  const msg = (over: Record<string, unknown> = {}) =>
    req({ email: 'Mom@Ex.vn', locale: 'vi', source: 'contact', name: ' Lan ', message: ' Xin chào ', consent: true, ...over });

  it('stores name + message under contact:<email>:<ts>', async () => {
    const s = kv();
    const res = await handleSignup(msg(), { SIGNUPS: s });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [key] = [...s.m.keys()];
    expect(key).toMatch(/^contact:mom@ex\.vn:\d+$/);
    expect(JSON.parse(s.m.get(key)!)).toMatchObject({ locale: 'vi', source: 'contact', name: 'Lan', message: 'Xin chào', ua: null, ref: null });
    expect(JSON.parse(s.m.get(key)!).ts).toBe(Number(key.split(':').pop()));
  });
  it('keeps every message from the same email (no signup dedupe)', async () => {
    const s = kv();
    let now = 1_000;
    const spy = vi.spyOn(Date, 'now').mockImplementation(() => now++);
    try {
      await handleSignup(msg({ message: 'one' }), { SIGNUPS: s });
      const res = await handleSignup(msg({ message: 'two' }), { SIGNUPS: s });
      expect(await res.json()).toEqual({ ok: true });
    } finally {
      spy.mockRestore();
    }
    expect([...s.m.keys()]).toEqual(['contact:mom@ex.vn:1000', 'contact:mom@ex.vn:1001']);
    expect([...s.m.values()].map((v) => JSON.parse(v).message)).toEqual(['one', 'two']);
  });
  it('stores a missing name as null', async () => {
    const s = kv();
    await handleSignup(msg({ name: undefined }), { SIGNUPS: s });
    expect(JSON.parse([...s.m.values()][0]).name).toBeNull();
  });
  it('rejects an empty or too-long message with 400 invalid-message', async () => {
    for (const message of ['', '   ', 'x'.repeat(MESSAGE_MAX + 1), 42]) {
      const s = kv();
      const res = await handleSignup(msg({ message }), { SIGNUPS: s });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid-message' });
      expect(s.m.size).toBe(0);
    }
  });
  it('accepts a message of exactly the maximum length', async () => {
    expect((await handleSignup(msg({ message: 'x'.repeat(MESSAGE_MAX) }), { SIGNUPS: kv() })).status).toBe(200);
  });
  it('rejects an over-long name and a missing consent', async () => {
    expect(await (await handleSignup(msg({ name: 'n'.repeat(NAME_MAX + 1) }), { SIGNUPS: kv() })).json()).toEqual({ error: 'invalid-name' });
    expect(await (await handleSignup(msg({ consent: false }), { SIGNUPS: kv() })).json()).toEqual({ error: 'consent-required' });
  });
  it('still validates the email first', async () => {
    const res = await handleSignup(msg({ email: 'nope' }), { SIGNUPS: kv() });
    expect(await res.json()).toEqual({ error: 'invalid-email' });
  });
  it('ignores name/message on ordinary signups', async () => {
    const s = kv();
    await handleSignup(req({ email: 'a@b.co', source: 'beta', name: 'X', message: 'Y' }), { SIGNUPS: s });
    expect(JSON.parse(s.m.get('beta:a@b.co')!)).not.toHaveProperty('message');
  });
});
