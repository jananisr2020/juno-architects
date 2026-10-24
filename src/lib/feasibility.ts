import rateConfig from '../../shared/rates.v1.json';

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
  assumptions: string[];
}

export const RATE_CONFIGURATION = {
  schemaVersion: rateConfig.schema_version,
  id: rateConfig.configuration_id,
  region: rateConfig.region,
  effectiveDate: rateConfig.effective_date,
  configurationDate: rateConfig.configuration_date,
  sourceStatus: rateConfig.source_status,
  sourceName: rateConfig.source_name,
  sourceUrl: rateConfig.source_url,
  benchmarkReferences: rateConfig.benchmark_references,
  currency: rateConfig.currency,
  unit: rateConfig.unit,
  rates: rateConfig.rates,
} as const;

/**
 * Calculates a transparent early budget scenario using explicit, versioned placeholder rates.
 * This is not a contractor quote and does not calculate setbacks, FSI, structural design, or approvals.
 */
export function calculateFeasibility(input: ProjectInput): FeasibilityResult {
  const values = [input.budget, input.plotWidthFt, input.plotDepthFt, input.floors, input.bedrooms];
  if (values.some(value => !Number.isFinite(value) || value <= 0)) {
    throw new Error('Budget, dimensions, floors and bedrooms must be positive finite numbers.');
  }
  if (input.budget > 10_000_000_000 || input.plotWidthFt > 1000 || input.plotDepthFt > 1000) {
    throw new Error('Budget or plot dimensions exceed the supported planning range.');
  }
  if (!Number.isInteger(input.floors) || input.floors > 3) {
    throw new Error('Floors must be a whole number from 1 to 3.');
  }
  if (!Number.isInteger(input.bedrooms) || input.bedrooms > 8) {
    throw new Error('Bedrooms must be a whole number from 1 to 8.');
  }
  if (!input.location.trim()) throw new Error('Location is required.');
  if (!['basic', 'standard', 'premium'].includes(input.finish)) throw new Error('Choose a supported finish level.');
  if (!['Independent house', 'Duplex home', 'Rental / multi-unit home'].includes(input.buildingType)) throw new Error('Choose a supported building type.');

  const ratePerSqFt = RATE_CONFIGURATION.rates[input.finish];
  const plotArea = input.plotWidthFt * input.plotDepthFt;
  const baseConstruction = input.budget / 1.21;
  const siteAllowance = baseConstruction * 0.05;
  const professionalAllowance = baseConstruction * 0.05;
  const subtotal = baseConstruction + siteAllowance + professionalAllowance;
  const contingency = subtotal * 0.1;
  const estimatedTotal = subtotal + contingency;
  const grossPlotCapacity = plotArea * input.floors;
  const areaHigh = Math.min(baseConstruction / ratePerSqFt, grossPlotCapacity);

  return {
    plotArea,
    ratePerSqFt,
    areaLow: areaHigh * 0.85,
    areaHigh,
    baseConstruction,
    siteAllowance,
    professionalAllowance,
    contingency,
    estimatedTotal,
    rateVersion: RATE_CONFIGURATION.id,
    rateStatus: RATE_CONFIGURATION.sourceStatus,
    assumptions: [
      'Land purchase excluded.',
      'Construction rates are unverified placeholders, not current local quotes.',
      'Gross plot capacity is a mathematical ceiling, not buildable area; setbacks, FSI, coverage, ventilation and approvals require local review.',
      'Site, utility, professional and contingency allowances are provisional.',
    ],
  };
}
