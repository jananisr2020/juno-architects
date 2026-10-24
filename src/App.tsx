import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, ChevronDown, Compass, House, IndianRupee, MapPin, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import { calculateFeasibility, type FinishLevel, type ProjectInput } from './lib/feasibility';
import PlanWorkspace from './components/PlanWorkspace';

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

export default function App() {
  const [budget, setBudget] = useState('2000000');
  const [width, setWidth] = useState('30');
  const [depth, setDepth] = useState('40');
  const [floors, setFloors] = useState('1');
  const [bedrooms, setBedrooms] = useState('2');
  const [location, setLocation] = useState('Coimbatore, Tamil Nadu');
  const [buildingType, setBuildingType] = useState('Independent house');
  const [finish, setFinish] = useState<FinishLevel>('standard');
  const [submitted, setSubmitted] = useState(false);

  const input: ProjectInput = {
    budget: Number(budget),
    plotWidthFt: Number(width),
    plotDepthFt: Number(depth),
    floors: Number(floors),
    bedrooms: Number(bedrooms),
    location,
    buildingType,
    finish,
  };
  const invalid = !Number.isFinite(input.budget) || input.budget <= 0 ||
    !Number.isFinite(input.plotWidthFt) || input.plotWidthFt <= 0 ||
    !Number.isFinite(input.plotDepthFt) || input.plotDepthFt <= 0 ||
    !Number.isInteger(input.floors) || input.floors < 1 || input.floors > 3 ||
    !Number.isInteger(input.bedrooms) || input.bedrooms < 1 || input.bedrooms > 8 ||
    !location.trim();
  const result = useMemo(() => invalid ? null : calculateFeasibility(input), [
    input.budget, input.plotWidthFt, input.plotDepthFt, input.floors,
    input.bedrooms, input.location, input.buildingType, input.finish, invalid,
  ]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>
      <nav className="nav wrap" aria-label="Main navigation">
        <a className="brand" href="#" aria-label="Juno Architects home">
          <span className="brand-mark"><House size={20} strokeWidth={2.2} /></span>
          <span>juno<span className="brand-light"> architects</span></span>
        </a>
        <a className="nav-link" href="#how-it-works">How it works <ChevronDown size={14} /></a>
        <span className="nav-note"><span className="status-dot" /> Early access · Tamil Nadu</span>
      </nav>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> YOUR HOME, THOUGHTFULLY PLANNED</div>
          <h1>A home that starts<br />with <em>your budget.</em></h1>
          <p className="hero-text">Turn your budget, plot and everyday needs into a clearer first step towards your home. Explore feasibility before you commit.</p>
          <div className="hero-points">
            <span><Check size={15} /> Transparent estimates</span>
            <span><Check size={15} /> Original concepts</span>
            <span><Check size={15} /> No paid AI required</span>
          </div>
          <a className="text-link" href="#planner">Start planning <ArrowRight size={16} /></a>
        </div>
        <div className="hero-art" aria-label="Abstract architectural concept illustration">
          <div className="sun" />
          <div className="art-caption"><span>01 / CONCEPT</span><span>Space for living</span></div>
          <div className="building">
            <div className="roof-line" />
            <div className="upper"><div className="window window-a" /><div className="window window-b" /></div>
            <div className="lower"><div className="door" /><div className="window window-c" /></div>
            <div className="steps" />
          </div>
          <div className="plant plant-one"><i /><i /><i /><b /></div>
          <div className="plant plant-two"><i /><i /><i /><b /></div>
          <div className="art-foot"><span>LIGHT · FLOW · FUNCTION</span><span>DESIGN STARTS HERE</span></div>
        </div>
      </section>

      <section className="planner-section" id="planner">
        <div className="wrap planner-layout">
          <div className="planner-intro">
            <div className="eyebrow"><Compass size={14} /> THE FIRST STEP</div>
            <h2>Let's understand<br />what's possible.</h2>
            <p>A few details are enough to build an initial feasibility picture. You can refine everything later.</p>
            <div className="trust-note"><ShieldCheck size={20} /><span><strong>Clear assumptions, always.</strong><br />This is an early planning benchmark, not a contractor quote or approved building plan.</span></div>
          </div>
          <form className="planner-card" onSubmit={handleSubmit} noValidate>
            <div className="form-head"><div><span className="step-label">YOUR PROJECT</span><h3>Tell us the basics</h3></div><span className="step-count">01 <span>/ 01</span></span></div>
            <div className="field">
              <label htmlFor="location">Where are you planning to build?</label>
              <div className="input-wrap"><MapPin size={17} /><input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, state" required /></div>
            </div>
            <div className="field">
              <label htmlFor="budget">Total construction budget</label>
              <div className="input-wrap"><IndianRupee size={17} /><input id="budget" type="number" min="1" step="10000" value={budget} onChange={e => setBudget(e.target.value)} required /><span className="unit">INR</span></div>
              <span className="field-hint">Land purchase excluded</span>
            </div>
            <div className="field">
              <label>Plot dimensions</label>
              <div className="two-inputs">
                <div className="input-wrap"><Ruler size={16} /><input aria-label="Plot width in feet" type="number" min="1" value={width} onChange={e => setWidth(e.target.value)} required /><span className="unit">ft wide</span></div>
                <div className="input-wrap"><input aria-label="Plot depth in feet" type="number" min="1" value={depth} onChange={e => setDepth(e.target.value)} required /><span className="unit">ft deep</span></div>
              </div>
              <span className="field-hint">Plot area: {Number(width) > 0 && Number(depth) > 0 ? (Number(width) * Number(depth)).toLocaleString('en-IN') : '—'} sq ft</span>
            </div>
            <div className="two-inputs field">
              <div><label htmlFor="floors">Number of floors</label><select id="floors" value={floors} onChange={e => setFloors(e.target.value)}><option value="1">Ground floor only</option><option value="2">Ground + first</option><option value="3">Three floors</option></select></div>
              <div><label htmlFor="bedrooms">Bedrooms needed</label><select id="bedrooms" value={bedrooms} onChange={e => setBedrooms(e.target.value)}>{[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} bedroom{n > 1 ? 's' : ''}</option>)}</select></div>
            </div>
            <div className="field">
              <label htmlFor="building-type">What are you planning?</label>
              <select id="building-type" value={buildingType} onChange={e => setBuildingType(e.target.value)}><option>Independent house</option><option>Duplex home</option><option>Rental / multi-unit home</option></select>
            </div>
            <div className="field">
              <label htmlFor="finish">Finish preference</label>
              <select id="finish" value={finish} onChange={e => setFinish(e.target.value as FinishLevel)}><option value="basic">Simple and functional</option><option value="standard">Comfortable everyday finish</option><option value="premium">Premium finish</option></select>
            </div>
            {submitted && invalid && <p className="error" role="alert">Please enter a valid budget, plot dimensions, location, and room/floor selection.</p>}
            <button className="primary-button" type="submit">Check my budget <ArrowRight size={17} /></button>
            <p className="privacy-copy">No account needed to explore your first estimate.</p>
          </form>
        </div>
      </section>

      {submitted && result && (
        <section className="results-section wrap" aria-live="polite">
          <div className="eyebrow"><Sparkles size={14} /> YOUR FIRST FEASIBILITY SNAPSHOT</div>
          <h2>Here's a starting point.</h2>
          <p className="results-lead">For {location.trim()}, based on the details you entered. These figures use an unverified planning rate and must be checked locally.</p>
          <div className="results-grid">
            <article className="result-card result-featured"><span className="result-label">Indicative budget-supported area</span><strong>{Math.round(result.areaLow).toLocaleString('en-IN')}–{Math.round(result.areaHigh).toLocaleString('en-IN')} <small>sq ft</small></strong><p>Before site-specific constraints and local building-rule checks.</p></article>
            <article className="result-card"><span className="result-label">Base construction allowance</span><strong>{money(result.baseConstruction)}</strong><p>At an illustrative {money(result.ratePerSqFt)} per sq ft.</p></article>
            <article className="result-card"><span className="result-label">Estimated planning total</span><strong>{money(result.estimatedTotal)}</strong><p>Includes provisional allowances and contingency.</p></article>
          </div>
          <div className="breakdown">
            <div><span>Base construction</span><strong>{money(result.baseConstruction)}</strong></div>
            <div><span>Site and utilities allowance (5%)</span><strong>{money(result.siteAllowance)}</strong></div>
            <div><span>Professional and approval allowance (5%)</span><strong>{money(result.professionalAllowance)}</strong></div>
            <div><span>Contingency (10% of subtotal)</span><strong>{money(result.contingency)}</strong></div>
            <div className="breakdown-total"><span>Illustrative total</span><strong>{money(result.estimatedTotal)}</strong></div>
          </div>
          <div className="warning-note"><ShieldCheck size={19} /><p><strong>Important:</strong> Rate is a placeholder planning assumption, not a verified current Coimbatore/Tamil Nadu quote. Land, unusual foundations, major retaining work, interiors, compound wall, borewell/septic and other site-specific items may be excluded. Local rules, setbacks, FSI and approvals need qualified local review.</p></div>
          <button className="secondary-button" onClick={() => { setSubmitted(false); document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }); }}>Adjust my details <ArrowDownRight size={16} /></button>
        </section>
      )}

      <PlanWorkspace width={Number(width)} depth={Number(depth)} bedrooms={Number(bedrooms)} budget={Number(budget)} location={location.trim()} />

      <section className="how-section wrap" id="how-it-works">
        <div className="eyebrow">BUILT AROUND YOUR NEEDS</div><h2>From “what can I afford?”<br />to a more confident first step.</h2>
        <div className="how-grid">
          <article><span>01</span><h3>Start with reality</h3><p>Your budget and plot are the starting point—not a pre-made house design.</p></article>
          <article><span>02</span><h3>Understand the trade-offs</h3><p>See how area, finish level and allowances affect the overall estimate.</p></article>
          <article><span>03</span><h3>Shape an original concept</h3><p>Next: editable layouts built from your requirements, with 2D and 3D views derived from the same model.</p></article>
        </div>
      </section>
      <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#"><span className="brand-mark"><House size={18} /></span><span>juno<span className="brand-light"> architects</span></span></a><span>Plan thoughtfully. Build with professional guidance.</span><span>© 2026 Juno Architects</span></div></footer>
    </main>
  );
}