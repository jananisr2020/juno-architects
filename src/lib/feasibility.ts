export type FinishLevel = 'basic' | 'standard' | 'premium';

export interface ProjectInput {
  budget: number;
  plotWidthFt: number;
  plotDepthFt: number;
  floors: number;
  bedrooms: number;
  location: string;
  buildingType: string;
  finish: FinishLevel;
}

export interface FeasibilityResult {
  plotArea: number;
  ratePerSqFt: number;
  areaLow: number;
  areaHigh: number;
  baseConstruction: number;
  siteAllowance: number;
  professionalAllowance: number;
  contingency: number;
  estimatedTotal: number;
  rateVersion: string;
  rateStatus: string;
}

const RATE_BY_FINISH: Record<FinishLevel, number> = {
  basic: 1800,
  standard: 2200,
  premium: 2800,
};

/**
 * Produces an early, deterministic budget scenario.
 * Rates are explicitly unverified placeholders, not current market quotes.
 * Local buildability, setbacks, FSI, structural design and approvals are not calculated.
 */
export function calculateFeasibility(input: ProjectInput): FeasibilityResult {
  const values = [input.budget, input.plotWidthFt, input.plotDepthFt, input.floors, input.bedrooms];
  if (values.some(value => !Number.isFinite(value) || value <= 0)) {
    throw new Error('Budget, dimensions, floors and bedrooms must be positive finite numbers.');
  }
  if (!Number.isInteger(input.floors) || input.floors > 3) {
    throw new Error('Floors must be a whole number from 1 to 3.');
  }
  if (!Number.isInteger(input.bedrooms) || input.bedrooms > 8) {
    throw new Error('Bedrooms must be a whole number from 1 to 8.');
  }
  if (!input.location.trim()) throw new Error('Location is required.');

  const ratePerSqFt = RATE_BY_FINISH[input.finish];
  const baseConstruction = input.budget / 1.21;
  const siteAllowance = baseConstruction * 0.05;
  const professionalAllowance = baseConstruction * 0.05;
  const subtotal = baseConstruction + siteAllowance + professionalAllowance;
  const contingency = subtotal * 0.1;
  const estimatedTotal = subtotal + contingency;
  const areaHigh = baseConstruction / ratePerSqFt;

  return {
    plotArea: input.plotWidthFt * input.plotDepthFt,
    ratePerSqFt,
    areaLow: areaHigh * 0.85,
    areaHigh,
    baseConstruction,
    siteAllowance,
    professionalAllowance,
    contingency,
    estimatedTotal,
    rateVersion: 'illustrative-2026-10-v1',
    rateStatus: 'unverified-placeholder',
  };
}
