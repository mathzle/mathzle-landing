import { describe, it, expect } from 'vitest';
import { ICONS, iconSvg, type IconName } from '../../src/lib/icons';

describe('icons', () => {
  it('every mapped icon is an SVG string', () => {
    for (const [name, svg] of Object.entries(ICONS)) expect(svg.trim().startsWith('<svg'), name).toBe(true);
  });
  it('resizes and hides from assistive tech', () => {
    const svg = iconSvg('Check' as IconName, 20);
    expect(svg).toContain('width="20"');
    expect(svg).toContain('height="20"');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).not.toContain('width="24"');
  });
});
