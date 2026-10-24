import type { PlanInput } from './plan-model';

/** Stable representative inputs used by the geometry regression suite. */
export const PLAN_TEST_FIXTURES: PlanInput[] = [
  { plotWidthFt: 30, plotDepthFt: 40, bedrooms: 2, alternative: 'balanced' },
  { plotWidthFt: 40, plotDepthFt: 50, bedrooms: 3, alternative: 'open' },
  { plotWidthFt: 25, plotDepthFt: 35, bedrooms: 1, alternative: 'compact' },
];
