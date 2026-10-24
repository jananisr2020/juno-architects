import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import MassingView from './MassingView';
import { generatePlan } from '../lib/plan-model';

describe('isometric massing view', () => {
  it('renders an accessible SVG from the canonical plan and selected floor count', () => {
    const plan = generatePlan({ plotWidthFt: 30, plotDepthFt: 40, bedrooms: 2, alternative: 'balanced' });
    const markup = renderToStaticMarkup(<MassingView plan={plan} floors={2} />);
    expect(markup).toContain('<svg');
    expect(markup).toContain('Isometric massing concept');
    expect(markup).toContain('2 floors');
    expect(markup).toContain('Living / dining');
  });
});
