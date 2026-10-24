import type { PlanModel } from './plan-model';

export interface ProjectSnapshot {
  version: number;
  savedAt: string;
  title: string;
  input: { budget: number; plotWidthFt: number; plotDepthFt: number; bedrooms: number; location: string; floors?: number; finish?: 'basic' | 'standard' | 'premium'; buildingType?: string };
  plan?: PlanModel;
}
export interface LocalProject { id: string; title: string; createdAt: string; updatedAt: string; snapshots: ProjectSnapshot[] }
const STORAGE_KEY = 'juno-architects-projects-v1';

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `project-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function readAll(): LocalProject[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed as LocalProject[] : [];
  } catch { return []; }
}
function writeAll(projects: LocalProject[]): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
export function listProjects(): LocalProject[] { return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }

/** Creates a local-only project and its first immutable input snapshot. */
export function createProject(input: ProjectSnapshot['input'], plan?: PlanModel, title = 'My home concept'): LocalProject {
  const now = new Date().toISOString();
  const project: LocalProject = { id: makeId(), title, createdAt: now, updatedAt: now, snapshots: [{ version: 1, savedAt: now, title, input: { ...input }, ...(plan ? { plan } : {}) }] };
  writeAll([...readAll(), project]);
  return project;
}
export function renameProject(id: string, title: string): LocalProject[] {
  const clean = title.trim();
  if (!clean) throw new Error('Project name cannot be blank.');
  const projects = readAll().map(p => p.id === id ? { ...p, title: clean, updatedAt: new Date().toISOString() } : p);
  writeAll(projects); return listProjects();
}
export function duplicateProject(id: string): LocalProject {
  const source = readAll().find(p => p.id === id);
  if (!source) throw new Error('Project not found.');
  const now = new Date().toISOString();
  const copy: LocalProject = { ...structuredClone(source), id: makeId(), title: `${source.title} copy`, createdAt: now, updatedAt: now, snapshots: source.snapshots.map(s => ({ ...structuredClone(s), savedAt: now })) };
  writeAll([...readAll(), copy]); return copy;
}
export function deleteProject(id: string): LocalProject[] {
  const projects = readAll().filter(p => p.id !== id);
  writeAll(projects); return projects;
}
/** Appends a versioned snapshot; previous versions remain unchanged. */
export function addSnapshot(id: string, input: ProjectSnapshot['input'], plan?: PlanModel): LocalProject {
  const projects = readAll();
  const index = projects.findIndex(p => p.id === id);
  if (index < 0) throw new Error('Project not found.');
  const current = projects[index];
  const now = new Date().toISOString();
  const snapshot: ProjectSnapshot = { version: Math.max(0, ...current.snapshots.map(s => s.version)) + 1, savedAt: now, title: current.title, input: { ...input }, ...(plan ? { plan } : {}) };
  const updated = { ...current, updatedAt: now, snapshots: [...current.snapshots, snapshot] };
  projects[index] = updated; writeAll(projects); return updated;
}
