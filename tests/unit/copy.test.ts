import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/data/claims', async (orig) => {
  const real = await orig<typeof import('../../src/data/claims')>();
  const reg = {
    worlds: { value: 6, source: 's', verifiedBy: 'PO' },
    levels: { value: 1240, source: 's', verifiedBy: 'PO' },
    pending: { value: 12, source: 's', verifiedBy: null },
    empty: { value: null, source: 's', verifiedBy: null },
    gone: { value: null, source: 's', verifiedBy: 'PO' },
    flag: { value: true, source: 's', verifiedBy: 'PO' },
  };
  return {
    ...real,
    claims: reg,
    resolveClaim: (k: string, strict = false) => real.resolveClaim(k as never, strict, reg),
  };
});

const { copy, copyText, formatNumber, claimHtml, visible } = await import('../../src/lib/copy');

describe('copy()', () => {
  it('escapes HTML in source text', () => {
    expect(copy('a < b & "c"', 'vi')).toBe('a &lt; b &amp; &quot;c&quot;');
  });
  it('renders ==marker== and **bold**', () => {
    expect(copy('Con ==hết sợ toán== **ngay**', 'vi')).toBe(
      'Con <mark class="marker">hết sợ toán</mark> <strong>ngay</strong>',
    );
  });
  it('interpolates verified numeric claims with locale grouping', () => {
    expect(copy('{claim:worlds} thế giới, {claim:levels} màn', 'vi')).toBe('6 thế giới, 1.240 màn');
    expect(copy('{claim:levels} levels', 'en')).toBe('1,240 levels');
  });
  it('flags unverified claims in preview builds', () => {
    expect(copy('{claim:pending} kỹ năng', 'vi')).toBe(
      '<span class="claim-unverified" data-claim="pending" title="Unverified claim: pending">12</span> kỹ năng',
    );
    expect(copy('{claim:empty}', 'vi')).toContain('>[empty]</span>');
  });
  it('throws in strict builds on unverified claims', () => {
    expect(() => copy('{claim:pending}', 'vi', true)).toThrow(/Unverified claim "pending"/);
  });
  it('throws when copy references a claim confirmed absent', () => {
    expect(() => copy('{claim:gone}', 'vi')).toThrow(/confirmed absent/);
  });
  it('throws when a boolean claim is interpolated', () => {
    expect(() => copy('{claim:flag}', 'vi')).toThrow(/boolean/);
  });
});

describe('{if:key} sections', () => {
  it('keeps the text for a verified claim', () => {
    expect(copy('Có{if:flag} báo cáo{/if}.', 'vi')).toBe('Có báo cáo.');
  });
  it('drops the text for a claim confirmed absent', () => {
    expect(copy('Có{if:gone} báo cáo{/if}.', 'vi')).toBe('Có.');
  });
  it('flags the text for an unverified claim in preview', () => {
    expect(copy('A{if:pending} B{/if}', 'vi')).toBe(
      'A<span class="claim-unverified" data-claim="pending" title="Unverified claim: pending"> B</span>',
    );
  });
  it('throws in strict builds when the condition is unverified', () => {
    expect(() => copy('{if:pending}x{/if}', 'vi', true)).toThrow(/Unverified claim "pending"/);
  });
  it('supports claims inside a conditional section', () => {
    expect(copy('{if:flag}{claim:worlds} thế giới{/if}', 'vi')).toBe('6 thế giới');
  });
});

describe('claimHtml()', () => {
  it('formats a verified value', () => {
    expect(claimHtml('levels' as never, (v) => `${v}đ`)).toBe('1240đ');
  });
  it('returns null when the claim is confirmed absent', () => {
    expect(claimHtml('gone' as never, String)).toBeNull();
  });
  it('flags unverified values and shows [key] for missing ones', () => {
    expect(claimHtml('pending' as never, String)).toContain('claim-unverified');
    expect(claimHtml('empty' as never, String)).toContain('[empty]');
  });
});

describe('copyText()', () => {
  it('strips markup and never emits HTML', () => {
    expect(copyText('==Con== **học** {claim:pending} & vui', 'vi')).toBe('Con học 12 & vui');
  });
  it('resolves conditional sections', () => {
    expect(copyText('A{if:flag} B{/if}{if:gone} C{/if}', 'vi')).toBe('A B');
  });
});

describe('formatNumber()', () => {
  it('groups by locale', () => {
    expect(formatNumber(119000, 'vi')).toBe('119.000');
    expect(formatNumber(119000, 'en')).toBe('119,000');
  });
});

describe('visible()', () => {
  it('keeps unconditional items and items whose claim shows', () => {
    const items = [{ if: '', n: 1 }, { if: 'flag', n: 2 }, { if: 'gone', n: 3 }, { if: 'pending', n: 4 }];
    expect(visible(items).map((i) => i.n)).toEqual([1, 2, 4]);
  });
  it('throws in strict builds on an unverified condition', () => {
    expect(() => visible([{ if: 'pending' }], true)).toThrow(/Unverified/);
  });
});
