/** Every string leaf in a JSON-ish value. Keys starting with `_` are translator notes and skipped. */
export function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([k]) => !k.startsWith('_'))
      .flatMap(([, v]) => collectStrings(v));
  }
  return [];
}

/** Key paths (with array lengths) — two dictionaries match when their shapes match. */
export function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([k]) => !k.startsWith('_'))
      .flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  }
  return [path];
}

/** Luật Quảng cáo 2012 Đ.8: no direct comparison with named competitors. */
export const COMPETITORS = ['monkey', 'khan', 'prodigy', 'vuihoc', 'clevai', 'codemath', 'hocmai', 'duolingo', 'dragonbox', 'brilliant', 'synthesis'];

export const BANNED_VI = [
  'số 1', 'hàng đầu', 'hàng trăm', 'hàng nghìn', 'tuyệt vời',
  'dùng thử premium', 'loại bỏ quảng cáo',
];
export const BANNED_EN = [
  '#1', 'number one', 'leading', 'hundreds of', 'thousands of', 'amazing',
  'try premium', 'ad-free', 'remove ads', 'removes ads',
];

export function offenders(strings: string[], banned: string[]): string[] {
  return strings.flatMap((s) =>
    banned.filter((b) => s.toLowerCase().includes(b)).map((b) => `"${b}" in: ${s}`),
  );
}
