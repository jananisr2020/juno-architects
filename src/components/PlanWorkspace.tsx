import { useMemo, useState, type FormEvent } from 'react';
import { Copy, Download, FilePlus2, Trash2 } from 'lucide-react';
import { generatePlan, roomArea, type PlanModel } from '../lib/plan-model';
import { createProject, deleteProject, duplicateProject, listProjects, renameProject, type LocalProject } from '../lib/projects';
import { authenticateApi, createApiProject, deleteApiProject, duplicateApiProject, listApiProjects, renameApiProject, type ApiProject } from '../lib/api';

type Props = { width: number; depth: number; bedrooms: number; budget: number; location: string };
const palette: Record<string, string> = { living: '#dce8df', bedroom: '#e8e1d2', kitchen: '#dbe5ef', bathroom: '#e7dfe9', circulation: '#eeeeea' };

export default function PlanWorkspace({ width, depth, bedrooms, budget, location }: Props) {
  const [alternative, setAlternative] = useState<PlanModel['metadata']['alternative']>('balanced');
  const [projects, setProjects] = useState<LocalProject[]>(() => listProjects());
  const [notice, setNotice] = useState('');
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [cloudProjects, setCloudProjects] = useState<ApiProject[]>([]);
  const [apiBusy, setApiBusy] = useState(false);
  const plan = useMemo(() => {
    try { return generatePlan({ plotWidthFt: width, plotDepthFt: depth, bedrooms, alternative }); }
    catch { return null; }
  }, [width, depth, bedrooms, alternative]);

  async function save() {
    if (!plan) return;
    const input = { budget, plotWidthFt: width, plotDepthFt: depth, bedrooms, location };
    createProject(input, plan);
    setProjects(listProjects());
    if (apiToken && apiBase) {
      try {
        const saved = await createApiProject(apiBase, apiToken, plan.title, { input, plan });
        setCloudProjects(current => [saved, ...current]);
        setNotice('Concept saved on this device and to your account.');
      } catch (error) {
        setNotice(error instanceof Error ? `Saved locally; cloud save failed: ${error.message}` : 'Saved locally; cloud save failed.');
      }
    } else setNotice('Concept saved on this device.');
  }
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiBase) return;
    setApiBusy(true);
    try {
      const auth = await authenticateApi(apiBase, authMode, email, password);
      const list = await listApiProjects(apiBase, auth.access_token);
      setApiToken(auth.access_token); setCloudProjects(list); setPassword('');
      setNotice(authMode === 'register' ? 'Account created. Cloud projects are ready.' : 'Signed in. Cloud projects loaded.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not connect to the account service.');
    } finally { setApiBusy(false); }
  }
  async function cloudRename(project: ApiProject) {
    if (!apiToken || !apiBase) return;
    const title = window.prompt('Enter a new project name', project.title);
    if (title === null) return;
    try {
      const updated = await renameApiProject(apiBase, apiToken, project.id, title);
      setCloudProjects(current => current.map(p => p.id === project.id ? updated : p));
      setNotice('Cloud project renamed.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not rename cloud project.'); }
  }
  async function cloudDuplicate(project: ApiProject) {
    if (!apiToken || !apiBase) return;
    try {
      const copied = await duplicateApiProject(apiBase, apiToken, project.id);
      setCloudProjects(current => [copied, ...current]); setNotice('Cloud project duplicated.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not duplicate cloud project.'); }
  }
  async function cloudDelete(project: ApiProject) {
    if (!apiToken || !apiBase || !window.confirm(`Delete “${project.title}” from your account?`)) return;
    try {
      await deleteApiProject(apiBase, apiToken, project.id);
      setCloudProjects(current => current.filter(p => p.id !== project.id)); setNotice('Cloud project deleted.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not delete cloud project.'); }
  }
  function exportBrief() {
    if (!plan) return;
    const lines = [
      '# Juno Architects — Concept brief', '',
      '> Early concept only. Not a permit-ready, code-compliant, structural, or construction drawing. Have a qualified local architect/engineer review the design.',
      '', `- Location: ${location}`, `- Budget entered: ₹${budget.toLocaleString('en-IN')}`,
      `- Plot: ${width} ft × ${depth} ft (${(width * depth).toLocaleString('en-IN')} sq ft)`,
      `- Bedrooms: ${bedrooms}`, `- Layout: ${plan.metadata.alternative}`, `- Model version: ${plan.metadata.generatedBy}`,
      '', '## Room schedule', '| Room | Width (ft) | Depth (ft) | Area (sq ft) |', '|---|---:|---:|---:|',
      ...plan.rooms.map(r => `| ${r.name} | ${r.width.toFixed(1)} | ${r.height.toFixed(1)} | ${roomArea(r).toFixed(1)} |`),
      '', `Total scheduled room area: ${plan.rooms.reduce((sum, r) => sum + roomArea(r), 0).toFixed(1)} sq ft.`,
      '', '## Assumptions and review required', '- Dimensions are approximate concept geometry in feet.',
      '- The layout does not calculate setbacks, FSI, ventilation compliance, structural systems, plumbing routes, stair compliance, or local approvals.',
      '- Do not use for construction; ask a registered architect and structural engineer to develop and validate drawings.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'juno-concept-brief.md'; anchor.click();
    URL.revokeObjectURL(url); setNotice('Concept brief exported.');
  }
  function rename(p: LocalProject) {
    const title = window.prompt('Enter a new project name', p.title);
    if (title === null) return;
    try { setProjects(renameProject(p.id, title)); setNotice('Project renamed.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not rename project.'); }
  }
  function duplicate(p: LocalProject) {
    duplicateProject(p.id); setProjects(listProjects()); setNotice('Project duplicated.');
  }
  function remove(p: LocalProject) {
    if (!window.confirm(`Delete “${p.title}” from this device?`)) return;
    setProjects(deleteProject(p.id)); setNotice('Project deleted from this device.');
  }

  return <section className="plan-section" id="concept-plans">
    <div className="wrap">
      <div className="eyebrow">ORIGINAL CONCEPT GENERATOR</div>
      <h2>Explore a first floor-plan idea.</h2>
      <p className="plan-intro">These layouts are generated from measured rectangles—not copied house photos. Change the arrangement, inspect room dimensions, and export a brief for discussion with a qualified professional.</p>
      <div className="plan-toolbar" role="group" aria-label="Choose layout alternative">
        {(['compact', 'balanced', 'open'] as const).map(option => <button key={option} className={alternative === option ? 'plan-tab active' : 'plan-tab'} onClick={() => setAlternative(option)} aria-pressed={alternative === option}>{option[0].toUpperCase() + option.slice(1)}</button>)}
      </div>
      {plan ? <div className="plan-layout">
        <div className="plan-canvas">
          <div className="plan-canvas-head"><strong>{plan.title}</strong><span>{width}′ × {depth}′ plot</span></div>
          <svg className="floor-plan-svg" viewBox={`-3 -5 ${width + 6} ${depth + 10}`} role="img" aria-label={`Dimensioned concept floor plan with ${bedrooms} bedrooms on a ${width} by ${depth} foot plot`}>
            <rect x="0" y="0" width={width} height={depth} fill="#faf9f4" stroke="#9aa69a" strokeWidth=".12" strokeDasharray=".6 .5" />
            <text x={width / 2} y="-2" textAnchor="middle" fontSize="1.3" fill="#526457">{width} ft</text>
            <text x="-2" y={depth / 2} textAnchor="middle" fontSize="1.3" fill="#526457" transform={`rotate(-90 -2 ${depth / 2})`}>{depth} ft</text>
            {plan.rooms.map(room => <g key={room.id}>
              <rect x={room.x} y={room.y} width={room.width} height={room.height} fill={palette[room.kind]} stroke="#40594b" strokeWidth=".28" />
              <text x={room.x + room.width / 2} y={room.y + room.height / 2 - .5} textAnchor="middle" fontSize={Math.min(1.6, room.width / 6)} fill="#243b30">{room.name}</text>
              <text x={room.x + room.width / 2} y={room.y + room.height / 2 + 1.4} textAnchor="middle" fontSize="1.2" fill="#526457">{room.width.toFixed(1)}′ × {room.height.toFixed(1)}′</text>
            </g>)}
          </svg>
          <p className="plan-warning">Concept geometry only · not for construction or permit submission</p>
        </div>
        <aside className="plan-details">
          <h3>Room schedule</h3>
          {plan.rooms.map(room => <div className="room-row" key={room.id}><span><i style={{ background: palette[room.kind] }} />{room.name}</span><strong>{roomArea(room).toFixed(0)} sq ft</strong></div>)}
          <div className="room-total"><span>Scheduled room area</span><strong>{plan.rooms.reduce((sum, room) => sum + roomArea(room), 0).toFixed(0)} sq ft</strong></div>
          <div className="plan-actions"><button className="primary-button" onClick={save}><FilePlus2 size={16} /> Save concept</button><button className="secondary-button" onClick={exportBrief}><Download size={15} /> Export concept brief</button></div>
        </aside>
      </div> : <p className="error" role="alert">The selected plot is too small or inputs are invalid for this starter layout. Try at least 16 ft × 18 ft and 1–8 bedrooms.</p>}
      {notice && <p className="project-notice" role="status">{notice}</p>}
      <div className="cloud-projects">
        <div className="saved-heading"><div className="eyebrow">OPTIONAL ACCOUNT SYNC</div><h3>Cloud projects</h3>
          <p>{apiBase ? 'Sign in to save concepts to your private account database. Your token stays in memory for this browser session only.' : 'Account storage is implemented in the API, but no API URL is configured for this frontend yet. Set VITE_API_BASE_URL when deploying the API and frontend.'}</p>
        </div>
        {apiBase && !apiToken && <form className="account-form" onSubmit={authenticate}>
          <div className="plan-toolbar" role="group" aria-label="Account action">
            <button type="button" className={authMode === 'register' ? 'plan-tab active' : 'plan-tab'} onClick={() => setAuthMode('register')}>Create account</button>
            <button type="button" className={authMode === 'login' ? 'plan-tab active' : 'plan-tab'} onClick={() => setAuthMode('login')}>Sign in</button>
          </div>
          <label htmlFor="account-email">Email</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="account-password">Password (minimum 12 characters for new accounts)</label><input id="account-password" type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} minLength={authMode === 'register' ? 12 : 1} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} />
          <button className="primary-button" type="submit" disabled={apiBusy}>{apiBusy ? 'Please wait…' : authMode === 'register' ? 'Create account' : 'Sign in'}</button>
        </form>}
        {apiBase && apiToken && <div className="cloud-session"><span>Signed in as {email}</span><button className="secondary-button" onClick={() => { setApiToken(null); setCloudProjects([]); setNotice('Signed out.'); }}>Sign out</button></div>}
        {apiToken && (cloudProjects.length ? cloudProjects.map(project => <article className="saved-project" key={project.id}>
          <div><strong>{project.title}</strong><span>{project.snapshots.length} saved version{project.snapshots.length === 1 ? '' : 's'} · Updated {new Date(project.updated_at).toLocaleDateString()}</span></div>
          <div className="saved-actions"><button onClick={() => cloudRename(project)} aria-label={`Rename cloud project ${project.title}`}>Rename</button><button onClick={() => cloudDuplicate(project)} aria-label={`Duplicate cloud project ${project.title}`}><Copy size={14} /></button><button onClick={() => cloudDelete(project)} aria-label={`Delete cloud project ${project.title}`}><Trash2 size={14} /></button></div>
        </article>) : <p className="empty-projects">No cloud projects yet. Save a concept while signed in to create one.</p>)}
      </div>
      <div className="saved-projects">
        <div className="saved-heading"><div className="eyebrow">ON THIS DEVICE</div><h3>Saved concepts</h3><p>These are stored in this browser only. They are not synced to an account or server.</p></div>
        {projects.length ? projects.map(project => <article className="saved-project" key={project.id}>
          <div><strong>{project.title}</strong><span>{project.snapshots.length} version{project.snapshots.length === 1 ? '' : 's'} · Updated {new Date(project.updatedAt).toLocaleDateString()}</span></div>
          <div className="saved-actions"><button aria-label={`Rename ${project.title}`} onClick={() => rename(project)} title="Rename"><span>Rename</span></button><button aria-label={`Duplicate ${project.title}`} onClick={() => duplicate(project)} title="Duplicate"><Copy size={14} /></button><button aria-label={`Delete ${project.title}`} onClick={() => remove(project)} title="Delete"><Trash2 size={14} /></button></div>
        </article>) : <p className="empty-projects">No saved concepts yet. Generate a layout and select “Save concept”.</p>}
      </div>
    </div>
  </section>;
}
