import { describe, expect, it } from 'vitest';
import { generatePlan, totalRoomArea, validatePlan } from './plan-model';

describe('structured plan generator', () => {
  it('creates repeatable room geometry in plot bounds', () => {
    const a = generatePlan({ plotWidthFt: 30, plotDepthFt: 40, bedrooms: 2 });
    const b = generatePlan({ plotWidthFt: 30, plotDepthFt: 40, bedrooms: 2 });
    expect(a).toEqual(b);
    expect(validatePlan(a)).toEqual([]);
    expect(a.rooms.filter(r => r.kind === 'bedroom')).toHaveLength(2);
    expect(totalRoomArea(a)).toBeGreaterThan(0);
  });
  it('supports layout alternatives', () => {
    expect(generatePlan({ plotWidthFt: 30, plotDepthFt: 40, bedrooms: 3, alternative: 'compact' }).metadata.alternative).toBe('compact');
    expect(generatePlan({ plotWidthFt: 30, plotDepthFt: 40, bedrooms: 3, alternative: 'open' }).id).toContain('open');
  });
  it('rejects unrealistic plot dimensions and bedroom counts', () => {
    expect(() => generatePlan({ plotWidthFt: 10, plotDepthFt: 20, bedrooms: 2 })).toThrow(/too small/i);
    expect(() => generatePlan({ plotWidthFt: 30, plotDepthFt: 40, bedrooms: 0 })).toThrow(/bedrooms/i);
  });
});
