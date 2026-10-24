import { describe, expect, it } from 'vitest';
import { calculateFeasibility, type ProjectInput } from './feasibility';

const sample: ProjectInput = {
  budget: 2_000_000,
  plotWidthFt: 30,
  plotDepthFt: 40,
  floors: 1,
  bedrooms: 2,
  location: 'Coimbatore, Tamil Nadu',
  buildingType: 'Independent house',
  finish: 'standard',
};

describe('calculateFeasibility', () => {
  it('calculates a transparent total that matches the supplied budget scenario', () => {
    const result = calculateFeasibility(sample);
    expect(result.estimatedTotal).toBeCloseTo(sample.budget, 6);
    expect(result.plotArea).toBe(1200);
    expect(result.ratePerSqFt).toBe(2200);
    expect(result.areaLow).toBeLessThan(result.areaHigh);
  });

  it('increases the assumed rate for premium finish and reduces supported area', () => {
    const standard = calculateFeasibility(sample);
    const premium = calculateFeasibility({ ...sample, finish: 'premium' });
    expect(premium.ratePerSqFt).toBeGreaterThan(standard.ratePerSqFt);
    expect(premium.areaHigh).toBeLessThan(standard.areaHigh);
  });

  it('rejects zero budget', () => {
    expect(() => calculateFeasibility({ ...sample, budget: 0 })).toThrow(/positive finite numbers/i);
  });

  it('rejects more than three floors', () => {
    expect(() => calculateFeasibility({ ...sample, floors: 4 })).toThrow(/whole number/i);
  });

  it('rejects a blank location', () => {
    expect(() => calculateFeasibility({ ...sample, location: ' ' })).toThrow(/location is required/i);
  });
});
